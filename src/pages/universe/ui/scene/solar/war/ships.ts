/**
 * 우주 대전 함선의 모양: 작은 함선은 받은 3D 모델(public/models, CC0·CC BY 3.0)에서 모양만 뽑고,
 * 전함·우주항공모함·드레드노트·궤도 요새·고대 요새·생체 모함은 이 프로젝트에서 계산으로 짓습니다.
 * 모든 모양은 반지름 1 안, 앞이 +Z, 위가 +Y이고 위치(position)만 있는 비색인 도형입니다.
 */
import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Matrix4,
  OctahedronGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import type { Mesh } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { seededRandom } from '@/shared/lib'
import type { FactionId, ShipClassId } from '../../../../model/war/catalog'
import { loadModel } from '../beings/models'
import type { ModelId } from '../beings/models'

export type BuildId =
  'battleship' | 'carrier' | 'dreadnought' | 'station' | 'fortress' | 'bioship'

export type Look = { model: ModelId } | { build: BuildId }

/** 함급마다 기본 모양 */
const CLASS_LOOK: Record<ShipClassId, Look> = {
  fighter: { model: 'fighter-a' },
  interceptor: { model: 'scout' },
  corsair: { model: 'gunship' },
  swarmer: { model: 'wasp' },
  drone: { model: 'pod' },
  mech: { model: 'mech' },
  frigate: { model: 'frigate-a' },
  destroyer: { model: 'frigate-b' },
  cruiser: { model: 'concept' },
  bioship: { build: 'bioship' },
  battleship: { build: 'battleship' },
  carrier: { build: 'carrier' },
  dreadnought: { build: 'dreadnought' },
  station: { build: 'station' },
  fortress: { build: 'fortress' },
}

/** 세력마다 다르게 보일 함급 */
const FACTION_LOOK: Partial<
  Record<FactionId, Partial<Record<ShipClassId, Look>>>
> = {
  pirates: { fighter: { model: 'speeder-a' }, frigate: { model: 'speeder-b' } },
  rift: { fighter: { model: 'fighter-b' } },
  arcane: { fighter: { model: 'fighter-c' }, cruiser: { model: 'frigate-b' } },
  chrono: { interceptor: { model: 'starship' }, frigate: { model: 'scout' } },
  precursors: { drone: { model: 'saucer' } },
  colonies: { fighter: { model: 'spaceship' } },
}

export const lookOf = (faction: FactionId, cls: ShipClassId): Look =>
  FACTION_LOOK[faction]?.[cls] ?? CLASS_LOOK[cls]

export const lookKey = (look: Look) =>
  'model' in look ? `model:${look.model}` : `build:${look.build}`

/** 함급마다 장면에서의 크기 (싸움터 배율을 곱함) */
export const SHIP_SIZE: Record<ShipClassId, number> = {
  fighter: 0.105,
  interceptor: 0.105,
  corsair: 0.135,
  swarmer: 0.09,
  drone: 0.09,
  mech: 0.15,
  frigate: 0.21,
  destroyer: 0.255,
  cruiser: 0.33,
  bioship: 0.54,
  battleship: 0.54,
  carrier: 0.6,
  dreadnought: 0.9,
  station: 0.825,
  fortress: 1.2,
}

/* ── 도형 다루기 ───────────────────────────────────── */

/** 위치만 남긴 비색인 Float32 도형 (양자화된 모델 좌표도 실수로 풀어 둠) */
function positionsOnly(geometry: BufferGeometry): BufferGeometry {
  const source = geometry.index ? geometry.toNonIndexed() : geometry
  const attr = source.getAttribute('position')
  const out = new Float32Array(attr.count * 3)
  for (let i = 0; i < attr.count; i++) {
    out[i * 3] = attr.getX(i)
    out[i * 3 + 1] = attr.getY(i)
    out[i * 3 + 2] = attr.getZ(i)
  }
  const result = new BufferGeometry()
  result.setAttribute('position', new Float32BufferAttribute(out, 3))
  return result
}

export type V3 = [number, number, number]

