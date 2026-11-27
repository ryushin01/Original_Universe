import type { Page } from '@playwright/test'
import { axe, expect, start, test } from './helpers'

// 포트폴리오라 외부 서비스가 끊겨도 화면이 그대로 보여야 함.
// 모든 E2E는 helpers의 test로 localhost 밖 요청을 막고 돌며(외부 요청이 하나라도 있으면 실패),
// 여기서는 첫 방문의 3D 불러오기와, 설치 뒤 localhost까지 끊긴 다시 방문을 확인합니다.

const logText = (page: Page) => page.getByRole('region', { name: '사건 기록' })

/** 페이지·워커가 받지 못한 파일(텍스처·모델·글꼴·코드 조각)을 모음 */
function watchFailures(page: Page) {
  const failed: string[] = []
  const errors: string[] = []
  page.on('requestfailed', (request) => {
    // 다시 열거나 다른 주소로 옮길 때 받던 중 끊은 요청(ERR_ABORTED)은 빠진 파일이 아님
    if (request.failure()?.errorText !== 'net::ERR_ABORTED')
      failed.push(request.url())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  return { failed, errors }
}

async function waitFor3D(page: Page) {
  await expect(page.locator('canvas')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole('progressbar')).toHaveCount(0, {
    timeout: 60_000,
  })
}

const SCALES = ['이웃 별', '우리 은하', '국부 은하군', '우주 거대 구조']

async function visitScales(page: Page, label: string) {
  for (const name of SCALES) {
    await page
      .getByRole('radio', { name: new RegExp(name) })
      .check({ force: true })
    await expect(page.getByRole('group', { name, exact: true })).toBeVisible()
    await axe(page, `${label} ${name}`)
  }
  await page.getByRole('radio', { name: /태양계/ }).check({ force: true })
}

/** 이름난 별·폭발한 별·이웃 은하를 목적지 바로 가기(키보드로 고르는 목록)로 고르면 지연 조각의 설명까지 뜸 */
async function famousObjects(page: Page, label: string) {
  const goTo = page.getByRole('combobox', { name: '목적지 바로 가기' })
  const picks = [
    { scale: '이웃 별', id: 'sirius', text: '천랑성 · 큰개자리 α' },
    { scale: '우리 은하', id: 'kepler', text: /케플러보다 나흘 먼저/ },
    { scale: '국부 은하군', id: 'm87', text: /M87\*: 태양의 약 65억 배/ },
  ]
  for (const { scale, id, text } of picks) {
    await page
      .getByRole('radio', { name: new RegExp(scale) })
      .check({ force: true })
    await goTo.selectOption(id)
    await expect(page.getByText(text)).toBeVisible()
    await axe(page, `${label} ${id}`)
  }
  await page.getByRole('radio', { name: /태양계/ }).check({ force: true })
}

/** 신화 모드: 존재 둘을 격돌시키면 3D 모델(models/)과 격돌 코드 조각을 받아 그림 */
async function clash(page: Page) {
  await page.getByRole('tab', { name: '우주적 존재' }).click()
  await page
    .getByRole('combobox', { name: '불러낼 존재' })
    .selectOption('azure-dragon')
  await page
    .getByRole('combobox', { name: '맞설 존재' })
    .selectOption('white-tiger')
  await page.getByRole('button', { name: '격돌시키기' }).click()
  await expect(logText(page)).toContainText('청룡과 백호가 맞붙었습니다')
  await page.getByRole('button', { name: '청룡 따라가기' }).click()
  // 존재 모델을 받아 그릴 시간
  await page.waitForTimeout(3_000)
}

/** 아펩 미션을 시작해 맞서지 않고 시간을 흘리면 결과 대화상자가 뜸 */
async function missionResult(page: Page) {
  await page
    .getByRole('region', { name: '미션' })
    .getByRole('listitem')
    .filter({ hasText: '아펩을 막아라' })
    .getByRole('button', { name: '시작' })
    .click()
  // 1년/초로 흘려 120일 기한을 넘김
  await page.getByRole('slider', { name: '시간 속도 (화면 1초마다)' }).fill('4')
  await page.getByRole('button', { name: '시간 흐름 재생' }).click()
  const result = page.getByRole('dialog', { name: /미션 (성공|실패)/ })
  await expect(result).toBeVisible({ timeout: 40_000 })
  await axe(page, '미션 결과')
  await result.getByRole('button', { name: '자유 모드로' }).click()
  await expect(result).toBeHidden()
}

/** 지금 장면을 이름 붙여 저장하고 다시 불러옴(브라우저 저장소) */
async function saveAndLoad(page: Page) {
  const share = page.getByRole('region', { name: '현황' })
  await page.getByText('공유·저장').click()
  await share.getByRole('textbox', { name: '저장 이름' }).fill('오프라인 장면')
  await share.getByRole('button', { name: '저장', exact: true }).click()
  await expect(share.getByRole('status').last()).toContainText(
    '‘오프라인 장면’(으)로 저장했습니다',
  )
  await share.getByRole('button', { name: '오프라인 장면 불러오기' }).click()
  await expect(share.getByRole('status').last()).toContainText(
    '‘오프라인 장면’을(를) 불러왔습니다',
  )
}

test('외부 요청을 모두 막아도 3D 우주와 시뮬레이터가 뜨고 axe를 통과한다', async ({
  page,
}) => {
  // 불러오기부터 시뮬레이션까지 한 테스트에서 하므로 다른 흐름 테스트보다 넉넉히
  test.setTimeout(120_000)
  const { failed, errors } = watchFailures(page)

  await page.goto('/')
  // 3D 모델·텍스처·글꼴을 모두 저장소에서 내려주므로 불러오기가 끝까지 감
  await waitFor3D(page)
  await start(page)
  await page.getByRole('tab', { name: '태양 폭풍' }).click()
  await page.getByRole('button', { name: '코로나 질량 방출 일으키기' }).click()
  await page.getByRole('button', { name: '시간 흐름 재생' }).click()
  await expect(logText(page)).toContainText('지구에 닿았습니다', {
    timeout: 15_000,
  })
  await axe(page, 'offline')

  // 글꼴도 저장소의 파일로 그려짐
  expect(await page.evaluate(() => document.fonts.status)).toBe('loaded')
  expect(failed).toEqual([])
  expect(errors).toEqual([])
})

test('처음 방문: 다섯 규모·신화 모드·미션 결과·저장 불러오기가 외부 없이 된다', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const { failed, errors } = watchFailures(page)
  await start(page)
  await visitScales(page, '첫 방문')
  await famousObjects(page, '첫 방문')
  await clash(page)
  await axe(page, '신화 모드')
  await page.reload()
  await start(page)
  await missionResult(page)
  await saveAndLoad(page)
  expect(failed).toEqual([])
  expect(errors).toEqual([])
})

test('설치 뒤 인터넷과 서버가 모두 끊겨도 다시 방문하면 모든 화면이 뜬다', async ({
  page,
  context,
}) => {
  test.setTimeout(240_000)
  // 첫 방문: 서비스 워커가 켜지며 나중에 쓰는 코드 조각·3D 모델·텍스처·글꼴까지 미리 받아 둠
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })

  // 다시 방문: localhost까지 끊어 서비스 워커 캐시만으로 열림
  await context.setOffline(true)
  const { failed, errors } = watchFailures(page)
  await page.reload()
  await waitFor3D(page)
  await start(page)
  await axe(page, '다시 방문')
  await visitScales(page, '다시 방문')
  // 별·은하 설명(지연 조각)도 캐시에서
  await famousObjects(page, '다시 방문')
  // 첫 방문에 열지 않은 신화 모드(지연 불러오기 코드·모델)도 캐시에서
  await clash(page)
  await page.reload()
  await start(page)
  await missionResult(page)
  await saveAndLoad(page)

  // 공유 링크로 열어도 캐시의 첫 화면이 장면을 이어받음
  await page.getByRole('button', { name: '공유 링크 복사' }).click()
  // 클립보드를 못 쓰면 주소창에 넣어 줌
  const copied = await page.evaluate(() =>
    navigator.clipboard.readText().catch(() => ''),
  )
  const shared = copied.includes('?s=') ? copied : page.url()
  expect(shared).toContain('?s=')
  await page.goto(shared)
  await expect(page.getByRole('heading', { name: '우주 관리' })).toBeVisible()
  await expect(page.getByRole('button', { name: '탐사 시작' })).toHaveCount(0)

  // 영어로 바꿔도 글꼴·문구가 캐시에서
  await page.getByRole('button', { name: 'English' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await axe(page, '다시 방문 영어')

  expect(await page.evaluate(() => document.fonts.status)).toBe('loaded')
  expect(failed).toEqual([])
  expect(errors).toEqual([])
})

test('Storybook도 외부 없이 스토리를 그린다', async ({ page, request }) => {
  const index: unknown = await (
    await request.get('/storybook/index.json')
  ).json()
  const entries =
    typeof index === 'object' && index && 'entries' in index
      ? Object.values(index.entries ?? {})
      : []
  const story = entries.find(
    (entry): entry is { id: string } =>
      typeof entry === 'object' &&
      entry !== null &&
      'type' in entry &&
      entry.type === 'story' &&
      'id' in entry &&
      typeof entry.id === 'string',
  )
  expect(story).toBeDefined()
  await page.goto('/storybook/')
  await expect(page.locator('#storybook-preview-iframe')).toBeVisible()
  await page.goto(`/storybook/iframe.html?id=${story?.id}&viewMode=story`)
  await expect(page.locator('#storybook-root')).not.toBeEmpty()
  // 글꼴도 Storybook 묶음 안의 파일로 다 받아짐
  expect(
    await page.evaluate(async () => {
      await document.fonts.ready
      return document.fonts.status
    }),
  ).toBe('loaded')
})
