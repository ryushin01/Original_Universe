// README 화면(docs/images/*.jpg)과 공유 미리보기 그림(public/og-image.jpg)을 다시 찍습니다.
// 먼저 프로덕션 빌드를 띄워 두세요: pnpm build && pnpm preview
// 사용: BASE_URL=http://localhost:4183 pnpm screenshots
//       일부만: ONLY=og,home BASE_URL=... pnpm screenshots
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'http://localhost:4183'
const OUT = 'docs/images'
const ONLY = process.env.ONLY?.split(',').map((name) => name.trim())
// 기계가 바빠 3D가 느리게 그려지면 카메라가 자리를 잡을 때까지 더 기다림 (밀리초)
const SETTLE = Number(process.env.SETTLE ?? 0)
/** 찍을 묶음인지 (ONLY가 없으면 모두) */
const want = (...names) => !ONLY || names.some((name) => ONLY.includes(name))
// WebGL 장면이 그려지도록 소프트웨어 렌더러를 켭니다.
const browser = await chromium.launch({
  args: [
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
})

/** 3D 장면을 다 준비할 때까지 기다립니다(소프트웨어 렌더러에서는 15초 넘게 걸림). */
async function sceneReady(page) {
  await page.waitForTimeout(1000)
  await page.waitForFunction(
    () => !document.body.innerText.includes('준비하는 중'),
    null,
    { timeout: 120_000 },
  )
  // WebGL을 쓸 수 없다는 안내가 나오면 3D 장면 없이 찍지 않도록 멈춥니다.
  if (await page.getByText('WebGL을 쓸 수 없어').count()) {
    throw new Error('WebGL을 쓸 수 없어 3D 장면을 찍지 못했습니다.')
  }
  await page.waitForTimeout(3000)
}

async function open({
  viewport = { width: 1440, height: 900 },
  scale = 1,
  start = true,
} = {}) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    isMobile: scale > 1,
    locale: 'ko-KR',
  })
  const page = await context.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await sceneReady(page)
  if (start) {
    await page.getByRole('button', { name: '탐사 시작' }).click()
    await page.getByRole('heading', { name: '우주 관리' }).waitFor()
    await sceneReady(page)
  }
  return { page, context }
}

async function shot(page, name, wait = 2500) {
  await page.waitForTimeout(wait + SETTLE)
  await page.screenshot({
    path: `${OUT}/${name}.jpg`,
    type: 'jpeg',
    quality: 82,
  })
  console.log('저장', name)
}

/** 목적지 목록에서 고릅니다(버튼이나 라디오). */
const destination = (page, name) =>
  page
    .locator('button:not([role="tab"]), [role="radio"], label')
    .filter({ hasText: new RegExp(`^${name}$`) })
    .first()
    .click()

// 공유 미리보기 그림 (Open Graph 1200×630): 소개 화면
if (want('og')) {
  const { page, context } = await open({
    viewport: { width: 1200, height: 630 },
    start: false,
  })
  await page.waitForTimeout(2500 + SETTLE)
  await page.screenshot({
    path: 'public/og-image.jpg',
    type: 'jpeg',
    quality: 85,
  })
  console.log('저장 og-image')
  await context.close()
}

// 소개 화면
if (want('home')) {
  const { page, context } = await open({ start: false })
  await shot(page, 'home')
  await context.close()
}

// 태양계(지구 정보 카드)와 토성 근접
if (want('solar', 'saturn')) {
  const { page, context } = await open()
  await destination(page, '지구')
  await shot(page, 'solar', 3500)
  await destination(page, '토성')
  await shot(page, 'saturn', 4500)
  await context.close()
}

// 캐링턴급 태양 폭풍
if (want('storm')) {
  const { page, context } = await open()
  await page.getByRole('tab', { name: '태양 폭풍' }).click()
  await page.getByRole('button', { name: '코로나 질량 방출 일으키기' }).click()
  // 시뮬레이션 시간으로 10시간쯤 흘러 폭풍 껍질이 금성을 지나 지구 쪽으로 다가갈 때 멈춥니다(캐링턴급은 약 17시간에 지구 도착).
  const simTime = () =>
    page.evaluate(() => {
      const m = document.body.innerText.match(
        /시뮬레이션 날짜 \(UTC\)\s*(\d{4})\.(\d\d)\.(\d\d) (\d\d):(\d\d)/,
      )
      return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : 0
    })
  // 시간 속도를 가장 느리게 해 멈출 때를 놓치지 않게 합니다.
  const pace = page.getByRole('slider', { name: /시간 속도/ })
  await pace.focus()
  await pace.press('Home')
  const start = await simTime()
  await page.getByRole('button', { name: '시간 흐름 재생' }).click()
  await page.waitForFunction(
    (from) => {
      const m = document.body.innerText.match(
        /시뮬레이션 날짜 \(UTC\)\s*(\d{4})\.(\d\d)\.(\d\d) (\d\d):(\d\d)/,
      )
      return (
        m &&
        Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) - from >= 10 * 3_600_000
      )
    },
    start,
    { timeout: 120_000, polling: 50 },
  )
  await page.getByRole('button', { name: '시간 흐름 멈춤' }).click()
  await shot(page, 'storm')
  await context.close()
}