/** 부품 하나를 놓기: 위치·크기·회전(라디안) */
export function part(
  geometry: BufferGeometry,
  at: V3 = [0, 0, 0],
  scale: V3 = [1, 1, 1],
  turn: V3 = [0, 0, 0],
): BufferGeometry {
  const g = positionsOnly(geometry)
  geometry.dispose()
  g.applyMatrix4(
    new Matrix4().compose(
      new Vector3(...at),
      new Quaternion().setFromEuler(new Euler(...turn)),
      new Vector3(...scale),
    ),
  )
  return g
}

/** 부품을 합쳐 반지름 1 안으로 맞춤 */
function assemble(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts) ?? new BufferGeometry()
  for (const p of parts) p.dispose()
  return normalize(merged)
}

function normalize(geometry: BufferGeometry): BufferGeometry {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const center = box.getCenter(new Vector3())
  const radius = box.getSize(new Vector3()).length() / 2 || 1
  geometry.translate(-center.x, -center.y, -center.z)
  geometry.scale(1 / radius, 1 / radius, 1 / radius)
  geometry.computeBoundingSphere()
  return geometry
}

/** 앞(+Z)으로 갈수록 좁아지는 쐐기 선체 */
const wedge = (length: number, width: number, height: number, z = 0) =>
  part(
    // 네모 단면이 축과 나란하도록 45°에서 시작
    new CylinderGeometry(0.06, 1, length, 4, 1, false, Math.PI / 4),
    [0, 0, z],
    [width, 1, height],
    [Math.PI / 2, 0, 0],
  )

/** 선체 위의 잔 구조물 (시드가 같으면 같은 모양) */
function greebles(seed: number, count: number, length: number, top: number) {
  const random = seededRandom(seed)
  const parts: BufferGeometry[] = []
  for (let i = 0; i < count; i++) {
    const z = (random() - 0.5) * length * 0.8
    const width = 0.06 + random() * 0.12
    parts.push(
      part(
        new BoxGeometry(1, 1, 1),
        [(random() - 0.5) * 0.3, top + random() * 0.05, z],
        [width, 0.04 + random() * 0.08, 0.08 + random() * 0.25],
      ),
    )
  }
  return parts
}

/** 포탑: 받침과 앞으로 뻗은 포신 둘 */
const turret = (x: number, y: number, z: number) => [
  part(new BoxGeometry(1, 1, 1), [x, y, z], [0.14, 0.06, 0.16]),
  part(
    new CylinderGeometry(0.012, 0.012, 0.22, 5),
    [x - 0.03, y + 0.01, z + 0.15],
    [1, 1, 1],
    [Math.PI / 2, 0, 0],
  ),
  part(
    new CylinderGeometry(0.012, 0.012, 0.22, 5),
    [x + 0.03, y + 0.01, z + 0.15],
    [1, 1, 1],
    [Math.PI / 2, 0, 0],
  ),
]

/** 뒤쪽 추진기 (원통) */
const engines = (z: number, spread: number, count: number, radius: number) =>
  Array.from({ length: count }, (_, i) =>
    part(
      new CylinderGeometry(radius, radius * 1.2, 0.18, 8),
      [(i - (count - 1) / 2) * spread, 0, z],
      [1, 1, 1],
      [Math.PI / 2, 0, 0],
    ),
  )

/* ── 계산으로 짓는 함선 ───────────────────────────── */

function battleship(): BufferGeometry {
  return assemble([
    wedge(2, 0.42, 0.22),
    part(new BoxGeometry(1, 1, 1), [0, 0.02, -0.75], [0.36, 0.18, 0.5]),
    part(new BoxGeometry(1, 1, 1), [0, 0.2, -0.35], [0.14, 0.24, 0.22]),
    part(new BoxGeometry(1, 1, 1), [0, 0.34, -0.38], [0.22, 0.05, 0.08]),
    ...turret(0, 0.1, 0.35),
    ...turret(0, 0.1, 0.05),
    ...turret(0, 0.1, -0.12),
    ...engines(-1.06, 0.14, 3, 0.05),
    ...greebles(11, 10, 1.6, 0.08),
  ])
}

