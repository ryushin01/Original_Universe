import { axe, expect, start, test } from './helpers'

// 3D 화면의 성능: Web Vitals(LCP·CLS)와, 워커가 3D를 그리는 동안 버튼·패널이 바로 반응하는지(INP·프레임).
// 3D는 Web Worker(OffscreenCanvas)가 그리므로 메인 스레드는 버튼 반응에 비어 있어야 합니다.
// 기준은 web.dev의 '좋음' 경계(LCP 2.5초, CLS 0.1, INP 200ms)이고,
// GPU 없는 CI(SwiftShader)에서도 지키도록 3D 자체 속도는 재지 않습니다.

const GOOD = { lcp: 2_500, cls: 0.1, inp: 200 }

test.describe.configure({ mode: 'serial' })

test('첫 화면의 LCP와 CLS가 좋음 기준 안이다', async ({ page }) => {
  await page.addInitScript(() => {
    const vitals = { lcp: 0, cls: 0 }
    Reflect.set(window, '__vitals', vitals)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) vitals.lcp = entry.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if ('value' in entry && typeof entry.value === 'number')
          if (!('hadRecentInput' in entry) || !entry.hadRecentInput)
            vitals.cls += entry.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto('/')
  // LCP는 첫 화면을 다 받고 글꼴까지 그린 때의 값(3D를 불러오는 동안 바뀌는 소개 화면은 넣지 않음)
  await page.waitForLoadState('load')
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise((resolve) => setTimeout(resolve, 500))
  })
  const lcp = await page.evaluate(() =>
    Number(Reflect.get(Reflect.get(window, '__vitals'), 'lcp')),
  )
  // CLS는 3D 불러오기가 끝날 때까지 모두 더함
  await expect(page.locator('canvas')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole('progressbar')).toHaveCount(0, {
    timeout: 60_000,
  })
  const cls = await page.evaluate(() =>
    Number(Reflect.get(Reflect.get(window, '__vitals'), 'cls')),
  )
  expect(lcp).toBeGreaterThan(0)
  expect(lcp).toBeLessThanOrEqual(GOOD.lcp)
  expect(cls).toBeLessThanOrEqual(GOOD.cls)
})

test('3D가 시간을 흘리며 그리는 동안 탭·규모 버튼이 200ms 안에 반응한다', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await start(page)
  await expect(page.getByRole('progressbar')).toHaveCount(0, {
    timeout: 60_000,
  })
  // 시간이 흐르면 워커가 매 프레임 궤도·사건을 다시 그림
  await page.getByRole('button', { name: '시간 흐름 재생' }).click()

  // 상호작용 지연(Event Timing, 104ms 넘는 것만 기록됨)과 메인 스레드 긴 작업, 메인 스레드 프레임 수를 모음
  await page.evaluate(() => {
    const store = { events: [0], longTasks: [0], frames: 0 }
    Reflect.set(window, '__responsiveness', store)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) store.events.push(entry.duration)
    }).observe({ type: 'event' })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        store.longTasks.push(entry.duration)
    }).observe({ type: 'longtask' })
    const tick = () => {
      store.frames += 1
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

  const startedAt = Date.now()
  for (const name of ['태양 폭풍', '건설', '우주적 존재', '충돌']) {
    await page.getByRole('tab', { name, exact: true }).click()
    await expect(page.getByRole('tabpanel', { name })).toBeVisible()
  }
  for (const name of ['이웃 별', '태양계']) {
    await page
      .getByRole('radio', { name: new RegExp(name) })
      .check({ force: true })
    await expect(
      page.getByRole('radio', { name: new RegExp(name) }),
    ).toBeChecked()
  }
  await page.getByRole('button', { name: '시간 흐름 멈춤' }).click()
  const seconds = (Date.now() - startedAt) / 1000

  const result = await page.evaluate(() => {
    const store = Reflect.get(window, '__responsiveness')
    const list = (key: string) => {
      const value: unknown = Reflect.get(store, key)
      return Array.isArray(value) ? value.map(Number) : []
    }
    return {
      inp: Math.max(...list('events')),
      longestTask: Math.max(...list('longTasks')),
      frames: Number(Reflect.get(store, 'frames')),
    }
  })
  expect(result.inp, '가장 느린 상호작용(ms)').toBeLessThanOrEqual(GOOD.inp)
  expect(
    result.longestTask,
    '가장 긴 메인 스레드 작업(ms)',
  ).toBeLessThanOrEqual(GOOD.inp)
  // 메인 스레드가 막히지 않아 초당 20프레임 넘게 돎
  expect(result.frames / seconds).toBeGreaterThan(20)
  await axe(page, '성능 검사 뒤')
})
