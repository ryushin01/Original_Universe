/**
 * 우주적 존재의 3D 몸 만들기 (장면이 존재를 처음 그릴 때 따로 받는 묶음)
 * 몸 표(bodySpecs.ts)에 따라 모델을 받거나 계산으로 몸을 짓습니다.
 */
import type { Being } from '../../../../model/mythic/catalog'
import type { Body3D } from './body'
import { BODIES } from './bodySpecs'
import { createModelBody } from './modelBody'
import { loadModel } from './models'
import { createSerpentBody } from './serpent'
import {
  createBlobBody,
  createColourBody,
  createEyeBody,
  createGlobesBody,
  createHarvesterBody,
  createVoidBody,
  createWheelsBody,
  createWingedBody,
} from './shapes'
import { createSwarmBody } from './swarm'

/** 존재마다 같은 무늬가 나오게 하는 씨앗 */
function seedOf(id: string) {
  return [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
}

/** 존재의 3D 몸 (몸 표에 없으면 null: 별자리 그림으로 그림) */
export async function createBody(being: Being): Promise<Body3D | null> {
  const spec = BODIES[being.id]
  if (!spec) return null
  const color = being.color
  const seed = seedOf(being.id)
  switch (spec.kind) {
    case 'model':
      return createModelBody(await loadModel(spec.model), {
        color,
        scale: spec.scale,
        extras: spec.extras,
        ghosts: spec.ghosts,
        seed,
      })
    case 'swarm':
      return createSwarmBody(
        await loadModel(spec.model),
        spec.count,
        color,
        seed,
      )
    case 'serpent':
      return createSerpentBody(spec.style, color, spec)
    case 'void':
      return createVoidBody(color, seed)
    case 'globes':
      return createGlobesBody(color, seed)
    case 'blob':
      return createBlobBody(color, seed, spec.tentacles, spec.wings ?? false)
    case 'eye':
      return createEyeBody(color, seed)
    case 'wheels':
      return createWheelsBody(color)
    case 'harvester':
      return createHarvesterBody(color)
    case 'winged':
      return createWingedBody(color, spec.pairs, spec.faces ?? 0)
    case 'colour':
      return createColourBody(color, seed)
  }
}
