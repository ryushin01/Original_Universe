/**
 * 대형 병기의 3D 꼴: 함선과 다른 거대 병기를 기본 도형으로 짓습니다 (앞 +Z가 적 쪽, 위 +Y).
 * 산만 한 고대 자율 병기처럼 떠 있는 마디 몸·빛나는 핵 같은 느낌을 살리되, 특정 작품의 디자인은 본뜨지 않습니다.
 * 만든 도형은 반지름 1 안에 들고, 쏘는 자리(muzzle)와 빛나는 핵(core)도 같은 좌표로 돌려줍니다.
 */
import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Matrix4,
  OctahedronGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import type { BufferGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { seededRandom } from '@/shared/lib'
import type { MegaweaponForm } from '../../../../model/war/catalog'
import { part } from './ships'
import type { V3 } from './ships'

export interface MegaweaponShape {
  geometry: BufferGeometry
  /** 쏘는 자리 (도형과 같은 좌표, 반지름 1 기준) */
  muzzle: Vector3
  /** 빛나는 핵 자리 */
  core: Vector3
  /** 핵의 크기 (반지름 1 기준) */
  coreSize: number
}

interface Draft {
  parts: BufferGeometry[]
  muzzle: V3
  core: V3
  coreSize: number
}

const Y = new Vector3(0, 1, 0)

/** 원기둥 축(+Y)을 dir 쪽으로 돌려 놓기 */
function aimed(
  geometry: BufferGeometry,
  at: V3,
  dir: V3,
  scale: V3 = [1, 1, 1],
): BufferGeometry {
  const g = part(geometry)
  g.applyMatrix4(
    new Matrix4().compose(
      new Vector3(...at),
      new Quaternion().setFromUnitVectors(Y, new Vector3(...dir).normalize()),
      new Vector3(...scale),
    ),
  )
  return g
}

const box = (at: V3, size: V3, turn: V3 = [0, 0, 0]) =>
  part(new BoxGeometry(1, 1, 1), at, size, turn)

/** 전쟁 거신병: 가슴 주포와 한 팔의 포신을 단 인간형 병기 */
function colossus(): Draft {
  return {
    parts: [
      box([0, -0.12, 0], [0.42, 0.16, 0.26]),
      box([0, 0.24, 0], [0.62, 0.5, 0.34]),
      box([0, 0.3, 0.18], [0.46, 0.3, 0.06]),
      box([0, 0.62, 0.02], [0.18, 0.18, 0.2]),
      box([0, 0.63, 0.12], [0.16, 0.04, 0.02]),
      box([0.42, 0.46, 0], [0.26, 0.18, 0.3], [0, 0, -0.25]),
      box([-0.42, 0.46, 0], [0.26, 0.18, 0.3], [0, 0, 0.25]),
      part(new CylinderGeometry(0.07, 0.06, 0.55, 8), [-0.48, 0.12, 0]),
      box([-0.48, -0.2, 0.02], [0.14, 0.14, 0.14]),
      part(new CylinderGeometry(0.07, 0.06, 0.4, 8), [0.48, 0.2, 0]),
      // 앞으로 뻗은 포신 팔
      aimed(
        new CylinderGeometry(0.06, 0.09, 0.75, 10),
        [0.5, 0.02, 0.28],
        [0, 0, 1],
      ),
      box([0.15, -0.6, 0], [0.17, 0.72, 0.2]),
      box([-0.15, -0.6, 0], [0.17, 0.72, 0.2]),
      box([0.15, -0.98, 0.06], [0.2, 0.06, 0.32]),
      box([-0.15, -0.98, 0.06], [0.2, 0.06, 0.32]),
      aimed(
        new CylinderGeometry(0.05, 0.08, 0.3, 8),
        [0.16, 0.32, -0.24],
        [0, -0.4, -1],
      ),
      aimed(
        new CylinderGeometry(0.05, 0.08, 0.3, 8),
        [-0.16, 0.32, -0.24],
        [0, -0.4, -1],
      ),
    ],
    muzzle: [0, 0.3, 0.22],
    core: [0, 0.3, 0.22],
    coreSize: 0.12,
  }
}

/** 방벽 거신: 육각 방패를 앞세운 거신 */
function bastion(): Draft {
  return {
    parts: [
      part(
        new CylinderGeometry(0.78, 0.78, 0.05, 6),
        [0, 0, 0.36],
        [1, 1, 1],
        [Math.PI / 2, 0, 0],
      ),
      part(
        new TorusGeometry(0.52, 0.03, 4, 6),
        [0, 0, 0.4],
        [1, 1, 1],
        [0, 0, Math.PI / 6],
      ),
      part(
        new TorusGeometry(0.28, 0.025, 4, 6),
        [0, 0, 0.41],
        [1, 1, 1],
        [0, 0, Math.PI / 6],
      ),
      part(new SphereGeometry(0.32, 12, 8), [0, 0.05, -0.12]),
      box([0, 0.5, -0.1], [0.16, 0.16, 0.16]),
      box([0.45, 0.34, -0.06], [0.32, 0.12, 0.36], [0, 0, -0.3]),
      box([-0.45, 0.34, -0.06], [0.32, 0.12, 0.36], [0, 0, 0.3]),
      part(
        new ConeGeometry(0.26, 0.75, 6),
        [0, -0.55, -0.12],
        [1, 1, 1],
        [Math.PI, 0, 0],
      ),
    ],
    muzzle: [0, 0, 0.42],
    core: [0, 0.05, 0.42],
    coreSize: 0.14,
  }
}

/** 니콜-다이슨 광선: 육각 반사경을 오목하게 늘어놓고 초점에 빛을 모음 */
function mirrors(): Draft {
  const parts: BufferGeometry[] = []
  const focus: V3 = [0, 0, 0.95]
  const step = 0.2
  for (let q = -3; q <= 3; q++)
    for (let r = -3; r <= 3; r++) {
      if (Math.abs(q + r) > 3) continue
      const x = step * (q + r / 2) * 1.04
      const y = step * r * 0.9
      const z = (x * x + y * y) * 0.32
      const dir: V3 = [focus[0] - x, focus[1] - y, focus[2] - z]
      parts.push(
        aimed(new CylinderGeometry(0.1, 0.1, 0.012, 6), [x, y, z], dir),
      )
    }
  parts.push(part(new TorusGeometry(0.72, 0.025, 6, 40), [0, 0, 0.2]))
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 2
    const rim: V3 = [Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0.2]
    const mid: V3 = [
      (rim[0] + focus[0]) / 2,
      (rim[1] + focus[1]) / 2,
      (rim[2] + focus[2]) / 2,
    ]
    const length = Math.hypot(
      focus[0] - rim[0],
      focus[1] - rim[1],
      focus[2] - rim[2],
    )
    parts.push(
      aimed(new CylinderGeometry(0.012, 0.012, length, 4), mid, [
        focus[0] - rim[0],
        focus[1] - rim[1],
        focus[2] - rim[2],
      ]),
    )
  }
  parts.push(part(new SphereGeometry(0.06, 10, 6), focus))
  return { parts, muzzle: focus, core: focus, coreSize: 0.1 }
}

