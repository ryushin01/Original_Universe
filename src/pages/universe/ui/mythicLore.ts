import { createSignal, onMount } from 'solid-js'
import type { Text } from '@/shared/i18n'

type Lore = Record<string, Text>

let pending: Promise<Lore> | null = null

/**
 * 우주적 존재의 전승 설명 (첫 화면 묶음에 넣지 않고 처음 부를 때 따로 받음).
 * 받지 못하면 기억해 둔 실패를 지워 다음에 다시 받을 수 있게 함
 */
export function loadLore(): Promise<Lore> {
  pending ??= import('../model/mythic/lore')
    .then((m) => m.LORE)
    .catch((error: unknown) => {
      pending = null
      throw error
    })
  return pending
}

/** 받지 못했을 때 다시 시도하는 간격 (밀리초)과 횟수 */
const RETRY_MS = 5000
const RETRIES = 3

/**
 * 컴포넌트에서 쓰는 전승 설명: 화면을 그린 뒤 한가할 때 받고, 받기 전에는 undefined.
 * 사전 렌더링한 HTML과 처음 이어받는 화면이 같도록 마운트한 뒤에만 받습니다.
 */
export function createLore() {
  const [lore, setLore] = createSignal<Lore>()
  onMount(() => {
    let tries = 0
    const load = () =>
      loadLore()
        .then(setLore)
        // 잠깐 연결이 끊겼으면 조금 뒤 다시 (설명 없이도 화면은 그대로 씀)
        .catch(() => {
          tries += 1
          if (tries < RETRIES) setTimeout(load, RETRY_MS * tries)
        })
    if (typeof window.requestIdleCallback === 'function')
      window.requestIdleCallback(load, { timeout: 2000 })
    else setTimeout(load, 0)
  })
  return lore
}