function carrier(): BufferGeometry {
  return assemble([
    // 넓고 평평한 비행 갑판
    part(new BoxGeometry(1, 1, 1), [0, 0, -0.05], [0.9, 0.12, 2]),
    wedge(0.6, 0.45, 0.12, 1.2),
    // 양옆 격납고와 함교
    part(new BoxGeometry(1, 1, 1), [0.58, -0.05, -0.1], [0.22, 0.16, 1.4]),
    part(new BoxGeometry(1, 1, 1), [-0.58, -0.05, -0.1], [0.22, 0.16, 1.4]),
    part(new BoxGeometry(1, 1, 1), [0.32, 0.2, -0.3], [0.12, 0.28, 0.3]),
    part(new BoxGeometry(1, 1, 1), [0, 0.065, 0.2], [0.06, 0.01, 1.2]),
    ...engines(-1.12, 0.22, 4, 0.06),
    ...greebles(23, 8, 1.6, 0.07),
  ])
}

function dreadnought(): BufferGeometry {
  return assemble([
    wedge(2.6, 0.5, 0.26, -0.1),
    // 등뼈 능선과 함교 탑
    part(new BoxGeometry(1, 1, 1), [0, 0.15, -0.4], [0.08, 0.12, 1.6]),
    part(new BoxGeometry(1, 1, 1), [0, 0.32, -0.7], [0.2, 0.3, 0.26]),
    // 행성 파괴포: 앞으로 길게 뻗은 창과 고리
    part(
      new CylinderGeometry(0.05, 0.08, 1.4, 10),
      [0, -0.04, 1.3],
      [1, 1, 1],
      [Math.PI / 2, 0, 0],
    ),
    part(new TorusGeometry(0.13, 0.025, 6, 18), [0, -0.04, 0.9]),
    part(new TorusGeometry(0.11, 0.02, 6, 18), [0, -0.04, 1.3]),
    part(new TorusGeometry(0.09, 0.018, 6, 18), [0, -0.04, 1.7]),
    ...turret(0.12, 0.12, 0.2),
    ...turret(-0.12, 0.12, 0.2),
    ...turret(0, 0.14, -0.1),
    ...engines(-1.45, 0.16, 4, 0.07),
    ...greebles(37, 16, 2.2, 0.1),
  ])
}

function station(): BufferGeometry {
  const spokes = [0, 1, 2, 3].map((k) =>
    part(
      new CylinderGeometry(0.03, 0.03, 1.7, 5),
      [0, 0, 0],
      [1, 1, 1],
      [Math.PI / 2, (k * Math.PI) / 4, 0],
    ),
  )
  return assemble([
    // 도는 고리, 가운데 축, 바퀴살, 태양 전지판, 정박 팔
    part(
      new TorusGeometry(0.9, 0.09, 8, 36),
      [0, 0, 0],
      [1, 1, 1],
      [Math.PI / 2, 0, 0],
    ),
    part(new CylinderGeometry(0.16, 0.16, 0.9, 12), [0, 0, 0]),
    part(new SphereGeometry(0.22, 12, 8), [0, 0.5, 0]),
    part(new SphereGeometry(0.22, 12, 8), [0, -0.5, 0]),
    ...spokes,
    part(new BoxGeometry(1, 1, 1), [0, 0.75, 0], [1.4, 0.02, 0.32]),
    part(new BoxGeometry(1, 1, 1), [0, -0.75, 0], [1.4, 0.02, 0.32]),
    part(new BoxGeometry(1, 1, 1), [0, 0, 0.35], [0.08, 0.08, 0.5]),
    part(new BoxGeometry(1, 1, 1), [0, 0, -0.35], [0.08, 0.08, 0.5]),
  ])
}

