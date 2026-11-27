import { createSignal, onMount } from 'solid-js'

type Details = typeof import('../model/details')

let pending: Promise<Details> | null = null

/**
 * 천체 설명 묶음 (첫 화면 묶음에 넣지 않고 처음 부를 때 따로 받음).
 * 받지 못하면 기억해 둔 실패를 지워 다음에 다시 받을 수 있게 함
 */
export function loadSkyDetails(): Promise<Details> {
  pending ??= import('../model/details').catch((error: unknown) => {
    pending = null
    throw error
  })
  return pending
}

/** 받지 못했을 때 다시 시도하는 간격 (밀리초)과 횟수 */
const RETRY_MS = 5000
const RETRIES = 3

/**
 * 컴포넌트에서 쓰는 천체 설명: 마운트한 뒤 바로 받고, 받기 전에는 undefined.
 * 사전 렌더링한 HTML과 처음 이어받는 화면이 같도록 마운트한 뒤에만 받습니다.
 */
export function createSkyDetails() {
  const [details, setDetails] = createSignal<Details>()
  onMount(() => {
    let tries = 0
    const load = () =>
      loadSkyDetails()
        .then(setDetails)
        // 잠깐 연결이 끊겼으면 조금 뒤 다시 (설명 없이도 카드의 수치는 그대로 보임)
        .catch(() => {
          tries += 1
          if (tries < RETRIES) setTimeout(load, RETRY_MS * tries)
        })
    load()
  })
  return details
}

/** 한가할 때 미리 받아 둠 (다른 규모로 옮겨 정보 카드를 열 때 설명이 늦게 뜨지 않게) */
export function preloadSkyDetails() {
  const load = () => void loadSkyDetails().catch(() => undefined)
  if (typeof window.requestIdleCallback === 'function')
    window.requestIdleCallback(load, { timeout: 4000 })
  else setTimeout(load, 0)
}
