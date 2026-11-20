/**
 * 우주 대전 3D: 두 세력의 함대를 싸움터 양쪽에 대형으로 세우고, 광선·탄과 폭발, 도착 연출
 * (워프 진입, 차원 균열, 시간의 틈, 벌레떼, 고대 요새의 깨어남), 행성 파괴포 발사를 그립니다.
 * 남은 전력(world/war.ts의 warStrength)만큼 함선이 남고, 줄어든 만큼 폭발하며 사라집니다.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import type { ShaderMaterial } from 'three'
import { clamp, seededRandom } from '@/shared/lib'
import type { BodyId } from '../../../../model/solar/bodies'
import {
  FACTION_BY_ID,
  SMALL_CLASSES,
  WEAPONS,
  fleetOf,
} from '../../../../model/war/catalog'
import type { Faction, ShipClassId } from '../../../../model/war/catalog'
import { WAR_AFTERGLOW_YEARS, warStrength } from '../../../../model/world/war'
import type { War, WorldState } from '../../../../model/world/types'
import { warIdOf, warSceneId } from '../../../../model/objects'
import { faceCamera, makeGlow } from '../../common'
import type { FrameContext, Target } from '../../types'
import {
  makeBodyMaterial,
  makeWireMaterial,
  setBodyUniforms,
} from '../beings/hologram'
import { SITE_SCALE, siteCenter } from '../sites'
import type { SiteAnchors } from '../sites'
import { SHIP_SIZE, lookKey, lookOf, shipGeometry } from './ships'
import { createLaserStorm } from '../../effects/laserStorm'
import type { LaserStorm } from '../../effects/laserStorm'

/** 함급마다 화면에 그리는 최대 척 수 (함대가 커도 이만큼만) */
const VISIBLE_MAX: Record<ShipClassId, number> = {
  fighter: 24,
  interceptor: 20,
  corsair: 16,
  swarmer: 40,
  drone: 24,
  mech: 12,
  frigate: 8,
  destroyer: 6,
  cruiser: 6,
  bioship: 4,
  battleship: 4,
  carrier: 2,
  dreadnought: 1,
  station: 1,
  fortress: 1,
}

/** 함대 대형의 줄 (앞 +z가 적 쪽) */
const ROW: Record<ShipClassId, number> = {
  fighter: 0.55,
  interceptor: 0.55,
  corsair: 0.5,
  swarmer: 0.65,
  drone: 0.5,
  mech: 0.4,
  frigate: -0.05,
  destroyer: -0.15,
  cruiser: -0.3,
  bioship: -0.75,
  battleship: -0.7,
  carrier: -0.95,
  dreadnought: -1.05,
  station: -1.25,
  fortress: -1.3,
}

/** 두 함대 사이의 반거리 (싸움터 배율을 곱함) */
const HALF_GAP = 1.9
/** 동시에 그리는 광선·탄 수 */
const BEAMS = 28
const BOOM_SECONDS = 0.9
const KILLER_SECONDS = 2.6
const ARRIVAL_SECONDS = 1.4

interface Slot {
  cls: ShipClassId
  /** 함대 안 자리: x 옆, y 위, z 앞(적 쪽) */
  home: Vector3
  phase: number
  small: boolean
  key: string
  index: number
  alive: boolean
  /** 이번 프레임의 장면 위치 */
  pos: Vector3
}

interface Fleet {
  faction: Faction
  /** a는 +1, b는 −1 (싸움터 축의 어느 쪽인지) */
  sign: 1 | -1
  slots: Slot[]
  meshes: Map<string, { body: InstancedMesh; wire: InstancedMesh }>
  bodyMaterial: ShaderMaterial
  wireMaterial: ShaderMaterial
  portal: Group | null
  opacity: number
}

interface Beam {
  from: Slot | null
  to: Slot | null
  side: 0 | 1
  start: number
  life: number
  color: string
}

interface Boom {
  mesh: Mesh
  start: number
  size: number
}

interface Visual {
  id: number
  root: Group
  fleets: [Fleet, Fleet]
  beams: Beam[]
  lines: LineSegments
  /** 전장 밖으로 길게 뻗는 장거리 레이저 (붉은색이 많음) */
  lances: LaserStorm
  booms: Boom[]
  pick: Mesh
  center: Vector3
  radius: number
  /** 처음 그린 시각 (장면 시간, 도착 연출) */
  appear: number | null
  killer: {
    firedAt: number | null
    target: Vector3 | null
    beam: Mesh
    flash: Mesh
  }
  disposed: boolean
}

