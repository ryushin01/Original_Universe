import { createEffect, createRoot, createSignal } from 'solid-js'
import { moveStorageKey } from '../lib/storage'

export type Locale = 'ko' | 'en'

export const LOCALES: Locale[] = ['ko', 'en']
const STORAGE_KEY = 'original-universe:locale'
/** 이름을 바꾸기 전(1.0.0까지)의 키. 처음 불러올 때 STORAGE_KEY로 옮김 */
const LEGACY_STORAGE_KEY = 'universe-simulator:locale'

// 사전 렌더링은 한국어, 브라우저에서 저장된 값으로 바꿉니다
const [locale, setLocaleSignal] = createSignal<Locale>('ko')

export { locale }

export function setLocale(next: Locale) {
  setLocaleSignal(next)
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // 저장이 막혀도 이번 화면에서는 바뀐 언어를 씁니다
  }
}

let synced = false

/** 저장된 언어를 불러오고 <html lang>을 맞춥니다 (브라우저에서 한 번 호출) */
export function syncLocale() {
  if (synced || typeof window === 'undefined') return
  synced = true
  try {
    moveStorageKey(window.localStorage, LEGACY_STORAGE_KEY, STORAGE_KEY)
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'ko' || saved === 'en') setLocaleSignal(saved)
  } catch {
    // 무시
  }
  createRoot(() => {
    createEffect(() => {
      document.documentElement.lang = locale()
    })
  })
}