function fortress(): BufferGeometry {
  const spikes: BufferGeometry[] = []
  const axes: V3[] = [
    [0, 0, Math.PI / 2],
    [0, 0, -Math.PI / 2],
    [0, 0, 0],
    [Math.PI, 0, 0],
    [Math.PI / 2, 0, 0],
    [-Math.PI / 2, 0, 0],
  ]
  for (const turn of axes) {
    const dir = new Vector3(0, 1, 0).applyEuler(new Euler(...turn))
    spikes.push(
      part(
        new ConeGeometry(0.12, 0.6, 6),
        [dir.x * 0.85, dir.y * 0.85, dir.z * 0.85],
        [1, 1, 1],
        turn,
      ),
    )
  }
  return assemble([
    // 깎은 보석 같은 고대 요새: 이십면체 껍데기, 팔면체 핵, 기운 두 고리, 여섯 가시
    part(new IcosahedronGeometry(0.62, 0)),
    part(new OctahedronGeometry(0.85, 0), [0, 0, 0], [0.55, 1, 0.55]),
    part(
      new TorusGeometry(0.95, 0.03, 6, 40),
      [0, 0, 0],
      [1, 1, 1],
      [1.1, 0.2, 0],
    ),
    part(
      new TorusGeometry(1.05, 0.025, 6, 40),
      [0, 0, 0],
      [1, 1, 1],
      [-0.6, 0.9, 0],
    ),
    ...spikes,
  ])
}

function bioship(): BufferGeometry {
  const parts: BufferGeometry[] = []
  // 앞에서 뒤로 작아지는 마디와 갈비 고리, 꼬리 쪽 촉수
  for (let i = 0; i < 5; i++) {
    const z = 0.7 - i * 0.38
    const r = 0.32 - i * 0.045
    parts.push(
      part(new SphereGeometry(1, 10, 7), [0, 0, z], [r, r * 0.8, r * 1.25]),
    )
    parts.push(part(new TorusGeometry(r * 1.05, 0.02, 5, 14), [0, 0, z - 0.12]))
  }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2
    parts.push(
      part(
        new ConeGeometry(0.035, 0.7, 5),
        [Math.cos(a) * 0.12, Math.sin(a) * 0.12, -1.2],
        [1, 1, 1],
        [-Math.PI / 2 + Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4],
      ),
    )
  }
  // 앞쪽 집게
  parts.push(
    part(
      new ConeGeometry(0.06, 0.45, 5),
      [0.18, 0, 1.05],
      [1, 1, 1],
      [Math.PI / 2, 0, -0.4],
    ),
    part(
      new ConeGeometry(0.06, 0.45, 5),
      [-0.18, 0, 1.05],
      [1, 1, 1],
      [Math.PI / 2, 0, 0.4],
    ),
  )
  return assemble(parts)
}

const BUILDERS: Record<BuildId, () => BufferGeometry> = {
  battleship,
  carrier,
  dreadnought,
  station,
  fortress,
  bioship,
}

/* ── 모델에서 모양 뽑기 ───────────────────────────── */

/** 받은 모델의 모든 메시를 맞춘 공간(반지름 1, 앞 +Z)에서 하나로 합침 (움직임은 쓰지 않음) */
async function modelGeometry(id: ModelId): Promise<BufferGeometry> {
  const template = await loadModel(id)
  template.scene.updateMatrixWorld(true)
  const parts: BufferGeometry[] = []
  template.scene.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
    const g = positionsOnly(mesh.geometry)
    g.applyMatrix4(
      template.kind === 'static'
        ? mesh.matrixWorld
        : new Matrix4().multiplyMatrices(template.fit, mesh.matrixWorld),
    )
    parts.push(g)
  })
  return assemble(parts)
}

const cache = new Map<string, Promise<BufferGeometry>>()

/** 모양을 한 번만 만들어 함께 씀 (모델은 처음 쓸 때 받음) */
export function shipGeometry(look: Look): Promise<BufferGeometry> {
  const key = lookKey(look)
  let promise = cache.get(key)
  if (!promise) {
    promise =
      'model' in look
        ? modelGeometry(look.model)
        : Promise.resolve(BUILDERS[look.build]())
    cache.set(key, promise)
    promise.catch(() => cache.delete(key))
  }
  return promise
}

/** 계산으로 짓는 모양 (단위 테스트용) */
export const buildShip = (id: BuildId) => BUILDERS[id]()