export interface WarLayer {
  group: Group
  pickables: Mesh[]
  update(ctx: FrameContext, anchors: SiteAnchors): void
  target(sceneId: string): Target | null
  /** 하늘을 밝히는 섬광 세기 (행성 파괴포, 0~1) */
  flash(): number
  dispose(): void
}

const m4 = new Matrix4()
const q4 = new Quaternion()
const s3 = new Vector3()
const basis = new Matrix4()
const up = new Vector3(0, 1, 0)

/** 함대 대형을 짬 (시드가 같으면 같은 자리) */
function makeSlots(faction: Faction, war: War): Slot[] {
  const random = seededRandom(war.seed + (faction.id === war.a ? 1 : 2))
  const slots: Slot[] = []
  const keyCount = new Map<string, number>()
  for (const { cls, count } of fleetOf(faction, war.size)) {
    const shown = Math.min(VISIBLE_MAX[cls.id], count)
    const small = SMALL_CLASSES.includes(cls.id)
    const key = lookKey(lookOf(faction.id, cls.id))
    for (let i = 0; i < shown; i++) {
      const spread = small ? 1.3 : 0.32 + shown * 0.12
      const home = small
        ? new Vector3(
            (random() - 0.5) * 2 * spread,
            (random() - 0.5) * 0.9,
            ROW[cls.id] + (random() - 0.5) * 0.5,
          )
        : new Vector3(
            (i - (shown - 1) / 2) * (SHIP_SIZE[cls.id] * 2.4 + 0.12),
            (random() - 0.5) * 0.25,
            ROW[cls.id] + (random() - 0.5) * 0.1,
          )
      const index = keyCount.get(key) ?? 0
      keyCount.set(key, index + 1)
      slots.push({
        cls: cls.id,
        home,
        phase: random() * Math.PI * 2,
        small,
        key,
        index,
        alive: true,
        pos: new Vector3(),
      })
    }
  }
  return slots
}

/** 균열·시간의 틈 같은 도착 문 */
function makePortal(faction: Faction): Group | null {
  if (faction.arrival !== 'rift' && faction.arrival !== 'time') return null
  const portal = new Group()
  const material = () =>
    new MeshBasicMaterial({
      color: faction.color,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: AdditiveBlending,
    })
  if (faction.arrival === 'rift') {
    const glow = makeGlow(faction.color, 1.7, 0.9)
    glow.userData.glow = true
    portal.add(new Mesh(new TorusGeometry(0.95, 0.05, 8, 48), material()), glow)
  } else {
    // 시간의 틈: 서로 반대로 도는 두 고리와 눈금
    const outer = new Mesh(new TorusGeometry(0.9, 0.025, 6, 60), material())
    const inner = new Mesh(new TorusGeometry(0.62, 0.02, 6, 48), material())
    outer.name = 'outer'
    inner.name = 'inner'
    const glow = makeGlow(faction.color, 1.4, 0.7)
    glow.userData.glow = true
    portal.add(outer, inner, glow)
  }
  return portal
}

function makeFleet(faction: Faction, war: War, sign: 1 | -1): Fleet {
  return {
    faction,
    sign,
    slots: makeSlots(faction, war),
    meshes: new Map(),
    bodyMaterial: makeBodyMaterial(faction.color),
    wireMaterial: makeWireMaterial(faction.color),
    portal: makePortal(faction),
    opacity: 0,
  }
}