/** 궤도 질량 투사기: 가속 고리를 꿴 긴 등뼈 */
function spine(): Draft {
  const parts: BufferGeometry[] = [box([0, 0, 0], [0.08, 0.08, 1.9])]
  for (let k = 0; k < 9; k++)
    parts.push(
      part(new TorusGeometry(0.18, 0.025, 6, 20), [0, 0, -0.8 + k * 0.2]),
    )
  parts.push(
    box([0, 0, -1.02], [0.36, 0.36, 0.3]),
    box([0.32, 0, -0.98], [0.4, 0.02, 0.24]),
    box([-0.32, 0, -0.98], [0.4, 0.02, 0.24]),
    box([0, 0.3, -0.98], [0.02, 0.4, 0.24]),
    aimed(new CylinderGeometry(0.06, 0.1, 0.14, 10), [0, 0, 0.98], [0, 0, 1]),
  )
  return { parts, muzzle: [0, 0, 1.06], core: [0, 0, -1.02], coreSize: 0.12 }
}

/** 특이점 투사기: 작은 블랙홀을 빚는 거대한 고리 */
function ring(): Draft {
  const parts: BufferGeometry[] = [
    part(new TorusGeometry(0.7, 0.07, 10, 48), [0, 0, 0]),
  ]
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2
    const at: V3 = [Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0]
    parts.push(
      box(at, [0.18, 0.18, 0.28], [0, 0, a]),
      aimed(
        new ConeGeometry(0.05, 0.18, 6),
        [Math.cos(a) * 0.56, Math.sin(a) * 0.56, 0],
        [-Math.cos(a), -Math.sin(a), 0],
      ),
      aimed(
        new CylinderGeometry(0.015, 0.015, 0.6, 4),
        [Math.cos(a) * 0.45, Math.sin(a) * 0.45, -0.32],
        [Math.cos(a), Math.sin(a), 0.9],
      ),
    )
  }
  parts.push(
    aimed(new CylinderGeometry(0.16, 0.24, 0.4, 10), [0, 0, -0.55], [0, 0, 1]),
  )
  return { parts, muzzle: [0, 0, 0.05], core: [0, 0, 0], coreSize: 0.2 }
}

