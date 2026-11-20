/**
 * 떼 지어 맴도는 몸: 같은 모델 여럿을 한 번에 그림(인스턴싱).
 * 파리 떼(벨제붑)·메뚜기 떼(아바돈)·자기 복제 탐사선 무리. 하나하나는 제 궤도를 따라 날며 나아가는 쪽을 봄
 */
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three'
import type { Mesh, SkinnedMesh } from 'three'
import { seededRandom } from '@/shared/lib'
import { Constellation } from './body'
import type { Body3D, BodyFrame } from './body'
import { setMaterials } from './extras'
import { makeBodyMaterial, makeWireMaterial } from './hologram'
import type { ModelTemplate } from './models'

const p = new Vector3()
const next = new Vector3()
const up = new Vector3(0, 1, 0)
const look = new Matrix4()
const q = new Quaternion()
const size = new Vector3()
const place = new Matrix4()

/** 하나의 궤도 위치 (떼 전체가 저마다 다른 리사주 곡선을 그림) */
function orbit(
  seed: { u: number; s: number; speed: number },
  t: number,
  out: Vector3,
) {
  const a = seed.u * 6.283 + t * (0.25 + seed.speed * 2)
  const b = seed.s * 6.283 + t * (0.2 + seed.speed * 1.5)
  const r = 0.85 * (0.3 + 0.7 * Math.sqrt(seed.s))
  return out.set(Math.sin(a) * r, Math.cos(b) * r * 0.7, Math.sin(a + b) * r * 0.55)
}

export function createSwarmBody(
  template: ModelTemplate,
  count: number,
  color: string,
  seed: number,
): Body3D {
  const object = new Group()
  const pose = new Group()
  object.add(pose)
  const body = makeBodyMaterial(color)
  const wire = makeWireMaterial(color)
  // 모델의 첫 메시 (뼈대 모델은 기본 자세)
  let mesh: Mesh | undefined
  template.scene.traverse((o) => {
    if (!mesh && (o as Mesh).isMesh) mesh = o as Mesh
  })
  // 뼈대 모델은 정점이 묶기 자세 공간에 있어(크기가 다를 수 있음) 쉬는 자세를 정점에 구워 씀
  const skinned = (mesh as SkinnedMesh).isSkinnedMesh
  let geometry = mesh!.geometry as BufferGeometry
  if (skinned) {
    const source = geometry.attributes.position
    const baked = new Float32Array(source.count * 3)
    for (let i = 0; i < source.count; i++)
      (mesh as SkinnedMesh)
        .getVertexPosition(i, p)
        .applyMatrix4(mesh!.matrixWorld)
        .toArray(baked, i * 3)
    geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(baked, 3))
    geometry.setIndex(mesh!.geometry.index)
  }
  const base =
    template.kind === 'static'
      ? new Matrix4()
      : skinned
        ? template.fit.clone()
        : new Matrix4().multiplyMatrices(template.fit, mesh!.matrixWorld)
  const fill = new InstancedMesh(geometry, body, count)
  const lines = new InstancedMesh(geometry, wire, count)
  lines.instanceMatrix = fill.instanceMatrix
  for (const o of [fill, lines]) o.frustumCulled = false
  fill.renderOrder = 7
  lines.renderOrder = 8
  const random = seededRandom(seed)
  const seeds = Array.from({ length: count }, () => ({
    u: random(),
    s: random(),
    speed: 0.02 + random() * 0.08,
    size: 0.09 + random() * 0.06,
  }))
  const starCount = Math.min(18, count)
  const stars = new Constellation(color, starCount, new Uint16Array(0), 0.05)
  stars.sparkle = 0.6
  pose.add(fill, lines, stars.lines, stars.stars)
  let lunge = -1
  let falling = -1

  return {
    object,
    update(frame: BodyFrame) {
      setMaterials(body, wire, frame, 0.22)
      const t = frame.reducedMotion ? 0 : frame.time
      seeds.forEach((s, i) => {
        orbit(s, t, p)
        orbit(s, t + 0.05, next)
        // 나아가는 쪽을 봄 (+Z가 앞)
        look.lookAt(next, p, up)
        q.setFromRotationMatrix(look)
        place.compose(p, q, size.setScalar(s.size)).multiply(base)
        fill.setMatrixAt(i, place)
        if (i < starCount) stars.set(i, p)
      })
      fill.instanceMatrix.needsUpdate = true
      if (lunge >= 0) {
        lunge += frame.dt / 0.7
        pose.position.z = Math.sin(Math.min(lunge, 1) * Math.PI) * 0.3
        if (lunge >= 1) lunge = -1
      }
      if (falling >= 0) {
        // 흩어지며 사라짐
        falling += frame.dt
        pose.scale.setScalar(1 + falling * 0.6)
      }
      stars.commit(frame, object.getWorldScale(p).x)
    },
    strike() {
      lunge = 0
    },
    fall() {
      if (falling < 0) falling = 0
    },
    dispose() {
      fill.dispose()
      if (skinned) geometry.dispose()
      stars.dispose()
      body.dispose()
      wire.dispose()
    },
  }
}
