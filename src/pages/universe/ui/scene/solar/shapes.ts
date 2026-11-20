/**
 * 작은 천체(혜성 핵·소행성)의 울퉁불퉁한 모양. 내려받을 수 있는 모양 모델이 없어서,
 * 탐사·레이더로 알려진 크기 비율에 맞춰 공을 늘이고 허리를 잘록하게(두 덩이가 붙은 땅콩 모양)
 * 한 뒤, 시드로 정한 언덕과 충돌구를 더해 만듭니다. 시드가 같으면 모양도 같습니다.
 */
import { BufferAttribute, SphereGeometry } from 'three'
import type { BufferGeometry } from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { seededRandom } from '@/shared/lib'
import type { BodyId } from '../../../model/solar/bodies'

export interface ShapeSpec {
  /** 축 비율 (x가 가장 긴 축) */
  axes: [number, number, number]
  /** 허리 잘록함 (0이면 타원체, 클수록 두 덩이가 뚜렷한 땅콩 모양) */
  waist: number
  /** 언덕 수와 최대 높이 (반지름 비율) */
  bumps: number
  bumpHeight: number
  /** 충돌구 수와 최대 깊이 (반지름 비율) */
  craters: number
  craterDepth: number
  seed: number
}

export const SHAPES: Partial<Record<BodyId, ShapeSpec>> = {
  // 핼리 혜성 핵: 약 15×8×8 km의 땅콩 모양 (조토·베가 탐사선, 1986)
  halley: {
    axes: [1, 0.56, 0.5],
    waist: 0.24,
    bumps: 22,
    bumpHeight: 0.1,
    craters: 9,
    craterDepth: 0.07,
    seed: 1986,
  },
  // 아포피스: 약 450×370 m의 길쭉한 모양, 두 덩이가 붙은 모양일 수 있음 (레이더 관측)
  apophis: {
    axes: [1, 0.8, 0.7],
    waist: 0.14,
    bumps: 18,
    bumpHeight: 0.09,
    craters: 10,
    craterDepth: 0.08,
    seed: 2029,
  },
}

type Vec = [number, number, number]

const normalized = (v: Vec): Vec => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

/** 시드로 고른 고른 방향 (구면 위 균등 분포) */
const randomDirection = (random: () => number): Vec => {
  const z = random() * 2 - 1
  const a = random() * Math.PI * 2
  const s = Math.sqrt(1 - z * z)
  return [s * Math.cos(a), s * Math.sin(a), z]
}

/** 방향(단위 벡터)마다의 반지름 배율: 언덕과 충돌구 */
function reliefOf(spec: ShapeSpec): (dir: Vec) => number {
  const random = seededRandom(spec.seed)
  const bumps = Array.from({ length: spec.bumps }, () => ({
    center: randomDirection(random),
    // 너비 (라디안)와 높이 (낮은 곳도 섞음)
    width: 0.3 + random() * 0.6,
    height: spec.bumpHeight * (random() * 1.6 - 0.6),
  }))
  const craters = Array.from({ length: spec.craters }, () => ({
    center: randomDirection(random),
    radius: 0.15 + random() * 0.3,
    depth: spec.craterDepth * (0.5 + random() * 0.5),
  }))
  return (dir) => {
    let k = 1
    for (const b of bumps) {
      const d =
        1 - (dir[0] * b.center[0] + dir[1] * b.center[1] + dir[2] * b.center[2])
      // 1 - cos θ ≈ θ²/2
      k += b.height * Math.exp(-d / ((b.width * b.width) / 2))
    }
    for (const c of craters) {
      const cos =
        dir[0] * c.center[0] + dir[1] * c.center[1] + dir[2] * c.center[2]
      const t = Math.acos(Math.min(1, Math.max(-1, cos))) / c.radius
      // 그릇 모양으로 파이고 가장자리는 살짝 솟음
      if (t < 1) k -= c.depth * (1 - t * t)
      k += c.depth * 0.35 * Math.exp(-(((t - 1) / 0.22) ** 2))
    }
    return k
  }
}

/**
 * 모양 메시: 가장 먼 점이 반지름 1이 되게 맞춤 (공 대신 넣어도 크기가 같게).
 * 꼭짓점을 합쳐 매끈한 법선을 씀 (uv는 쓰지 않음: 작은 천체는 텍스처 없이 잡음으로 칠함).
 */
export function makeShapeGeometry(
  spec: ShapeSpec,
  segments = 64,
): BufferGeometry {
  const sphere = new SphereGeometry(1, segments, segments / 2)
  sphere.deleteAttribute('uv')
  sphere.deleteAttribute('normal')
  const geometry = mergeVertices(sphere, 1e-6)
  sphere.dispose()
  const relief = reliefOf(spec)
  const [ax, ay, az] = spec.axes
  const pos = geometry.getAttribute('position') as BufferAttribute
  let far = 0
  for (let i = 0; i < pos.count; i++) {
    const dir = normalized([pos.getX(i), pos.getY(i), pos.getZ(i)])
    const x = dir[0] * ax
    // 가운데(x≈0)를 잘록하게
    const pinch = 1 - spec.waist * Math.exp(-((x / (ax * 0.42)) ** 2))
    const k = relief(dir)
    const p: Vec = [x * k, dir[1] * ay * pinch * k, dir[2] * az * pinch * k]
    pos.setXYZ(i, p[0], p[1], p[2])
    far = Math.max(far, Math.hypot(p[0], p[1], p[2]))
  }
  geometry.scale(1 / far, 1 / far, 1 / far)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}