/** 공성 거수: 가시 돋은 마디 몸과 큰 아가리 */
function beast(): Draft {
  const parts: BufferGeometry[] = []
  for (let i = 0; i < 8; i++) {
    const r = 0.27 - i * 0.025
    const z = 0.62 - i * 0.27
    const y = 0.06 * Math.sin(i * 1.3)
    parts.push(part(new SphereGeometry(r, 12, 8), [0, y, z], [1, 0.88, 1.15]))
    parts.push(
      aimed(
        new ConeGeometry(0.05, 0.24 - i * 0.015, 5),
        [0, y + r * 0.9, z],
        [0, 1, -0.3],
      ),
    )
    if (i % 2 === 0)
      for (const sx of [1, -1])
        parts.push(
          aimed(
            new ConeGeometry(0.04, 0.18, 5),
            [sx * r * 0.95, y, z],
            [sx, -0.2, -0.3],
          ),
        )
  }
  parts.push(
    part(new TorusGeometry(0.2, 0.05, 6, 16), [0, 0, 0.9]),
    aimed(new ConeGeometry(0.05, 0.3, 5), [0.16, -0.06, 0.98], [-0.3, 0, 1]),
    aimed(new ConeGeometry(0.05, 0.3, 5), [-0.16, -0.06, 0.98], [0.3, 0, 1]),
  )
  return { parts, muzzle: [0, 0, 0.98], core: [0, 0, 0.9], coreSize: 0.12 }
}

/** 정신 증폭 첨탑: 떠 있는 고리를 두른 결정 첨탑 */
function spire(): Draft {
  return {
    parts: [
      part(new CylinderGeometry(0.07, 0.22, 1.5, 8), [0, 0, 0]),
      part(new OctahedronGeometry(0.2), [0, 0.9, 0], [1, 1.7, 1]),
      part(
        new TorusGeometry(0.4, 0.02, 4, 36),
        [0, 0.18, 0],
        [1, 1, 1],
        [Math.PI / 2, 0, 0],
      ),
      part(
        new TorusGeometry(0.3, 0.02, 4, 32),
        [0, 0.5, 0],
        [1, 1, 1],
        [Math.PI / 2, 0.2, 0],
      ),
      part(
        new TorusGeometry(0.48, 0.02, 4, 40),
        [0, -0.22, 0],
        [1, 1, 1],
        [Math.PI / 2, -0.15, 0],
      ),
      part(new OctahedronGeometry(0.16), [0, -0.86, 0], [1, 1.6, 1]),
    ],
    muzzle: [0, 0.92, 0],
    core: [0, 0.9, 0],
    coreSize: 0.16,
  }
}

