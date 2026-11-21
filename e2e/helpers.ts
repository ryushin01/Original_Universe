import { expect } from '@playwright/test'
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
