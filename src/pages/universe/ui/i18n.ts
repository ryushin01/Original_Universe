import { createSignal } from 'solid-js'
import { interpolate, locale } from '@/shared/i18n'
import type { Params, Text } from '@/shared/i18n'
import { MESSAGES } from './messages'
import { PANEL_MESSAGES } from './panels/messages'

const ALL = { ...MESSAGES, ...PANEL_MESSAGES }

export type MessageKey = keyof typeof ALL

/** 화면 문구 (현재 언어). JSX 안에서 부르면 언어가 바뀔 때 다시 그립니다 */
export function t(key: MessageKey, params?: Params): string {
  return interpolate(ALL[key][locale() === 'en' ? 1 : 0], params)
}

/** 두 언어 문장 한 쌍에서 현재 언어 */
export const pick = (text: Text) => text[locale()]

/** 지금 언어가 아닌 쪽 (이름을 두 언어로 함께 적을 때) */
export const otherLocale = () => (locale() === 'ko' ? 'en' : 'ko')

/** 이름의 다른 언어 표기 (두 언어가 같으면 빈 문자열) */
export const pickOther = (text: Text) =>
  text[otherLocale()] === text[locale()] ? '' : text[otherLocale()]

/** 천체·존재 이름을 한 줄에 두 언어로: '지구 · Earth' (선택 목록처럼 글자만 쓰는 곳) */
export const bothNames = (text: Text) =>
  pickOther(text) ? `${pick(text)} · ${pickOther(text)}` : pick(text)

export const messageEntries = () =>
  Object.entries(ALL) as Array<[string, readonly [string, string]]>

/**
 * 언어를 바꿔도 다시 번역되는 안내문.
 * 문자열 대신 문구를 만드는 함수를 담아 두고 그릴 때 불러 지금 언어로 만듭니다.
 * (조작 결과처럼 한 번만 실행할 일은 함수 밖에서 먼저 실행한 뒤 결과만 담습니다)
 */
export function createMessage() {
  const [make, setMake] = createSignal<() => string>(() => '')
  const message = () => make()()
  const setMessage = (next: () => string) => setMake(() => next)
  return [message, setMessage] as const
}

/** 조작 결과: 성공 여부와 두 언어 안내문 (`ActionResult`와 같은 모양) */
interface Result {
  ok: boolean
  message: Text
}

/**
 * 패널의 조작 결과 안내. 실패하면 오류 모양(`tone: 'error'`)으로 보여 줍니다.
 * `report(result)`는 조작 결과를, `say(문구, 성공 여부)`는 화면에서 만든 문구를 띄웁니다.
 */
export function createActionMessage() {
  const [message, setMessage] = createMessage()
  const [failed, setFailed] = createSignal(false)
  const say = (make: () => string, ok = true) => {
    setFailed(!ok)
    setMessage(make)
  }
  const report = (result: Result) => {
    // 결과 문구는 두 언어를 함께 가지므로 언어를 바꾸면 다시 번역됨
    say(() => pick(result.message), result.ok)
  }
  const tone = (): 'info' | 'error' => (failed() ? 'error' : 'info')
  return { message, tone, report, say }
}