/** 수호 거신: 넓은 관과 어깨 날개, 빛나는 핵, 아래로 좁아지는 마디 몸이 떠 있는 고대 자율 병기 */
function warden(): Draft {
  const parts: BufferGeometry[] = [
    // 관과 얼굴판
    box([0, 0.95, 0], [0.5, 0.08, 0.2]),
    box([0.36, 1.02, 0], [0.42, 0.06, 0.16], [0, 0, 0.38]),
    box([-0.36, 1.02, 0], [0.42, 0.06, 0.16], [0, 0, -0.38]),
    box([0, 0.8, 0.08], [0.2, 0.18, 0.06]),
    // 어깨 날개 (위로 벌어짐)
    box([0.52, 0.58, 0], [0.6, 0.12, 0.3], [0, 0, 0.5]),
    box([-0.52, 0.58, 0], [0.6, 0.12, 0.3], [0, 0, -0.5]),
    box([0.44, 0.34, 0], [0.42, 0.1, 0.26], [0, 0, 0.28]),
    box([-0.44, 0.34, 0], [0.42, 0.1, 0.26], [0, 0, -0.28]),
    // 핵을 두른 고리
    part(new TorusGeometry(0.15, 0.04, 8, 24), [0, 0.47, 0.12]),
  ]
  // 아래로 좁아지는 마디 (틈을 두고 떠 있음)
  const segments: Array<[number, number, number]> = [
    [0.22, 0.44, 0.3],
    [0.02, 0.36, 0.26],
    [-0.18, 0.28, 0.22],
    [-0.36, 0.2, 0.18],
  ]
  for (const [y, w, d] of segments) parts.push(box([0, y, 0], [w, 0.14, d]))
  parts.push(
    box([0.27, 0.04, -0.04], [0.05, 0.42, 0.2], [0, 0, -0.12]),
    box([-0.27, 0.04, -0.04], [0.05, 0.42, 0.2], [0, 0, 0.12]),
    part(
      new ConeGeometry(0.09, 0.55, 6),
      [0, -0.72, 0],
      [1, 1, 1],
      [Math.PI, 0, 0],
    ),
  )
  return {
    parts,
    muzzle: [0, 0.47, 0.16],
    core: [0, 0.47, 0.14],
    coreSize: 0.14,
  }
}

/** 차원 절단기: 공간을 가르는 초승달 날과 떠 있는 파편 */
function blade(): Draft {
  const random = seededRandom(77)
  const parts: BufferGeometry[] = [
    part(
      new TorusGeometry(0.8, 0.08, 3, 48, Math.PI * 1.25),
      [0, 0, 0],
      [1, 1, 0.35],
      [0, 0, -Math.PI * 0.125 - Math.PI / 2],
    ),
    part(
      new TorusGeometry(0.62, 0.02, 3, 40, Math.PI * 1.1),
      [0, 0, 0.02],
      [1, 1, 0.5],
      [0, 0, -Math.PI * 0.05 - Math.PI / 2],
    ),
  ]
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (random() - 0.5) * 2.4
    const r = 0.85 + random() * 0.2
    parts.push(
      part(
        new OctahedronGeometry(0.05 + random() * 0.04),
        [Math.cos(a) * r, Math.sin(a) * r + 0.05, (random() - 0.5) * 0.2],
        [1, 2.2, 0.6],
        [random(), random(), random()],
      ),
    )
  }
  return { parts, muzzle: [0, -0.1, 0.1], core: [0, 0, 0], coreSize: 0.1 }
}

