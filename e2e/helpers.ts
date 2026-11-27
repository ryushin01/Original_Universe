import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// WCAG 2.2 AA와 axe 권장 규칙(랜드마크·제목 순서 등)
const RULES = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
]

/** 이 주소들만 열어 둠: 나머지는 모두 끊긴 것처럼 막음 */
export const LOCAL = ['localhost', '127.0.0.1']

/**
 * 포트폴리오라 외부 서비스가 끊겨도 화면이 그대로 보여야 함.
 * 모든 E2E는 localhost 밖 주소를 찾지 못하게 막은 브라우저(playwright.config.ts의
 * --host-resolver-rules)에서 돌고, 페이지·워커·서비스 워커가 밖으로 요청을 하나라도 보내면 실패합니다.
 */
export const test = base.extend<{ external: string[] }>({
  external: [
    async ({ context }, use) => {
      const external: string[] = []
      context.on('request', (request) => {
        // data:·blob: 주소는 네트워크 요청이 아님
        const url = new URL(request.url())
        if (
          /^(https?|wss?):$/.test(url.protocol) &&
          !LOCAL.includes(url.hostname)
        )
          external.push(request.url())
      })
      await use(external)
      expect(external, '외부로 나간 요청').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

/**
 * 소개 화면을 지나 시뮬레이터로: 3D를 아직 불러오는 중이면 불러오기 화면의 건너뛰기,
 * 다 불러와 둘러보기가 열렸으면 첫 구간의 시작 버튼
 */
export async function start(page: Page, path = '/') {
  await page.goto(path)
  const skip = page.getByRole('button', { name: '소개 건너뛰고 탐사 시작' })
  if (await skip.isVisible())
    await skip.click({ timeout: 5_000 }).catch(() => {})
  const hero = page.locator('#intro-earth')
  if (await hero.count())
    await hero.getByRole('button', { name: '탐사 시작' }).click()
  await expect(page.getByRole('heading', { name: '우주 관리' })).toBeVisible()
}

/** Storybook의 addon-a11y가 스토리를 그린 직후 같은 axe를 돌리므로, 겹치면 끝나기를 기다렸다 다시 돌림 */
async function analyzeWhenFree(page: Page, builder: AxeBuilder) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await builder.analyze()
    } catch (error) {
      const busy =
        error instanceof Error &&
        error.message.includes('Axe is already running')
      if (!busy || attempt >= 10) throw error
      await page.waitForTimeout(500)
    }
  }
}

/** 컴포넌트 하나(Storybook 스토리)를 WCAG 2.2 AA 규칙으로 검사 */
export async function axeComponent(
  page: Page,
  selector: string,
  label: string,
) {
  const builder = new AxeBuilder({ page })
    .include(selector)
    .withTags(RULES.filter((tag) => tag !== 'best-practice'))
  const results = await analyzeWhenFree(page, builder)
  expect(
    results.violations.map((v) => `${label} ${v.id}: ${v.nodes.length}`),
  ).toEqual([])
}

export async function axe(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(RULES).analyze()
  expect(
    results.violations.map((v) => `${label} ${v.id}: ${v.nodes.length}`),
  ).toEqual([])
}
