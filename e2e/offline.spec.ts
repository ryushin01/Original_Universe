import { expect, test } from '@playwright/test'
import { axe, start } from './helpers'

// 포트폴리오라 외부 서비스가 끊겨도 화면이 그대로 보여야 함.
// localhost 밖으로 나가는 요청을 모두 막고, 막힌 요청을 모아 없는지 확인
const LOCAL = ['localhost', '127.0.0.1']

test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => !LOCAL.includes(url.hostname),
    (route) => route.abort('internetdisconnected'),
  )
})

test('외부 요청을 모두 막아도 3D 우주와 시뮬레이터가 뜨고 axe를 통과한다', async ({
  page,
}) => {
  // 불러오기부터 시뮬레이션까지 한 테스트에서 하므로 다른 흐름 테스트보다 넉넉히
  test.setTimeout(120_000)
  const external: string[] = []
  const errors: string[] = []
  page.on('request', (request) => {
    if (!LOCAL.includes(new URL(request.url()).hostname))
      external.push(request.url())
  })
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/')
  // 3D 모델·텍스처·글꼴을 모두 저장소에서 내려주므로 불러오기가 끝까지 감
  await expect(page.locator('canvas')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole('progressbar')).toHaveCount(0, {
    timeout: 60_000,
  })
  await start(page)
  await page.getByRole('tab', { name: '태양 폭풍' }).click()
  await page.getByRole('button', { name: '코로나 질량 방출 일으키기' }).click()
  await page.getByRole('button', { name: '시간 흐름 재생' }).click()
  await expect(page.getByRole('region', { name: '사건 기록' })).toContainText(
    '지구에 닿았습니다',
    { timeout: 15_000 },
  )
  await axe(page, 'offline')

  // 글꼴도 저장소의 파일로 그려짐
  expect(await page.evaluate(() => document.fonts.status)).toBe('loaded')
  expect(external).toEqual([])
  expect(errors).toEqual([])
})
