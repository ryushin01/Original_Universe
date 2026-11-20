/**
 * 우주적 존재 3D 모델 (public/models/<id>.glb, `pnpm models`로 만듦. 출처는 scripts/models/sources.json·README)
 * 존재가 처음 나타날 때 그 모델만 받아 장면 공간에 맞춥니다: 가운데를 원점에, 반지름 1, 앞 +Z, 위 +Y.
 */
import { Box3, Euler, Matrix4, Mesh, Quaternion, Vector3 } from 'three'
import type { AnimationClip, Object3D } from 'three'
import { asset } from '@/shared/config'
import type { Deform } from './hologram'

export const MODEL_IDS = [
  'eagle',
  'raven',
  'parrot',
  'stork',
  'panther',
  'chowchow',
  'wolf',
  'dog',
  'horse',
  'elk',
  'deer',
  'bear',
  'goat',
  'buffalo',
  'spider',
  'centipede',
  'crawler',
  'wizard',
  'dragon',
  'anglerfish',
  'whale',
  'wasp',
  'spaceship',
  'mech',
  'human',
  'woman',
  'king',
  'octopus',
  'squid',
  'jellyfish',
  'turtle',
  'colossus',
  // 우주 대전 함선
  'fighter-a',
  'fighter-b',
  'fighter-c',
  'frigate-a',
  'frigate-b',
  'pod',
  'gunship',
  'speeder-a',
  'speeder-b',
  'saucer',
  'scout',
  'concept',
  'starship',
] as const
export type ModelId = (typeof MODEL_IDS)[number]

export interface ModelSpec {
  /** 앞이 +Z가 되게 돌릴 각도 (y축, 도) */
  turn?: number
  /** 앞뒤로 기울일 각도 (x축, 도). 바닥을 기는 모델을 비스듬히 보이게 */
  tilt?: number
  /** 움직임이 없는 모델에 주는 물결 변형 (맞춘 공간 기준) */
  deform?: Deform
  /** 움직임 빠르기 배율 (우주에서는 천천히) */
  speed?: number
}

export const MODELS: Record<ModelId, ModelSpec> = {
  // 나는 새 (Google Data Arts Team, 모프): 우주에서는 천천히 날갯짓
  eagle: { speed: 0.6 },
  raven: { speed: 0.5 },
  parrot: { speed: 0.6 },
  stork: { speed: 0.6 },
  // 달리는 짐승 (모프)
  panther: { speed: 0.5 },
  chowchow: { speed: 0.5 },
  wolf: { speed: 0.5 },
  dog: { speed: 0.5 },
  horse: { speed: 0.55 },
  elk: { speed: 0.5 },
  deer: { turn: 180, speed: 0.5 },
  bear: { speed: 0.6 },
  goat: { speed: 0.5 },
  buffalo: { speed: 0.6 },
  // 기는 것은 등이 보이게 비스듬히
  spider: { tilt: 30, speed: 0.6 },
  centipede: { turn: 180, tilt: 20, speed: 0.6 },
  crawler: { speed: 0.7 },
  // 넓은 소매 로브: 옷자락이 바람에 날리듯
  wizard: { deform: { sway: [0.06, 1.2, 4, 0.3] } },
  // 뼈대 모델 (Quaternius)
  dragon: { speed: 0.8 },
  anglerfish: { speed: 0.8 },
  whale: { speed: 0.7 },
  wasp: { turn: -90 },
  spaceship: {},
  mech: {},
  human: {},
  woman: {},
  king: {},
  // 움직임 없는 모델 (Poly by Google 등): 물결 변형으로 움직임
  octopus: {
    deform: { tentacle: [0.1, 1.4, 5, 0.1], pulse: [0.04, 1.2, 0.3] },
  },
  squid: { deform: { sway: [0.12, 2.5, 5, 0] } },
  jellyfish: {
    deform: { tentacle: [0.08, 1.6, 6, 0.2], pulse: [0.06, 2, 0.25] },
  },
  turtle: { deform: { flap: [0.35, 1.6, 0.3] } },
  colossus: {},
  // 우주 대전 함선 (움직임 없음): 앞이 +Z가 되게 돌림
  'fighter-a': {},
  'fighter-b': {},
  'fighter-c': {},
  'frigate-a': {},
  'frigate-b': {},
  pod: {},
  gunship: {},
  'speeder-a': {},
  'speeder-b': {},
  saucer: {},
  scout: { turn: 180 },
  concept: { turn: -90 },
  starship: {},
}

export type ModelKind = 'skinned' | 'morph' | 'static'

export interface ModelTemplate {
  id: ModelId
  /** 불러온 장면 (복제해서 씀) */
  scene: Object3D
  clips: AnimationClip[]
  kind: ModelKind
  /** 원래 좌표 → 맞춘 공간 (움직임이 없는 모델은 이미 정점에 적용함) */
  fit: Matrix4
}

