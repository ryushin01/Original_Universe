import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { axeComponent, expect, start, test } from './helpers'

// 시각 회귀: 주요 화면(데스크톱·모바일)과 Storybook 스토리를 기준 그림과 비교합니다.
// - 3D(WebGL 캔버스)와 그 위 이름표는 소프트웨어 렌더링·시점에 따라 달라 찍기 전에 멈추고 빼냄
// - 애니메이션은 멈추고(animations: 'disabled'), 동작 줄이기를 켜고, 날짜는 고정
// - 글꼴은 저장소의 파일만 쓰고, 다 받은 뒤 찍음
// 기준 그림은 Linux CI와 같은 Playwright 공식 Docker 이미지에서 만듭니다(docs/development.md).

const FIXED_NOW = new Date('2026-01-01T03:00:00Z')
// 장비가 바쁠 때 화면 한 장을 찍는 데 몇 초 걸림
const SHOT_TIMEOUT = 30_000
// 3D 위에 겹친 천체 이름표와 3D 불러오기 안내는 찍을 때 숨김
const HIDE_3D = fileURLToPath(new URL('./visual.css', import.meta.url))

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
]

async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
  })
}

/**
 * 3D를 비교에서 뺌: 탭이 숨은 것처럼 알려 워커의 그리기를 멈추고(앱이 숨은 탭에서 쓰는 동작) 캔버스를 뗌.
 * 소프트웨어 WebGL이 매 프레임 그리는 동안에는 화면 한 장을 찍는 데 수십 초가 걸리고 그림도 계속 바뀜
 */
async function freeze3D(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    })
    document.dispatchEvent(new Event('visibilitychange'))
    // 워커로 넘긴 캔버스는 CSS로 숨겨도 마지막 그림이 남을 때가 있어 문서에서 떼어 냄
    for (const canvas of document.querySelectorAll('canvas')) canvas.remove()
  })
}

async function snap(page: Page, name: string) {
  await settle(page)
  await freeze3D(page)
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: false,
    stylePath: HIDE_3D,
    timeout: SHOT_TIMEOUT,
  })
}

test.use({ reducedMotion: 'reduce' })

for (const viewport of VIEWPORTS) {
  test.describe(`주요 화면 ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })
    // 화면마다 3D를 불러온 뒤 여러 장을 찍으므로 넉넉히
    test.describe.configure({ timeout: 180_000 })

    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(FIXED_NOW)
    })

    test('소개 화면', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('progressbar')).toHaveCount(0, {
        timeout: 60_000,
      })
      await expect(
        page.locator('#intro-earth').getByRole('button', { name: '탐사 시작' }),
      ).toBeVisible()
      await snap(page, `${viewport.name}-intro`)
    })

    test('시뮬레이터: 태양계·우주적 존재·우리 은하·영어', async ({ page }) => {
      await start(page)
      await snap(page, `${viewport.name}-solar`)
      await page.getByRole('tab', { name: '우주적 존재' }).click()
      await snap(page, `${viewport.name}-mythic`)
      await page
        .getByRole('radio', { name: /우리 은하/ })
        .check({ force: true })
      await expect(
        page.getByRole('group', { name: '우리 은하', exact: true }),
      ).toBeVisible()
      await snap(page, `${viewport.name}-galaxy`)
      await page.getByRole('button', { name: 'English' }).click()
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await snap(page, `${viewport.name}-english`)
    })
  })
}

/** Storybook 묶음의 스토리 id 목록 (먼저 pnpm build:all로 만든 dist/client/storybook/index.json) */
function storyIds(): string[] {
  const file = new URL('../dist/client/storybook/index.json', import.meta.url)
  if (!existsSync(file)) return []
  const index: unknown = JSON.parse(readFileSync(file, 'utf8'))
  if (typeof index !== 'object' || index === null || !('entries' in index))
    return []
  const entries = index.entries
  if (typeof entries !== 'object' || entries === null) return []
  return Object.values(entries).flatMap((entry: unknown) =>
    typeof entry === 'object' &&
    entry !== null &&
    'type' in entry &&
    entry.type === 'story' &&
    'id' in entry &&
    typeof entry.id === 'string'
      ? [entry.id]
      : [],
  )
}

const STORIES = storyIds()

test.describe('Storybook 스토리', () => {
  test('스토리 목록이 있다', () => {
    expect(STORIES.length).toBeGreaterThan(0)
  })

  for (const id of STORIES) {
    test(`${id}: 기준 그림과 같고 axe 오류가 없다`, async ({ page }) => {
      await page.goto(`/storybook/iframe.html?id=${id}&viewMode=story`)
      const root = page.locator('#storybook-root')
      await expect(root.locator('*').first()).toBeAttached({
        timeout: SHOT_TIMEOUT,
      })
      await settle(page)
      // addon-a11y처럼 스토리 영역만 WCAG 2.2 AA로 검사해 오류가 하나라도 있으면 실패
      // (랜드마크·h1 같은 페이지 단위 권장 규칙은 컴포넌트 하나에는 맞지 않음)
      await axeComponent(page, '#storybook-root', `story ${id}`)
      await expect(root).toHaveScreenshot(`story-${id}.png`, {
        timeout: SHOT_TIMEOUT,
      })
    })
  }
})