// 지나가는 항성 블랙홀
if (want('black-hole')) {
  const { page, context } = await open()
  await page.getByRole('tab', { name: '블랙홀' }).click()
  await page.getByRole('radio', { name: /항성 블랙홀/ }).check({ force: true })
  await page.getByRole('button', { name: '다가오게 하기' }).click()
  // 시간 속도를 가장 빠르게 해 블랙홀이 태양 가까이(18년 뒤) 올 때까지 흘립니다(근접 통과 중에는 저절로 느려짐).
  const speed = page.getByRole('slider', { name: /시간 속도/ })
  await speed.focus()
  await speed.press('End')
  await page.getByRole('button', { name: '시간 흐름 재생' }).click()
  // 시뮬레이션 날짜가 2042년(가장 가까워지는 무렵)이 되면 멈춥니다.
  await page.waitForFunction(
    () =>
      Number(
        document.body.innerText.match(
          /시뮬레이션 날짜 \(UTC\)\s*(\d{4})/,
        )?.[1] ?? 0,
      ) >= 2042,
    null,
    { timeout: 120_000, polling: 50 },
  )
  await page.getByRole('button', { name: '시간 흐름 멈춤' }).click()
  // 목적지를 블랙홀로 바꿔 정보 카드를 띄웁니다.
  const target = page.getByRole('combobox', { name: '목적지 바로 가기' })
  const value = await target.evaluate(
    (select) =>
      [...select.options].find((option) => option.text.includes('블랙홀'))
        ?.value,
  )
  if (value) await target.selectOption(value)
  await shot(page, 'black-hole')
  await context.close()
}

/** 우주적 존재를 불러내고 그 존재를 카메라로 따라감 */
async function summon(page, { being, rival, site, follow }) {
  await page.getByRole('tab', { name: '우주적 존재' }).click()
  await page.getByRole('combobox', { name: '불러낼 존재' }).selectOption(being)
  await page.getByRole('combobox', { name: '맞설 존재' }).selectOption(rival)
  await page.getByRole('radio', { name: site }).check({ force: true })
  await page
    .getByRole('button', { name: rival ? '격돌시키기' : '강림시키기' })
    .click()
  await page
    .getByRole('combobox', { name: '목적지 바로 가기' })
    .selectOption(`being:${follow}`)
}

// 우주적 존재: 태양 곁에서 맞붙은 주작과 현무
if (want('mythic')) {
  const { page, context } = await open()
  await summon(page, {
    being: 'vermilion-bird',
    rival: 'black-tortoise',
    site: '태양 곁',
    follow: 'vermilion-bird',
  })
  // 소프트웨어 렌더러에서는 카메라가 다가가는 데 오래 걸림
  await shot(page, 'mythic', 20_000)
  await context.close()
}

// 홀로 강림한 아펩이 해를 무는 모습 (전조로 태양 잠식)
if (want('descent')) {
  const { page, context } = await open()
  await summon(page, {
    being: 'apep',
    rival: '',
    site: '태양 곁',
    follow: 'apep',
  })
  // 첫 전조(태양 잠식)가 터질 때까지 1주/초로 흘림
  const pace = page.getByRole('slider', { name: /시간 속도/ })
  await pace.fill('2')
  await page.getByRole('button', { name: '시간 흐름 재생' }).click()
  await page
    .getByRole('region', { name: '사건 기록' })
    .getByText(/해를 물었습니다/)
    .waitFor({ timeout: 120_000 })
  await page.getByRole('button', { name: '시간 흐름 멈춤' }).click()
  // 초승달처럼 이지러진 해와 곁의 아펩이 함께 보이게 태양으로 다가감
  await page
    .getByRole('combobox', { name: '목적지 바로 가기' })
    .selectOption('sun')
  await shot(page, 'descent', 20_000)
  await context.close()
}

// 우리 은하, 우주 거대 구조
if (want('galaxy', 'cosmic')) {
  const { page, context } = await open()
  await page.getByRole('radio', { name: /우리 은하/ }).check({ force: true })
  await shot(page, 'galaxy', 5000)
  await page
    .getByRole('radio', { name: /우주 거대 구조/ })
    .check({ force: true })
  await shot(page, 'cosmic', 6000)
  await context.close()
}

// 모바일
if (want('mobile')) {
  const { page, context } = await open({
    viewport: { width: 390, height: 844 },
    scale: 2,
  })
  await shot(page, 'mobile')
  await context.close()
}

await browser.close()