function makeVisual(war: War, group: Group, pickables: Mesh[]): Visual {
  const root = new Group()
  const fleets: [Fleet, Fleet] = [
    makeFleet(FACTION_BY_ID[war.a], war, 1),
    makeFleet(FACTION_BY_ID[war.b], war, -1),
  ]
  for (const fleet of fleets) if (fleet.portal) root.add(fleet.portal)
  // 광선·탄: 선분마다 색 (덧셈 섞기라 어두우면 흐려짐)
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(BEAMS * 6), 3),
  )
  geometry.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(BEAMS * 6), 3),
  )
  const lines = new LineSegments(
    geometry,
    new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  lines.frustumCulled = false
  const pick = new Mesh(
    new SphereGeometry(1, 12, 8),
    new MeshBasicMaterial({ visible: false }),
  )
  pick.userData.id = warSceneId(war.id)
  const killerBeam = new Mesh(
    new CylinderGeometry(1, 1, 1, 10, 1, true),
    new MeshBasicMaterial({
      color: WEAPONS.particle.color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  killerBeam.visible = false
  const killerFlash = makeGlow('#fff2c9', 1, 2.2)
  killerFlash.visible = false
  root.add(lines, pick, killerBeam, killerFlash)
  group.add(root)
  pickables.push(pick)
  const visual: Visual = {
    id: war.id,
    root,
    fleets,
    beams: Array.from({ length: BEAMS }, (_, k) => ({
      from: null,
      to: null,
      side: (k % 2) as 0 | 1,
      start: -1,
      life: 0,
      color: '#ffffff',
    })),
    lines,
    lances: createLaserStorm(10),
    booms: [],
    pick,
    center: new Vector3(),
    radius: 3,
    appear: null,
    killer: {
      firedAt: null,
      target: null,
      beam: killerBeam,
      flash: killerFlash,
    },
    disposed: false,
  }
  root.add(visual.lances.mesh)
  // 함선 모양은 따로 받아 오면 붙임 (같은 모양은 여러 전쟁이 함께 씀)
  for (const fleet of fleets) {
    const counts = new Map<string, number>()
    for (const slot of fleet.slots)
      counts.set(slot.key, (counts.get(slot.key) ?? 0) + 1)
    for (const [key, count] of counts) {
      const sample = fleet.slots.find((s) => s.key === key)!
      shipGeometry(lookOf(fleet.faction.id, sample.cls))
        .then((geometry) => {
          if (visual.disposed) return
          const body = new InstancedMesh(geometry, fleet.bodyMaterial, count)
          const wire = new InstancedMesh(geometry, fleet.wireMaterial, count)
          for (const mesh of [body, wire]) {
            mesh.frustumCulled = false
            mesh.userData.sharedGeometry = true
            m4.makeScale(0, 0, 0)
            for (let i = 0; i < count; i++) mesh.setMatrixAt(i, m4)
          }
          fleet.meshes.set(key, { body, wire })
          root.add(body, wire)
        })
        .catch(() => {})
    }
  }
  return visual
}

function disposeVisual(v: Visual, pickables: Mesh[]) {
  v.disposed = true
  v.root.removeFromParent()
  const i = pickables.indexOf(v.pick)
  if (i >= 0) pickables.splice(i, 1)
  v.root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh && !(o as LineSegments).isLineSegments) return
    if (!mesh.userData.sharedGeometry) mesh.geometry?.dispose()
    const material = mesh.material as { dispose?: () => void } | undefined
    material?.dispose?.()
  })
  for (const fleet of v.fleets) {
    fleet.bodyMaterial.dispose()
    fleet.wireMaterial.dispose()
  }
  v.lances.dispose()
}

const ease = (t: number) => 1 - (1 - t) ** 3

