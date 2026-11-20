import { describe, expect, it } from 'vitest'
import { loadProgress, stageIndex } from './loading'
import type { SceneLoad } from '../viewport/sceneLoad'

const load = (patch: Partial<SceneLoad> = {}): SceneLoad => ({
  status: 'loading',
  context: false,
  loaded: 0,
  total: 0,
  ...patch,
})

describe('loadProgress', () => {
  it('첫 화면 → WebGL → 텍스처 → 첫 장면 순서로 늘어난다', () => {
    const steps = [
      loadProgress(load({ status: 'waiting' }), false),
      loadProgress(load(), true),
      loadProgress(load({ context: true }), true),
      loadProgress(load({ context: true, loaded: 3, total: 10 }), true),
      loadProgress(load({ context: true, loaded: 10, total: 10 }), true),
      loadProgress(
        load({ status: 'ready', context: true, loaded: 10, total: 10 }),
        true,
      ),
    ]
    expect(steps).toEqual([...steps].sort((a, b) => a - b))
    expect(steps.at(-1)).toBe(1)
    expect(steps.at(-2)).toBeCloseTo(0.9)
  })

  it('첫 장면을 그려도 받는 텍스처가 남으면 끝나지 않는다', () => {
    expect(
      loadProgress(
        load({ status: 'ready', context: true, loaded: 4, total: 10 }),
        true,
      ),
    ).toBeCloseTo(0.9)
  })

  it('WebGL을 쓸 수 없으면 기다리지 않는다', () => {
    expect(loadProgress(load({ status: 'error' }), false)).toBe(1)
  })
})

describe('stageIndex', () => {
  it('진행률을 문구 번호로 나누고 마지막 번호를 넘지 않는다', () => {
    expect(stageIndex(0, 8)).toBe(0)
    expect(stageIndex(0.5, 8)).toBe(4)
    expect(stageIndex(1, 8)).toBe(7)
  })
})
