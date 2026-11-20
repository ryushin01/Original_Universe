import type { SceneLoad } from '../viewport/sceneLoad'

/**
 * 불러오기 진행률 (0~1).
 * 첫 화면·글꼴 0.1, WebGL을 열면 0.25, 텍스처를 받는 동안 0.25~0.9,
 * 첫 장면을 그리고 시작한 텍스처를 다 받으면 1. WebGL을 쓸 수 없으면 기다리지 않고 1
 */
export function loadProgress(load: SceneLoad, fontsReady: boolean): number {
  if (load.status === 'error') return 1
  let progress = fontsReady ? 0.1 : 0.04
  if (load.context) progress = Math.max(progress, 0.25)
  if (load.total > 0)
    progress = Math.max(progress, 0.25 + (0.65 * load.loaded) / load.total)
  if (load.status === 'ready')
    progress = load.loaded >= load.total ? 1 : Math.max(progress, 0.9)
  return Math.min(1, progress)
}

/** 진행률에 맞는 준비 문구 번호 (0 ~ count − 1) */
export const stageIndex = (progress: number, count: number) =>
  Math.min(count - 1, Math.floor(progress * count))