type Loader = {
  loadAsync(
    url: string,
  ): Promise<{ scene: Object3D; animations: AnimationClip[] }>
}

let loader: Promise<Loader> | undefined
const templates = new Map<ModelId, Promise<ModelTemplate>>()

/** GLTFLoader와 meshopt 해독기는 존재가 처음 나타날 때 받음 */
function getLoader(): Promise<Loader> {
  loader ??= Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/libs/meshopt_decoder.module.js'),
  ]).then(([{ GLTFLoader }, { MeshoptDecoder }]) => {
    const gltf = new GLTFLoader()
    gltf.setMeshoptDecoder(MeshoptDecoder)
    return gltf
  })
  return loader
}

/** 모델 공간 맞춤 행렬: 가운데를 원점으로, 반지름 1로, 앞을 +Z로 */
export function fitMatrix(box: Box3, spec: ModelSpec): Matrix4 {
  const center = box.getCenter(new Vector3())
  const radius = box.getSize(new Vector3()).length() / 2 || 1
  const rotation = new Quaternion().setFromEuler(
    new Euler(
      ((spec.tilt ?? 0) * Math.PI) / 180,
      ((spec.turn ?? 0) * Math.PI) / 180,
      0,
    ),
  )
  return new Matrix4()
    .makeRotationFromQuaternion(rotation)
    .multiply(new Matrix4().makeScale(1 / radius, 1 / radius, 1 / radius))
    .multiply(new Matrix4().makeTranslation(-center.x, -center.y, -center.z))
}

/** 움직이는 동안 차지하는 범위 (모프 모델은 모든 프레임을 합침: 뛰어오르는 사슴 등) */
function motionBounds(scene: Object3D): Box3 {
  const box = new Box3().setFromObject(scene, true)
  const point = new Vector3()
  const rest = new Vector3()
  scene.traverse((o) => {
    const mesh = o as Mesh
    const targets = mesh.isMesh && mesh.geometry.morphAttributes.position
    if (!targets) return
    const base = mesh.geometry.attributes.position
    const relative = mesh.geometry.morphTargetsRelative
    for (const target of targets)
      for (let i = 0; i < target.count; i++) {
        point.fromBufferAttribute(target, i)
        if (relative) point.add(rest.fromBufferAttribute(base, i))
        box.expandByPoint(point.applyMatrix4(mesh.matrixWorld))
      }
  })
  return box
}

async function load(id: ModelId): Promise<ModelTemplate> {
  const gltf = await (await getLoader()).loadAsync(asset(`models/${id}.glb`))
  return prepareModel(id, gltf)
}

/** 받은 glTF를 장면 공간에 맞춘 틀로 (단위 테스트는 파일에서 해석한 glTF로 부름) */
export function prepareModel(
  id: ModelId,
  gltf: { scene: Object3D; animations: AnimationClip[] },
): ModelTemplate {
  const scene = gltf.scene
  scene.updateMatrixWorld(true)
  let kind: ModelKind = 'static'
  scene.traverse((o) => {
    if ((o as Mesh).isMesh) {
      const mesh = o as Mesh
      if ('isSkinnedMesh' in mesh && mesh.isSkinnedMesh) kind = 'skinned'
      else if (mesh.geometry.morphAttributes.position && kind === 'static')
        kind = 'morph'
    }
  })
  const fit = fitMatrix(motionBounds(scene), MODELS[id])
  if (kind === 'static') {
    // 물결 변형을 맞춘 공간에서 계산하도록 정점에 바로 적용
    scene.traverse((o) => {
      if (!(o as Mesh).isMesh) return
      const mesh = o as Mesh
      mesh.geometry.applyMatrix4(
        new Matrix4().multiplyMatrices(fit, mesh.matrixWorld),
      )
      mesh.position.set(0, 0, 0)
      mesh.quaternion.identity()
      mesh.scale.set(1, 1, 1)
    })
    scene.traverse((o) => {
      if (o === scene || (o as Mesh).isMesh) return
      o.position.set(0, 0, 0)
      o.quaternion.identity()
      o.scale.set(1, 1, 1)
    })
    scene.position.set(0, 0, 0)
    scene.quaternion.identity()
    scene.scale.set(1, 1, 1)
    scene.updateMatrixWorld(true)
  }
  return { id, scene, clips: gltf.animations, kind, fit }
}

/** 모델 하나를 (한 번만) 받아 맞춤. 실패하면 다음에 다시 받음 */
export function loadModel(id: ModelId): Promise<ModelTemplate> {
  let promise = templates.get(id)
  if (!promise) {
    promise = load(id)
    templates.set(id, promise)
    promise.catch(() => templates.delete(id))
  }
  return promise
}
