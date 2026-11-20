/**
 * 문명 단계의 함대: 문명 단계(카르다쇼프)를 올리면 지구 곁(과 Ⅱ단계부터는 다이슨 구 바깥 태양 곁)을
 * 우주전함·항공모함·순양함·호위함·궤도 정거장이 돌며 지킵니다. 단계가 바뀌면 흐려졌다가 새 함대로 나타남.
 * 함선 모양은 우주 대전의 지구 연방 함선과 같은 것을 씀.
 */
import { Group, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import { FACTION_BY_ID } from '../../../../model/war/catalog'
import type { ShipClassId } from '../../../../model/war/catalog'
import { bodyVisualRadius, sceneDistance } from '../../../../model/solar/scale'
import { civLevel } from '../../../../model/world/civilization'
import type { CivFleet } from '../../../../model/world/civilization'
import { isRemoved } from '../../../../model/world/selectors'
import type { FrameContext } from '../../types'
import {
  makeBodyMaterial,
  makeWireMaterial,
  setBodyUniforms,
} from '../beings/hologram'
import type { SiteAnchors } from '../sites'
import { SHIP_SIZE, lookOf, shipGeometry } from '../war/ships'

interface Squadron {
  around: 'earth' | 'sun'
  cls: ShipClassId
  count: number
}

/** 단계마다의 함대 (지구 곁, 태양 곁) */
export const CIV_FLEETS: Record<Exclude<CivFleet, 'none'>, Squadron[]> = {
  patrol: [
    { around: 'earth', cls: 'frigate', count: 6 },
    { around: 'earth', cls: 'cruiser', count: 2 },
    { around: 'earth', cls: 'station', count: 1 },
  ],
  armada: [
    { around: 'earth', cls: 'frigate', count: 8 },
    { around: 'earth', cls: 'cruiser', count: 3 },
    { around: 'earth', cls: 'battleship', count: 3 },
    { around: 'earth', cls: 'carrier', count: 2 },
    { around: 'earth', cls: 'station', count: 1 },
    { around: 'sun', cls: 'battleship', count: 6 },
    { around: 'sun', cls: 'carrier', count: 2 },
    { around: 'sun', cls: 'dreadnought', count: 1 },
    { around: 'sun', cls: 'fortress', count: 1 },
  ],
  grand: [
    { around: 'earth', cls: 'frigate', count: 10 },
    { around: 'earth', cls: 'cruiser', count: 4 },
    { around: 'earth', cls: 'battleship', count: 5 },
    { around: 'earth', cls: 'carrier', count: 3 },
    { around: 'earth', cls: 'dreadnought', count: 1 },
    { around: 'earth', cls: 'station', count: 2 },
    { around: 'sun', cls: 'battleship', count: 10 },
    { around: 'sun', cls: 'carrier', count: 4 },
    { around: 'sun', cls: 'dreadnought', count: 2 },
    { around: 'sun', cls: 'fortress', count: 2 },
  ],
}

/** 지구 곁 고리 반지름 (지구 화면 반지름의 배수), 태양 곁 고리 (AU, 다이슨 구 2 AU 바깥) */
const EARTH_RING = 2.8
const SUN_RING_AU = 2.5
/** 함선 크기 배율 (지구 곁은 작게, 태양 곁은 크게) */
const EARTH_SHIP = 0.18
const SUN_SHIP = 0.6

interface Entry {
  squadron: Squadron
  /** 같은 고리 안에서 몇 번째 편대인지 (반지름·각도를 벌림) */
  rank: number
  body: InstancedMesh | null
  wire: InstancedMesh | null
}

export interface CivFleetLayer {
  group: Group
  update(ctx: FrameContext, anchors: SiteAnchors): void
  dispose(): void
}

const m4 = new Matrix4()
const basis = new Matrix4()
const q = new Quaternion()
const tilt = new Quaternion()
const scale = new Vector3()
const pos = new Vector3()
const tangent = new Vector3()
const normal = new Vector3()
const side = new Vector3()
const origin = new Vector3()
const X = new Vector3(1, 0, 0)
const Y = new Vector3(0, 1, 0)

export function createCivFleetLayer(): CivFleetLayer {
  const group = new Group()
  const color = FACTION_BY_ID.federation.color
  const bodyMaterial = makeBodyMaterial(color)
  const wireMaterial = makeWireMaterial(color)
  let tier: CivFleet = 'none'
  let entries: Entry[] = []
  let opacity = 0

  function clear() {
    for (const e of entries)
      for (const mesh of [e.body, e.wire])
        if (mesh) {
          group.remove(mesh)
          mesh.dispose()
        }
    entries = []
  }

  function build(next: CivFleet) {
    clear()
    if (next === 'none') return
    const ranks = { earth: 0, sun: 0 }
    for (const squadron of CIV_FLEETS[next]) {
      const entry: Entry = {
        squadron,
        rank: ranks[squadron.around]++,
        body: null,
        wire: null,
      }
      entries.push(entry)
      shipGeometry(lookOf('federation', squadron.cls))
        .then((geometry) => {
          if (!entries.includes(entry)) return
          entry.body = new InstancedMesh(geometry, bodyMaterial, squadron.count)
          entry.wire = new InstancedMesh(geometry, wireMaterial, squadron.count)
          for (const mesh of [entry.body, entry.wire]) {
            mesh.frustumCulled = false
            mesh.userData.sharedGeometry = true
          }
          group.add(entry.body, entry.wire)
        })
        .catch(() => {})
    }
  }

  return {
    group,
    update(ctx, anchors) {
      const wanted = civLevel(ctx.world)?.fleet ?? 'none'
      // 단계가 바뀌면 지금 함대를 흐리게 한 뒤 새 함대로
      if (wanted !== tier) {
        if (opacity > 0.02 && tier !== 'none' && !ctx.reducedMotion)
          opacity = Math.max(0, opacity - ctx.dt * 1.5)
        else {
          tier = wanted
          build(tier)
          opacity = 0
        }
      } else if (tier !== 'none')
        opacity = ctx.reducedMotion ? 1 : Math.min(1, opacity + ctx.dt * 0.8)
      group.visible = tier !== 'none' && entries.length > 0
      if (!group.visible) return
      setBodyUniforms(bodyMaterial, opacity, ctx.elapsed)
      setBodyUniforms(wireMaterial, opacity * 0.55, ctx.elapsed)
      const t = ctx.reducedMotion ? 0 : ctx.elapsed
      const earth = anchors.positions.get('earth')
      const earthGone = !earth || isRemoved(ctx.world, 'earth')
      for (const e of entries) {
        const { around, cls, count } = e.squadron
        const meshes = [e.body, e.wire]
        if (!e.body || !e.wire) continue
        const atEarth = around === 'earth'
        if (atEarth && earthGone) {
          e.body.visible = e.wire.visible = false
          continue
        }
        e.body.visible = e.wire.visible = true
        const center = atEarth
          ? earth!
          : (anchors.positions.get('sun') ?? origin)
        const radius =
          (atEarth
            ? bodyVisualRadius('earth') * EARTH_RING
            : sceneDistance(SUN_RING_AU, anchors.mode)) *
          (1 + 0.07 * e.rank)
        const speed = atEarth ? 0.12 : 0.025
        tilt.setFromAxisAngle(X, atEarth ? 0.4 : 0.12)
        const size = SHIP_SIZE[cls] * (atEarth ? EARTH_SHIP : SUN_SHIP)
        scale.setScalar(size)
        for (let i = 0; i < count; i++) {
          // 편대마다 고리의 다른 자리에서 한 줄로 돎
          const angle = e.rank * 1.7 + (i / count) * Math.PI * 0.9 + t * speed
          const lift = (i % 2 === 0 ? 1 : -1) * radius * 0.03
          pos.set(Math.cos(angle) * radius, lift, Math.sin(angle) * radius)
          pos.applyQuaternion(tilt).add(center)
          tangent
            .set(-Math.sin(angle), 0, Math.cos(angle))
            .applyQuaternion(tilt)
          normal.copy(Y).applyQuaternion(tilt)
          side.crossVectors(normal, tangent).normalize()
          basis.makeBasis(side, normal, tangent)
          q.setFromRotationMatrix(basis)
          m4.compose(pos, q, scale)
          for (const mesh of meshes) mesh!.setMatrixAt(i, m4)
        }
        for (const mesh of meshes) mesh!.instanceMatrix.needsUpdate = true
      }
    },
    dispose() {
      clear()
      bodyMaterial.dispose()
      wireMaterial.dispose()
      group.removeFromParent()
    },
  }
}
