import type { ScaleId } from '../../model/view'
import type { MessageKey } from '../i18n'

export type StopId =
  'earth' | 'moon' | 'saturn' | 'neptune' | 'galaxy' | 'reentry'

/** 소개 둘러보기의 한 구간: 스크롤해 머물면 카메라가 그 천체(또는 규모 전체)로 감 */
export interface JourneyStop {
  id: StopId
  scale: ScaleId
  /** 따라갈 천체 (null이면 규모 전체) */
  focus: string | null
  /** 상단 메뉴와 아래 구간 표시의 짧은 이름 */
  nav: MessageKey
  /** 천체와 좌표·거리 표지 */
  place: MessageKey
  /** 구간 제목 (첫 구간은 로고가 제목) */
  title?: MessageKey
  body: MessageKey
}

export const JOURNEY: readonly JourneyStop[] = [
  {
    id: 'earth',
    scale: 'solar',
    focus: 'earth',
    nav: 'intro.earth.nav',
    place: 'intro.earth.place',
    body: 'page.lead',
  },
  {
    id: 'moon',
    scale: 'solar',
    focus: 'moon',
    nav: 'intro.moon.nav',
    place: 'intro.moon.place',
    title: 'intro.moon.title',
    body: 'intro.moon.body',
  },
  {
    id: 'saturn',
    scale: 'solar',
    focus: 'saturn',
    nav: 'intro.saturn.nav',
    place: 'intro.saturn.place',
    title: 'intro.saturn.title',
    body: 'intro.saturn.body',
  },
  {
    id: 'neptune',
    scale: 'solar',
    focus: 'neptune',
    nav: 'intro.neptune.nav',
    place: 'intro.neptune.place',
    title: 'intro.neptune.title',
    body: 'intro.neptune.body',
  },
  {
    id: 'galaxy',
    scale: 'galaxy',
    focus: null,
    nav: 'intro.galaxy.nav',
    place: 'intro.galaxy.place',
    title: 'intro.galaxy.title',
    body: 'intro.galaxy.body',
  },
  {
    id: 'reentry',
    scale: 'solar',
    focus: 'earth',
    nav: 'intro.reentry.nav',
    place: 'intro.reentry.place',
    title: 'intro.reentry.title',
    body: 'intro.reentry.body',
  },
]

/** 구간 요소의 id (상단 메뉴의 #링크가 가리킴) */
export const stopElementId = (id: StopId) => `intro-${id}`
