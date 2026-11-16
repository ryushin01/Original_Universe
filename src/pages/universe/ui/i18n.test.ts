import { createRoot } from 'solid-js'
import { both, setLocale } from '@/shared/i18n'
import { createActionMessage, messageEntries, t } from './i18n'

const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe('화면 문구', () => {
  it('모든 문구가 두 언어로 있고 자리 표시가 같다', () => {
    for (const [key, [ko, en]] of messageEntries()) {
      expect(ko, key).not.toBe('')
      expect(en, key).not.toBe('')
      expect(placeholders(ko), key).toEqual(placeholders(en))
    }
  })

  it('언어를 바꾸면 같은 키가 다른 문구를 낸다', () => {
    setLocale('en')
    expect(t('page.start')).toBe('Start exploring')
    setLocale('ko')
    expect(t('page.start')).toBe('탐사 시작')
  })
})

describe('조작 결과 안내', () => {
  it('실패한 결과는 오류 모양으로, 성공은 알림 모양으로 보여 주고 언어를 따라간다', () => {
    createRoot((dispose) => {
      const feedback = createActionMessage()
      expect(feedback.message()).toBe('')
      feedback.report({
        ok: false,
        message: both('예산이 모자랍니다.', 'Not enough budget.'),
      })
      expect(feedback.message()).toBe('예산이 모자랍니다.')
      expect(feedback.tone()).toBe('error')
      setLocale('en')
      expect(feedback.message()).toBe('Not enough budget.')
      setLocale('ko')
      feedback.say(() => t('page.start'))
      expect(feedback.message()).toBe('탐사 시작')
      expect(feedback.tone()).toBe('info')
      dispose()
    })
  })
})
