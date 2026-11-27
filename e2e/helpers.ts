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
 * 모든 E2E가 localhost 밖 요청을 막은 채 돌고(페이지·서비스 워커 요청 모두 context에서 막음),
 * 막힌 요청이 하나라도 있으면 실패합니다.
 */
export const test = base.extend<{ external: string[] }>({
  external: [
    async ({ context }, use) => {
      const external: string[] = []
      await context.route(
        (url) => !LOCAL.includes(url.hostname),
        (route) => {
          external.push(route.request().url())
          return route.abort('internetdisconnected')
        },
      )
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

export async function axe(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(RULES).analyze()
  expect(
    results.violations.map((v) => `${label} ${v.id}: ${v.nodes.length}`),
  ).toEqual([])
}
