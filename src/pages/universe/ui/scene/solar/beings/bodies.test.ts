import { describe, expect, it, vi } from 'vitest'
import { PerspectiveCamera } from 'three'
import { BEINGS } from '../../../../model/mythic/catalog'
import { createBody } from './bodies'
import { BODIES, modelOf } from './bodySpecs'
import { MODEL_IDS } from './models'
import type { BodyFrame } from './body'
import type { ModelId } from './models'

// 모델은 주소로 받는 대신 public/models의 파일을 바로 해석 (장면과 같은 GLTFLoader·meshopt 해독기)
vi.mock('./models', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./models')>()
  const { GLTFLoader } =
    await import('three/examples/jsm/loaders/GLTFLoader.js')
  const { MeshoptDecoder } =
    await import('three/examples/jsm/libs/meshopt_decoder.module.js')
  await MeshoptDecoder.ready
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  // tsconfig에 node 타입을 넣지 않으므로 런타임 내장 모듈을 씀
  const fs = (
    globalThis as unknown as {
      process: {
        getBuiltinModule(id: 'node:fs'): {
          readFileSync(path: string): Uint8Array
        }
      }
    }
  ).process.getBuiltinModule('node:fs')
  return {
    ...actual,
    loadModel: async (id: ModelId) => {
      // 이 환경의 ArrayBuffer로 복사 (GLTFLoader가 instanceof로 이진 파일을 알아봄)
      const buffer = new Uint8Array(fs.readFileSync(`public/models/${id}.glb`))
        .buffer
      return actual.prepareModel(id, await loader.parseAsync(buffer, ''))
    },
  }
})

describe('우주적 존재의 3D 몸', () => {
  it('82종 모두 몸 표가 있고, 모델을 쓰는 몸은 있는 모델을 가리킨다', () => {
    const ids = new Set(BEINGS.map((being) => being.id))
    for (const being of BEINGS) {
      const spec = BODIES[being.id]
      expect(spec, being.id).toBeDefined()
      const model = modelOf(spec)
      if (model) expect(MODEL_IDS, being.id).toContain(model)
    }
    for (const id of Object.keys(BODIES)) expect(ids.has(id), id).toBe(true)
  })

  it('모든 존재의 몸을 만들어 움직이고, 공격·쓰러짐·정리까지 오류 없이 한다', async () => {
    const camera = new PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 5)
    camera.updateMatrixWorld()
    const frame: BodyFrame = {
      dt: 1 / 60,
      time: 0,
      opacity: 1,
      reducedMotion: false,
      camera,
      pixelScale: 400,
      pixelRatio: 1,
    }
    for (const being of BEINGS) {
      const body = await createBody(being)
      expect(body, being.id).not.toBeNull()
      let parts = 0
      body!.object.traverse(() => parts++)
      expect(parts, being.id).toBeGreaterThan(1)
      body!.update(frame)
      body!.strike()
      body!.update({ ...frame, time: 0.5 })
      body!.fall()
      body!.update({ ...frame, time: 1.5, reducedMotion: true })
      body!.dispose()
    }
  }, 60_000)
})