/** 마도 결정포: 큰 결정을 작은 결정들이 둘러싼 무리 */
function prism(): Draft {
  const random = seededRandom(31)
  const parts: BufferGeometry[] = [
    part(new OctahedronGeometry(0.35), [0, 0.1, 0], [0.6, 1.8, 0.6]),
    part(
      new TorusGeometry(0.48, 0.02, 4, 6),
      [0, -0.5, 0],
      [1, 1, 1],
      [Math.PI / 2, 0, 0],
    ),
  ]
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2
    const r = 0.32 + random() * 0.18
    const s = 0.12 + random() * 0.12
    parts.push(
      aimed(
        new OctahedronGeometry(1),
        [Math.cos(a) * r, -0.25 + random() * 0.3, Math.sin(a) * r],
        [Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6],
        [s * 0.55, s * 1.8, s * 0.55],
      ),
    )
  }
  return { parts, muzzle: [0, 0.74, 0], core: [0, 0.1, 0], coreSize: 0.18 }
}

/** 시간 정지포: 맞물린 고리 안의 육각 모래시계 */
function hourglass(): Draft {
  return {
    parts: [
      part(
        new ConeGeometry(0.42, 0.62, 6),
        [0, 0.32, 0],
        [1, 1, 1],
        [Math.PI, 0, 0],
      ),
      part(new ConeGeometry(0.42, 0.62, 6), [0, -0.32, 0]),
      part(new CylinderGeometry(0.44, 0.44, 0.05, 6), [0, 0.65, 0]),
      part(new CylinderGeometry(0.44, 0.44, 0.05, 6), [0, -0.65, 0]),
      part(
        new TorusGeometry(0.66, 0.025, 4, 48),
        [0, 0, 0],
        [1, 1, 1],
        [Math.PI / 2, 0, 0],
      ),
      part(
        new TorusGeometry(0.6, 0.022, 4, 44),
        [0, 0, 0],
        [1, 1, 1],
        [0.9, 0, 0.3],
      ),
      part(
        new TorusGeometry(0.54, 0.02, 4, 40),
        [0, 0, 0],
        [1, 1, 1],
        [-0.7, 0.4, 1.2],
      ),
    ],
    muzzle: [0, 0, 0],
    core: [0, 0, 0],
    coreSize: 0.14,
  }
}

const BUILDERS: Record<MegaweaponForm, () => Draft> = {
  colossus,
  bastion,
  mirrors,
  spine,
  ring,
  beast,
  spire,
  warden,
  blade,
  prism,
  hourglass,
}

/** 대형 병기 꼴 하나를 지어 반지름 1 안으로 맞춤 (쏘는 자리·핵도 같은 변환) */
export function buildMegaweapon(form: MegaweaponForm): MegaweaponShape {
  const draft = BUILDERS[form]()
  const merged = mergeGeometries(draft.parts)
  for (const p of draft.parts) p.dispose()
  if (!merged) throw new Error(`대형 병기 꼴을 만들지 못했습니다: ${form}`)
  merged.computeBoundingBox()
  const bounds = merged.boundingBox!
  const center = bounds.getCenter(new Vector3())
  const radius = bounds.getSize(new Vector3()).length() / 2 || 1
  merged.translate(-center.x, -center.y, -center.z)
  merged.scale(1 / radius, 1 / radius, 1 / radius)
  merged.computeBoundingSphere()
  const fit = (v: V3) => new Vector3(...v).sub(center).divideScalar(radius)
  return {
    geometry: merged,
    muzzle: fit(draft.muzzle),
    core: fit(draft.core),
    coreSize: draft.coreSize / radius,
  }
}

/** 꼴마다 한 번만 지어 여러 전쟁이 함께 씀 */
const cache = new Map<MegaweaponForm, MegaweaponShape>()

export function megaweaponShape(form: MegaweaponForm): MegaweaponShape {
  let shape = cache.get(form)
  if (!shape) {
    shape = buildMegaweapon(form)
    cache.set(form, shape)
  }
  return shape
}
