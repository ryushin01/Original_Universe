import { axe, expect, start, test } from './helpers'

// 3D 화면의 성능: Web Vitals(LCP·CLS)와, 워커가 3D를 그리는 동안 버튼·패널이 바로 반응하는지.
// 3D는 Web Worker(OffscreenCanvas)가 그리므로 메인 스레드는 버튼 반응에 비어 있어야 합니다.
// 기준은 web.dev의 '좋음' 경계(LCP 2.5초, CLS 0.1, 상호작용 200ms)입니다.
// 상호작용은 입력을 처리하는 데 든 메인 스레드 시간(Event Timing의 processingStart~processingEnd)과
// 메인 스레드의 긴 작업으로 봅니다. 화면에 다음 그림이 나오기까지를 더한 INP 전체 시간과 메인 스레드 프레임은
// GPU 없는 CI(SwiftShader)가 워커의 3D를 CPU로 그리느라 합성이 늦어져 크게 흔들리므로(0.7~1.9초, 7fps)
// 기록만 남깁니다.

const GOOD = { lcp: 2_500, cls: 0.1, interaction: 200 }

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

test('3D가 시간을 흘리며 그리는 동안 탭·규모 버튼 입력을 200ms 안에 처리한다', async ({
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
    const store = {
      events: [0],
      processing: [0],
      longTasks: [0],
      frames: 0,
      slow: [''],
    }
    Reflect.set(window, '__responsiveness', store)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        store.events.push(entry.duration)
        const processing =
          Number(Reflect.get(entry, 'processingEnd')) -
          Number(Reflect.get(entry, 'processingStart'))
        store.processing.push(processing)
        // 실패하면 어느 조작이 느렸는지 알 수 있게 이름과 대상 글자를 남김
        const target: unknown = Reflect.get(entry, 'target')
        const text = target instanceof Element ? target.textContent : ''
        store.slow.push(
          `${entry.name} ${text?.trim().slice(0, 20)} 처리 ${Math.round(processing)}ms/전체 ${Math.round(entry.duration)}ms`,
        )
      }
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
      processing: Math.max(...list('processing')),
      longestTask: Math.max(...list('longTasks')),
      frames: Number(Reflect.get(store, 'frames')),
      details: String(Reflect.get(store, 'slow')),
    }
  })
  const fps = result.frames / seconds
  // CI 기록에서 값을 볼 수 있게 남김
  console.log(
    `반응 시간: 입력 처리 최대 ${Math.round(result.processing)}ms, 가장 긴 작업 ${Math.round(result.longestTask)}ms, INP 전체 ${Math.round(result.inp)}ms, 메인 스레드 ${fps.toFixed(1)}fps`,
  )
  expect
    .soft(result.processing, `입력 처리 시간(ms): ${result.details}`)
    .toBeLessThanOrEqual(GOOD.interaction)
  expect
    .soft(result.longestTask, '가장 긴 메인 스레드 작업(ms)')
    .toBeLessThanOrEqual(GOOD.interaction)
  await axe(page, '성능 검사 뒤')
})
