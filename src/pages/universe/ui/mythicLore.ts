import { createSignal, onMount } from 'solid-js'
import type { Text } from '@/shared/i18n'

type Lore = Record<string, Text>

let pending: Promise<Lore> | null = null

/** 우주적 존재의 전승 설명 (첫 화면 묶음에 넣지 않고 처음 부를 때 따로 받음) */
export const loadLore = (): Promise<Lore> =>
  (pending ??= import('../model/mythic/lore').then((m) => m.LORE))

/**
 * 컴포넌트에서 쓰는 전승 설명: 화면을 그린 뒤 한가할 때 받고, 받기 전에는 undefined.
 * 사전 렌더링한 HTML과 처음 이어받는 화면이 같도록 마운트한 뒤에만 받습니다.
 */
export function createLore() {
  const [lore, setLore] = createSignal<Lore>()
  onMount(() => {
    const load = () => void loadLore().then(setLore)
    if (typeof window.requestIdleCallback === 'function')
      window.requestIdleCallback(load, { timeout: 2000 })
    else setTimeout(load, 0)
  })
  return lore
}
