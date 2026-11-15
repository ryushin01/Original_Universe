// README 화면(docs/images/*.jpg)을 다시 찍습니다.
// 먼저 프로덕션 빌드를 띄워 두세요: pnpm build && pnpm preview
// 사용: BASE_URL=http://localhost:4183 pnpm screenshots
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'http://localhost:4183'
const OUT = 'docs/images'
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
  await page.waitForTimeout(wait)
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

/** 시간을 잠시 흐르게 한 뒤 멈춥니다. */
async function run(page, ms) {
  await page.getByRole('button', { name: '시간 흐름 재생' }).click()
  await page.waitForTimeout(ms)
  await page.getByRole('button', { name: '시간 흐름 멈춤' }).click()
}

// 소개 화면
{
  const { page, context } = await open({ start: false })
  await shot(page, 'home')
  await context.close()
}

// 태양계(지구 정보 카드)와 토성 근접
{
  const { page, context } = await open()
  await destination(page, '지구')
  await shot(page, 'solar', 3500)
  await destination(page, '토성')
  await shot(page, 'saturn', 4500)
  await context.close()
}

// 캐링턴급 태양 폭풍
{
  const { page, context } = await open()
  await page.getByRole('tab', { name: '태양 폭풍' }).click()
  await page.getByRole('button', { name: '코로나 질량 방출 일으키기' }).click()
  await run(page, 6000)
  await shot(page, 'storm')
  await context.close()
}

// 지나가는 항성 블랙홀
{
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

// 우리 은하, 우주 거대 구조
{
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
{
  const { page, context } = await open({
    viewport: { width: 390, height: 844 },
    scale: 2,
  })
  await shot(page, 'mobile')
  await context.close()
}

await browser.close()