export function createWarLayer(): WarLayer {
  const group = new Group()
  const pickables: Mesh[] = []
  const visuals = new Map<number, Visual>()
  let skyFlash = 0

  function liveSlots(fleet: Fleet) {
    return fleet.slots.filter((s) => s.alive)
  }

  function updateVisual(
    v: Visual,
    war: War,
    world: WorldState,
    ctx: FrameContext,
    anchors: SiteAnchors,
  ) {
    const now = ctx.elapsed
    v.appear ??= now
    const sinceAppear = now - v.appear
    const scale = SITE_SCALE[war.site]
    const center = siteCenter(war.site, anchors)
    // 존재의 격돌과 겹치지 않게 싸움터 가운데에서 조금 비켜 남
    const radial = center.clone().normalize()
    const axis = new Vector3().crossVectors(radial, up)
    if (axis.lengthSq() < 1e-6) axis.set(1, 0, 0)
    axis.normalize()
    const lift = new Vector3().crossVectors(axis, radial).normalize()
    center.addScaledVector(lift, 2.4 * scale)
    v.center.copy(center)
    v.radius = (HALF_GAP + 0.4) * scale
    v.pick.position.copy(center)
    v.pick.scale.setScalar(v.radius * 0.8)

    const strength = warStrength(war, world.year)
    const over = war.status === 'over'
    const fade = over
      ? clamp(1 - (world.year - war.endYear) / WAR_AFTERGLOW_YEARS, 0, 1)
      : 1
    const reduced = ctx.reducedMotion
    const t = reduced ? 0 : now

    v.fleets.forEach((fleet, k) => {
      const side = k === 0 ? 'a' : 'b'
      const lost = over && war.winner !== side
      const left = lost ? 0 : Math.min(1, strength[side])
      const goal = lost ? 0 : fade
      fleet.opacity += (goal - fleet.opacity) * Math.min(1, ctx.dt * 3)
      const forward = axis.clone().multiplyScalar(fleet.sign)
      const origin = center.clone().addScaledVector(forward, -HALF_GAP * scale)
      // 도착 연출: 워프는 멀리서 미끄러져 들어오고, 벌레떼·각성은 커지며 나타남
      const arrival = reduced
        ? 1
        : ease(clamp(sinceAppear / ARRIVAL_SECONDS, 0, 1))
      if (fleet.faction.arrival === 'warp' || fleet.faction.arrival === 'time')
        origin.addScaledVector(forward, -(1 - arrival) * 8 * scale)
      const grow =
        fleet.faction.arrival === 'swarm' || fleet.faction.arrival === 'awaken'
          ? arrival
          : 1
      // 함대 축: x 옆(lift×forward), y 위(lift), z 앞(forward)
      const side3 = new Vector3().crossVectors(lift, forward).normalize()
      basis.makeBasis(side3, lift, forward)
      q4.setFromRotationMatrix(basis)
      // 남은 전력만큼 함선을 남김 (큰 함선은 늦게 잃음)
      const order = fleet.slots
        .map((slot, i) => ({ slot, i }))
        .sort((x, y) => SHIP_SIZE[x.slot.cls] - SHIP_SIZE[y.slot.cls])
      const keep = Math.ceil(order.length * left)
      order.forEach(({ slot }, rank) => {
        const alive = rank >= order.length - keep
        if (slot.alive && !alive && fleet.opacity > 0.2 && !reduced)
          boom(v, slot.pos, SHIP_SIZE[slot.cls] * scale * 3, now)
        slot.alive = alive
      })
      for (const slot of fleet.slots) {
        const local = slot.home.clone()
        if (slot.small) {
          // 작은 함선은 적 쪽으로 돌진했다 돌아오는 고리를 그림
          local.z += 0.55 * Math.sin(t * 0.9 + slot.phase)
          local.x += 0.25 * Math.sin(t * 0.6 + slot.phase * 1.7)
          local.y += 0.15 * Math.cos(t * 0.8 + slot.phase)
        } else local.y += 0.03 * Math.sin(t * 0.4 + slot.phase)
        slot.pos
          .copy(origin)
          .addScaledVector(side3, local.x * scale)
          .addScaledVector(lift, local.y * scale)
          .addScaledVector(forward, local.z * scale)
        const meshes = fleet.meshes.get(slot.key)
        if (!meshes) continue
        const size = slot.alive ? SHIP_SIZE[slot.cls] * scale * grow : 0
        s3.setScalar(size)
        m4.compose(slot.pos, q4, s3)
        meshes.body.setMatrixAt(slot.index, m4)
        meshes.wire.setMatrixAt(slot.index, m4)
      }
      for (const { body, wire } of fleet.meshes.values()) {
        body.instanceMatrix.needsUpdate = true
        wire.instanceMatrix.needsUpdate = true
      }
      setBodyUniforms(fleet.bodyMaterial, fleet.opacity, now)
      setBodyUniforms(fleet.wireMaterial, fleet.opacity * 0.55, now)
      if (fleet.portal) {
        fleet.portal.visible = fleet.opacity > 0.01 && !over
        fleet.portal.position
          .copy(center)
          .addScaledVector(forward, -(HALF_GAP + 1.6) * scale)
        fleet.portal.quaternion.copy(q4)
        fleet.portal.scale.setScalar(scale * (0.8 + 0.2 * arrival))
        if (!reduced) {
          fleet.portal.rotateZ(now * 0.6)
          fleet.portal.getObjectByName('inner')?.rotateZ(-now * 1.4)
        }
        fleet.portal.traverse((o) => {
          if (o.userData.glow) faceCamera(o, ctx.camera)
        })
      }
    })

    updateBeams(v, now, over || reduced)
    updateLances(v, now, over || reduced, scale)
    updateBooms(v, now, ctx)
    updateKiller(v, war, now, anchors, scale, ctx)
  }

  function boom(v: Visual, at: Vector3, size: number, now: number) {
    if (v.booms.length > 24) return
    const mesh = makeGlow('#ffd2a0', 1, 1.8)
    mesh.position.copy(at)
    v.root.add(mesh)
    v.booms.push({ mesh, start: now, size })
  }

  /** 큰 함선이 적을 꿰뚫고 태양계 너머로 뻗거나, 먼 곳에서 날아드는 장거리 레이저 */
  function updateLances(v: Visual, now: number, idle: boolean, scale: number) {
    const random = Math.random
    v.lances.update(now, !idle, 0.02 * scale, () => {
      const k = random() < 0.5 ? 0 : 1
      const shooters = liveSlots(v.fleets[k]).filter((s) => !s.small)
      const targets = liveSlots(v.fleets[1 - k])
      if (shooters.length === 0 || targets.length === 0) return null
      const from = shooters[Math.floor(random() * shooters.length)].pos
      const to = targets[Math.floor(random() * targets.length)].pos
      const dir = to.clone().sub(from).normalize()
      const palette = v.fleets[k].faction.lasers
      const color = palette[Math.floor(random() * palette.length)]
      const far = (40 + random() * 50) * scale
      if (random() < 0.65)
        return {
          from: from.clone(),
          to: from.clone().addScaledVector(dir, far),
          color,
          tail: random() < 0.5 ? 0.18 : 1,
        }
      // 먼 곳의 함대가 쏜 포격이 날아듦
      const away = new Vector3(
        random() - 0.5,
        (random() - 0.5) * 0.4,
        random() - 0.5,
      ).normalize()
      return {
        from: to.clone().addScaledVector(away, far),
        to: to.clone(),
        color,
        tail: 0.2,
      }
    })
  }

  function updateBooms(v: Visual, now: number, ctx: FrameContext) {
    v.booms = v.booms.filter((b) => {
      const k = (now - b.start) / BOOM_SECONDS
      if (k >= 1) {
        b.mesh.removeFromParent()
        b.mesh.geometry.dispose()
        ;(b.mesh.material as ShaderMaterial).dispose()
        return false
      }
      b.mesh.scale.setScalar(b.size * (0.3 + ease(k)))
      ;(b.mesh.material as ShaderMaterial).uniforms.uIntensity.value =
        1.8 * (1 - k)
      faceCamera(b.mesh, ctx.camera)
      return true
    })
  }

  function updateBeams(v: Visual, now: number, idle: boolean) {
    const position = v.lines.geometry.getAttribute(
      'position',
    ) as BufferAttribute
    const color = v.lines.geometry.getAttribute('color') as BufferAttribute
    const random = Math.random
    const tint = new Color()
    v.beams.forEach((beam, k) => {
      const shooter = v.fleets[beam.side]
      const target = v.fleets[1 - beam.side]
      if (!idle && (beam.from === null || now - beam.start > beam.life)) {
        const from = liveSlots(shooter)
        const to = liveSlots(target)
        beam.from = from.length
          ? from[Math.floor(random() * from.length)]
          : null
        beam.to = to.length ? to[Math.floor(random() * to.length)] : null
        beam.start = now + random() * 0.25
        beam.life = 0.35 + random() * 0.5
        const palette = shooter.faction.lasers
        beam.color = palette[Math.floor(random() * palette.length)]
      }
      const weapon = WEAPONS[shooter.faction.weapon]
      const age = (now - beam.start) / Math.max(beam.life, 1e-3)
      const on =
        !idle &&
        beam.from?.alive &&
        beam.to?.alive &&
        age >= 0 &&
        age <= 1 &&
        shooter.opacity > 0.05
      if (!on) {
        for (let j = 0; j < 2; j++) color.setXYZ(k * 2 + j, 0, 0, 0)
        return
      }
      const p0 = beam.from!.pos
      const p1 = beam.to!.pos
      let a = 0
      let b = 1
      if (weapon.look === 'bolt') {
        // 날아가는 탄: 짧은 토막이 쏜 쪽에서 맞는 쪽으로
        a = age * 0.85
        b = a + 0.15
      }
      position.setXYZ(
        k * 2,
        p0.x + (p1.x - p0.x) * a,
        p0.y + (p1.y - p0.y) * a,
        p0.z + (p1.z - p0.z) * a,
      )
      position.setXYZ(
        k * 2 + 1,
        p0.x + (p1.x - p0.x) * b,
        p0.y + (p1.y - p0.y) * b,
        p0.z + (p1.z - p0.z) * b,
      )
      const flicker =
        (weapon.look === 'beam' ? Math.sin(age * Math.PI) : 1) * shooter.opacity
      tint.set(beam.color).multiplyScalar(flicker)
      for (let j = 0; j < 2; j++)
        color.setXYZ(k * 2 + j, tint.r, tint.g, tint.b)
    })
    position.needsUpdate = true
    color.needsUpdate = true
  }

  function updateKiller(
    v: Visual,
    war: War,
    now: number,
    anchors: SiteAnchors,
    scale: number,
    ctx: FrameContext,
  ) {
    const { killer } = v
    if (war.target) {
      const p = anchors.positions.get(war.target as BodyId)
      if (p) killer.target = (killer.target ?? new Vector3()).copy(p)
    }
    const fired = war.rounds.some(
      (r) => r.done && r.specials.some((s) => s.id === 'planet-killer'),
    )
    if (fired && killer.firedAt === null) killer.firedAt = now
    const age = killer.firedAt === null ? Infinity : now - killer.firedAt
    const shooterIndex = v.fleets.findIndex((f) =>
      f.faction.specials.includes('planet-killer'),
    )
    const shooter = shooterIndex >= 0 ? v.fleets[shooterIndex] : null
    const flagship = shooter?.slots.find((s) => s.cls === 'dreadnought')
    const target =
      killer.target ??
      (shooter ? v.fleets[1 - shooterIndex].slots[0]?.pos : null)
    const active =
      age < KILLER_SECONDS && flagship && target && !ctx.reducedMotion
    killer.beam.visible = Boolean(active)
    killer.flash.visible = Boolean(active)
    if (!active) return
    const k = age / KILLER_SECONDS
    const from = flagship!.pos
    const to = target!
    const mid = from.clone().add(to).multiplyScalar(0.5)
    const length = from.distanceTo(to)
    killer.beam.position.copy(mid)
    killer.beam.quaternion.setFromUnitVectors(
      up,
      to.clone().sub(from).normalize(),
    )
    const width = 0.05 * scale * (1 - k * 0.6)
    killer.beam.scale.set(width, length, width)
    ;(killer.beam.material as MeshBasicMaterial).opacity = 0.9 * (1 - k)
    killer.flash.position.copy(to)
    killer.flash.scale.setScalar(scale * (1.2 + 2.5 * ease(k)))
    faceCamera(killer.flash, ctx.camera)
    skyFlash = Math.max(skyFlash, 0.7 * (1 - k))
  }

  return {
    group,
    pickables,
    update(ctx, anchors) {
      skyFlash = 0
      const world = ctx.world
      const wars = world.wars
      const wanted = new Set(wars.map((w) => w.id))
      for (const [id, v] of visuals)
        if (!wanted.has(id)) {
          disposeVisual(v, pickables)
          visuals.delete(id)
        }
      for (const war of wars) {
        let v = visuals.get(war.id)
        if (!v) {
          v = makeVisual(war, group, pickables)
          visuals.set(war.id, v)
        }
        updateVisual(v, war, world, ctx, anchors)
      }
    },
    target(sceneId) {
      const id = warIdOf(sceneId)
      const v = id !== null ? visuals.get(id) : undefined
      if (!v) return null
      return { position: v.center.clone(), radius: v.radius }
    },
    flash: () => skyFlash,
    dispose() {
      for (const v of visuals.values()) disposeVisual(v, pickables)
      visuals.clear()
      group.removeFromParent()
    },
  }
}
