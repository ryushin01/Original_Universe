import { createSignal } from 'solid-js'

/** 3D 장면을 불러온 정도 (소개 화면의 불러오기 표시가 읽음) */
export interface SceneLoad {
  /** waiting: 아직 시작 전, loading: 불러오는 중, ready: 첫 장면을 그림, error: WebGL을 쓸 수 없음 */
  status: 'waiting' | 'loading' | 'ready' | 'error'
  /** WebGL을 열었음 */
  context: boolean
  /** 받은 텍스처 수 */
  loaded: number
  /** 받기 시작한 텍스처 수 */
  total: number
}

const [sceneLoad, setSceneLoad] = createSignal<SceneLoad>({
  status: 'waiting',
  context: false,
  loaded: 0,
  total: 0,
})

export { sceneLoad }

export const sceneLoadActions = {
  update(patch: Partial<SceneLoad>) {
    setSceneLoad((load) => ({ ...load, ...patch }))
  },
}
