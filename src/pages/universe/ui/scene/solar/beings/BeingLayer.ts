/**
 * 태양계 장면의 우주적 존재: 싸움터에 존재를 별자리 모양으로 그리고,
 * 격돌 중에는 두 존재 사이에 번개 선과 여파 섬광을, 태양 잠식 때는 해를 가리는 원판을 그립니다.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Points,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three'
import { clamp, seededRandom } from '@/shared/lib'
import type { BodyId } from '../../../../model/solar/bodies'
import { bodyVisualRadius, sceneDistance } from '../../../../model/solar/scale'
import type { DistanceMode } from '../../../../model/solar/scale'
import { BEING_BY_ID } from '../../../../model/mythic/catalog'
import type { Being, SiteId } from '../../../../model/mythic/catalog'
import { BATTLE_AFTERGLOW_YEARS } from '../../../../model/world/mythic'
import type { Battle, WorldState } from '../../../../model/world/types'
import { beingIdOf, beingSceneId } from '../../../../model/objects'
import {
  disposeObject,
  faceCamera,
  makeGlow,
  raDecToScene,
  setLine,
} from '../../common'
import type { FrameContext, Target } from '../../types'
import { drawBeing } from './figures'
import type { Drawing } from './figures'

const MAX_LINE_VERTS = 4000
const HAZE = 640
const MAX_STARS = 160
const MAX_POINTS = HAZE + MAX_STARS

const pointsVertex = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aTint;
uniform float uPixelScale;
uniform float uPixelRatio;
varying float vAlpha;
varying vec3 vTint;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(aSize * uPixelScale / max(-mv.z, 1e-3), 1.0, 30.0) * uPixelRatio;
  vAlpha = aAlpha;
  vTint = aTint;
  gl_Position = projectionMatrix * mv;
}
`

const pointsFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
varying vec3 vTint;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float a = exp(-d * 3.5);
  gl_FragColor = vec4(uColor * vTint * (0.7 + 0.6 * a), a * vAlpha * uOpacity);
}
`

/** 싸움터의 존재 크기 (태양만 하게, 멀리 있는 싸움터는 크게 보이게) */
const SITE_SCALE: Record<SiteId, number> = {
  sun: 1,
  earth: 1,
  mars: 1,
  jupiter: 1,
  kuiper: 2.6,
  deep: 120,
}
const BASE_RADIUS = 1.3

/** 은하 중심 방향 (궁수자리 A*) */
const GALACTIC_CENTRE = raDecToScene(266.4, -28.9)

interface Visual {
  being: Being
  root: Group
  figure: Group
  lines: LineSegments
  points: Points
  aura: Mesh
  core: Mesh
  pick: Mesh
  /** 획 위의 안개 입자: [획 번호, 획 위 위치, 흩어짐 x, y, 흐름 속도, 크기] */
  seeds: Float32Array
  strokeCount: number
  radius: number
  opacity: number
  /** 지금 보여야 하는지 (아니면 사라지는 중) */
  wanted: boolean
}

interface Clash {
  arc: Line
  ring: LineLoop
  progress: Line
  pulses: number
  key: string
}

interface Flash {
  mesh: Mesh
  start: number
}

export interface BeingAnchors {
  positions: Map<BodyId, Vector3>
  sunRadius: number
  mode: DistanceMode
  /** 태양이 보이는지 (블랙홀이면 가릴 해가 없음) */
  sunShining: boolean
}

export interface BeingLayer {
  group: Group
  pickables: Mesh[]
  update(ctx: FrameContext, anchors: BeingAnchors): void
  target(sceneId: string): Target | null
  /** 하늘을 밝히는 섬광 세기 (0~1) */
  flash(): number
  dispose(): void
}

function makePointsMaterial(color: string) {
  return new ShaderMaterial({
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    uniforms: {
      uColor: { value: new Color(color) },
      uOpacity: { value: 0 },
      uPixelScale: { value: 500 },
      uPixelRatio: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
}

function makeVisual(being: Being, group: Group, pickables: Mesh[]): Visual {
  const root = new Group()
  const figure = new Group()
  const lineGeometry = new BufferGeometry()
  lineGeometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(MAX_LINE_VERTS * 3), 3),
  )
  lineGeometry.setDrawRange(0, 0)
  const lines = new LineSegments(
    lineGeometry,
    new LineBasicMaterial({
      color: being.color,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  )
  lines.frustumCulled = false
  lines.renderOrder = 7
  const pointGeometry = new BufferGeometry()
  pointGeometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(MAX_POINTS * 3), 3),
  )
  pointGeometry.setAttribute(
    'aSize',
    new BufferAttribute(new Float32Array(MAX_POINTS), 1),
  )
  pointGeometry.setAttribute(
    'aAlpha',
    new BufferAttribute(new Float32Array(MAX_POINTS), 1),
  )
  pointGeometry.setAttribute(
    'aTint',
    new BufferAttribute(new Float32Array(MAX_POINTS * 3).fill(1), 3),
  )
  const points = new Points(pointGeometry, makePointsMaterial(being.color))
  points.frustumCulled = false
  points.renderOrder = 7
  // 공허·동공을 가리는 검은 핵
  const core = new Mesh(
    new CircleGeometry(1, 40),
    new MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  )
  core.renderOrder = 6
  core.visible = false
  figure.add(core, lines, points)
  const aura = makeGlow(being.color, 1, 0)
  const pick = new Mesh(
    new SphereGeometry(1, 12, 8),
    new MeshBasicMaterial({ visible: false }),
  )
  pick.userData.id = beingSceneId(being.id)
  root.add(aura, figure, pick)
  group.add(root)
  pickables.push(pick)
  // 안개 입자 씨앗 (존재마다 같은 무늬)
  const random = seededRandom(
    [...being.id].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) >>> 0,
  )
  const seeds = new Float32Array(HAZE * 6)
  for (let i = 0; i < HAZE; i++)
    seeds.set(
      [
        random(),
        random(),
        (random() - 0.5) * 0.09,
        (random() - 0.5) * 0.09,
        0.02 + random() * 0.08,
        0.012 + random() * 0.03,
      ],
      i * 6,
    )
  return {
    being,
    root,
    figure,
    lines,
    points,
    aura,
    core,
    pick,
    seeds,
    strokeCount: 0,
    radius: 1,
    opacity: 0,
    wanted: true,
  }
}

/** 획 길이를 따라 위치 u(0~1)의 점 */
function along(stroke: number[], u: number, out: number[]) {
  const n = stroke.length / 3
  if (n < 2) {
    out[0] = stroke[0] ?? 0
    out[1] = stroke[1] ?? 0
    out[2] = stroke[2] ?? 0
    return
  }
  const f = u * (n - 1)
  const i = Math.min(n - 2, Math.floor(f))
  const k = f - i
  for (let c = 0; c < 3; c++)
    out[c] = stroke[i * 3 + c] * (1 - k) + stroke[(i + 1) * 3 + c] * k
}

const tmpPoint = [0, 0, 0]
const hsl = new Color()

/** 그림을 버퍼에 옮김: 획 → 선분, 별, 획을 따라 흐르는 안개 */
function fill(visual: Visual, drawing: Drawing, t: number) {
  const linePos = visual.lines.geometry.attributes.position as BufferAttribute
  let v = 0
  for (const s of drawing.strokes) {
    const n = s.length / 3
    for (let i = 0; i < n - 1 && v < MAX_LINE_VERTS - 2; i++) {
      linePos.setXYZ(v++, s[i * 3], s[i * 3 + 1], s[i * 3 + 2])
      linePos.setXYZ(v++, s[i * 3 + 3], s[i * 3 + 4], s[i * 3 + 5])
    }
  }
  linePos.needsUpdate = true
  visual.lines.geometry.setDrawRange(0, v)

  const geo = visual.points.geometry
  const pos = geo.attributes.position as BufferAttribute
  const size = geo.attributes.aSize as BufferAttribute
  const alpha = geo.attributes.aAlpha as BufferAttribute
  const tint = geo.attributes.aTint as BufferAttribute
  let p = 0
  // 획 끝과 몇 마디마다 별
  for (const s of drawing.strokes) {
    const n = s.length / 3
    for (
      let i = 0;
      i < n && p < MAX_STARS;
      i += Math.max(1, Math.floor(n / 3))
    ) {
      pos.setXYZ(p, s[i * 3], s[i * 3 + 1], s[i * 3 + 2])
      size.setX(p, 0.045)
      alpha.setX(p, 0.9)
      tint.setXYZ(p, 1.3, 1.3, 1.3)
      p++
    }
  }
  for (let i = 0; i + 3 < drawing.stars.length && p < MAX_STARS; i += 4) {
    pos.setXYZ(p, drawing.stars[i], drawing.stars[i + 1], drawing.stars[i + 2])
    size.setX(p, 0.07 * drawing.stars[i + 3])
    alpha.setX(p, 1)
    tint.setXYZ(p, 1.6, 1.6, 1.6)
    p++
  }
  // 안개 입자
  const seeds = visual.seeds
  const strokes = drawing.strokes
  const cloud = drawing.cloud
  const colourful =
    visual.being.form === 'colour' || visual.being.form === 'globes'
  for (let i = 0; i < HAZE && p < MAX_POINTS; i++) {
    const s0 = seeds[i * 6]
    const u0 = seeds[i * 6 + 1]
    const jx = seeds[i * 6 + 2]
    const jy = seeds[i * 6 + 3]
    const speed = seeds[i * 6 + 4]
    const grain = seeds[i * 6 + 5]
    if (cloud) {
      if (i >= cloud.count) break
      // 떼·구름: 저마다 다른 리사주 궤도로 맴돎
      const a = u0 * 6.283 + t * cloud.swirl * (0.4 + speed * 8)
      const b = s0 * 6.283 + t * cloud.swirl * (0.3 + speed * 6)
      const r = cloud.spread * (0.25 + 0.75 * Math.sqrt(s0))
      pos.setXYZ(
        p,
        Math.sin(a) * r,
        Math.cos(b) * r * 0.75,
        Math.sin(a + b) * r * 0.3,
      )
      size.setX(p, grain * (visual.being.form === 'swarm' ? 0.8 : 1.6))
      alpha.setX(p, 0.55)
    } else {
      if (strokes.length === 0) break
      const stroke = strokes[Math.floor(s0 * strokes.length) % strokes.length]
      along(stroke, (u0 + t * speed) % 1, tmpPoint)
      const wobble = Math.sin(t * 2 + i) * 0.01
      pos.setXYZ(
        p,
        tmpPoint[0] + jx + wobble,
        tmpPoint[1] + jy,
        tmpPoint[2] + jx * 0.5,
      )
      size.setX(p, grain)
      alpha.setX(p, 0.6)
    }
    if (colourful) {
      // 이름 붙일 수 없는 빛깔: 입자마다 색이 천천히 바뀜
      hsl.setHSL((u0 + t * 0.05 + s0 * 0.3) % 1, 0.7, 0.6)
      tint.setXYZ(p, hsl.r * 1.4, hsl.g * 1.4, hsl.b * 1.4)
    } else tint.setXYZ(p, 1, 1, 1)
    p++
  }
  geo.setDrawRange(0, p)
  pos.needsUpdate = true
  size.needsUpdate = true
  alpha.needsUpdate = true
  tint.needsUpdate = true
  visual.strokeCount = strokes.length
}

const right = new Vector3()
const up = new Vector3()

export function createBeingLayer(): BeingLayer {
  const group = new Group()
  const pickables: Mesh[] = []
  const visuals = new Map<string, Visual>()
  const clashes = new Map<number, Clash>()
  const flashes: Flash[] = []
  let skyFlash = 0

  // 해를 무는 원판 (태양 잠식)
  const bite = new Mesh(
    new CircleGeometry(1, 48),
    new MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0.94,
    }),
  )
  bite.renderOrder = 4
  bite.visible = false
  // 먼 싸움터(은하 중심 쪽)의 하늘 빛
  const deepGlow = makeGlow('#c8a8ff', 1, 0, 0.5)
  deepGlow.visible = false
  group.add(bite, deepGlow)

  function siteCenter(site: SiteId, anchors: BeingAnchors): Vector3 {
    const near = (id: BodyId) => {
      const p = anchors.positions.get(id)
      if (!p) return null
      const out = p.clone().normalize()
      return p
        .clone()
        .add(out.multiplyScalar(bodyVisualRadius(id) * 3 + 2.6))
        .add(new Vector3(0, 0.9, 0))
    }
    switch (site) {
      case 'sun':
        return new Vector3(Math.cos(3.5), 0.25, Math.sin(3.5))
          .normalize()
          .multiplyScalar(anchors.sunRadius * 1.6 + 3.6)
      case 'earth':
      case 'mars':
      case 'jupiter':
        return near(site) ?? new Vector3(0, 6, 0)
      case 'kuiper':
        return new Vector3(Math.cos(2.1), 0.12, Math.sin(2.1))
          .normalize()
          .multiplyScalar(sceneDistance(45, anchors.mode))
      case 'deep':
        return GALACTIC_CENTRE.clone().multiplyScalar(2600)
    }
  }

  function visualOf(id: string): Visual {
    let v = visuals.get(id)
    if (!v) {
      v = makeVisual(BEING_BY_ID[id], group, pickables)
      visuals.set(id, v)
    }
    return v
  }

  function clashOf(battle: Battle): Clash {
    let c = clashes.get(battle.id)
    const key = `${battle.id}:${battle.startYear}`
    if (c && c.key !== key) {
      removeClash(battle.id)
      c = undefined
    }
    if (!c) {
      const arc = new Line(
        new BufferGeometry(),
        new LineBasicMaterial({
          color: '#e8f0ff',
          transparent: true,
          opacity: 0,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      )
      const ring = new LineLoop(
        new BufferGeometry(),
        new LineBasicMaterial({
          color: '#ffffff',
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      )
      const progress = new Line(
        new BufferGeometry(),
        new LineBasicMaterial({
          color: '#ff9a9a',
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      )
      for (const o of [arc, ring, progress]) {
        o.frustumCulled = false
        group.add(o)
      }
      c = {
        arc,
        ring,
        progress,
        pulses: battle.pulses.filter((p) => p.done).length,
        key,
      }
      clashes.set(battle.id, c)
    }
    return c
  }

  function removeClash(id: number) {
    const c = clashes.get(id)
    if (!c) return
    for (const o of [c.arc, c.ring, c.progress]) {
      group.remove(o)
      disposeObject(o)
    }
    clashes.delete(id)
  }

  function addFlash(at: Vector3, color: string, size: number, now: number) {
    const mesh = makeGlow(color, size, 1.6, 1)
    mesh.position.copy(at)
    group.add(mesh)
    flashes.push({ mesh, start: now })
  }

  /** 격돌의 두 존재를 화면에서 나란히 (카메라 오른쪽으로 벌려) 놓음 */
  function place(
    battle: Battle,
    world: WorldState,
    ctx: FrameContext,
    anchors: BeingAnchors,
  ) {
    const center = siteCenter(battle.site, anchors)
    const scale = SITE_SCALE[battle.site]
    const over = battle.status === 'over'
    const ids = [battle.a, battle.b].filter(Boolean) as string[]
    const shown = over ? ids.filter((id) => id === battle.winner) : ids
    const radii = ids.map(
      (id) => BASE_RADIUS * (BEING_BY_ID[id].size ?? 1) * scale,
    )
    right.setFromMatrixColumn(ctx.camera.matrixWorld, 0)
    up.setFromMatrixColumn(ctx.camera.matrixWorld, 1)
    const gap = ids.length === 2 ? (radii[0] + radii[1]) * 0.62 : 0
    const t = ctx.reducedMotion ? 0 : ctx.elapsed
    ids.forEach((id, k) => {
      if (!shown.includes(id)) return
      const v = visualOf(id)
      v.wanted = true
      v.radius = radii[k]
      const side = ids.length === 2 ? (k === 0 ? -1 : 1) : 0
      const bob = Math.sin(t * 0.6 + k * 2) * 0.06 * v.radius
      v.root.position
        .copy(center)
        .addScaledVector(right, side * gap)
        .addScaledVector(up, bob)
    })

    const clash = clashOf(battle)
    const done = battle.pulses.filter((p) => p.done).length
    // 여파가 터질 때마다 섬광
    if (done > clash.pulses && !ctx.reducedMotion) {
      const actor = battle.pulses.filter((p) => p.done).at(-1)?.actor
      const actorId = actor === 'b' && battle.b ? battle.b : battle.a
      const v = visuals.get(actorId)
      const at = v ? v.root.position.clone().lerp(center, 0.5) : center
      addFlash(at, BEING_BY_ID[actorId].color, radii[0] * 2.6, ctx.elapsed)
      skyFlash = Math.max(skyFlash, battle.site === 'deep' ? 1 : 0.45)
    }
    clash.pulses = done
    // 두 존재 사이의 번개 선
    const a = visuals.get(battle.a)
    const b = battle.b ? visuals.get(battle.b) : undefined
    const arcMat = clash.arc.material as LineBasicMaterial
    if (a && b && !over) {
      const random = seededRandom(Math.floor(ctx.elapsed * 12) + battle.id)
      const pts: Vector3[] = []
      const from = a.root.position
      const to = b.root.position
      const span = from.distanceTo(to)
      for (let i = 0; i <= 16; i++) {
        const p = from.clone().lerp(to, i / 16)
        if (i > 0 && i < 16 && !ctx.reducedMotion)
          p.addScaledVector(up, (random() - 0.5) * span * 0.12)
        pts.push(p)
      }
      setLine(clash.arc, pts)
      arcMat.opacity = ctx.reducedMotion
        ? 0.25
        : 0.25 + 0.45 * Math.abs(Math.sin(ctx.elapsed * 7 + battle.id))
    } else arcMat.opacity = 0
    // 홀로 강림: 둘레의 원과 재앙까지 남은 시간
    const ringMat = clash.ring.material as LineBasicMaterial
    const progMat = clash.progress.material as LineBasicMaterial
    if (!battle.b && !over && a) {
      const r = a.radius * 1.35
      const turn = t * 0.2
      const ring: Vector3[] = []
      const prog: Vector3[] = []
      const share = clamp(
        (world.year - battle.startYear) / (battle.endYear - battle.startYear),
        0,
        1,
      )
      for (let i = 0; i < 64; i++) {
        const ang = (i / 64) * Math.PI * 2 + turn
        ring.push(
          a.root.position
            .clone()
            .addScaledVector(right, Math.cos(ang) * r)
            .addScaledVector(up, Math.sin(ang) * r),
        )
      }
      for (let i = 0; i <= 48; i++) {
        const ang = Math.PI / 2 - (i / 48) * share * Math.PI * 2
        prog.push(
          a.root.position
            .clone()
            .addScaledVector(right, Math.cos(ang) * r * 1.08)
            .addScaledVector(up, Math.sin(ang) * r * 1.08),
        )
      }
      setLine(clash.ring, ring)
      setLine(clash.progress, prog)
      ringMat.opacity = 0.35
      progMat.opacity = 0.75
    } else {
      ringMat.opacity = 0
      progMat.opacity = 0
    }
    if (battle.site === 'deep' && !over) {
      deepGlow.visible = true
      deepGlow.position.copy(center)
      deepGlow.scale.setScalar(radii[0] * 6)
      ;(deepGlow.material as ShaderMaterial).uniforms.uIntensity.value = 0.35
      faceCamera(deepGlow, ctx.camera)
    }
  }

  function removeVisual(id: string) {
    const v = visuals.get(id)
    if (!v) return
    group.remove(v.root)
    disposeObject(v.root)
    pickables.splice(pickables.indexOf(v.pick), 1)
    visuals.delete(id)
  }

  return {
    group,
    pickables,
    update(ctx, anchors) {
      const world = ctx.world
      for (const v of visuals.values()) v.wanted = false
      deepGlow.visible = false
      const battles = world.battles.filter(
        (b) =>
          b.status === 'raging' ||
          world.year - b.endYear < BATTLE_AFTERGLOW_YEARS,
      )
      for (const battle of battles) place(battle, world, ctx, anchors)
      for (const id of [...clashes.keys()])
        if (!battles.some((b) => b.id === id)) removeClash(id)

      const t = ctx.reducedMotion ? 0 : ctx.elapsed
      const pixelScale =
        (ctx.height / 2) * ctx.camera.projectionMatrix.elements[5]
      for (const [id, v] of [...visuals]) {
        // 나타날 때·사라질 때 1초 남짓 흐려지거나 밝아짐
        const step = ctx.reducedMotion ? 1 : ctx.dt * 1.2
        v.opacity = clamp(v.opacity + (v.wanted ? step : -step), 0, 1)
        if (!v.wanted && v.opacity <= 0) {
          removeVisual(id)
          continue
        }
        const drawing = drawBeing(
          v.being.form,
          v.being.shape ?? {},
          t + id.length,
        )
        fill(v, drawing, t)
        v.figure.scale.setScalar(v.radius)
        if (drawing.space === 'screen') faceCamera(v.figure, ctx.camera)
        else v.figure.rotation.set(0.35, 0, 0)
        ;(v.lines.material as LineBasicMaterial).opacity = 0.85 * v.opacity
        const pm = (v.points.material as ShaderMaterial).uniforms
        pm.uOpacity.value = v.opacity
        pm.uPixelScale.value = pixelScale * v.radius
        pm.uPixelRatio.value = ctx.pixelRatio
        v.core.visible = Boolean(drawing.core)
        if (drawing.core) {
          v.core.scale.setScalar(drawing.core)
          ;(v.core.material as MeshBasicMaterial).opacity = 0.92 * v.opacity
        }
        v.aura.scale.setScalar(v.radius * 3.2)
        const glow = (v.aura.material as ShaderMaterial).uniforms
        glow.uIntensity.value = 0.45 * v.opacity
        glow.uTime.value = ctx.elapsed
        faceCamera(v.aura, ctx.camera)
        v.pick.scale.setScalar(v.radius * 0.9)
      }

      // 여파 섬광
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i]
        const k = (ctx.elapsed - f.start) / 1.4
        if (k > 1) {
          group.remove(f.mesh)
          disposeObject(f.mesh)
          flashes.splice(i, 1)
          continue
        }
        f.mesh.scale.setScalar(
          (f.mesh.userData.base ??= f.mesh.scale.x) * (0.4 + k),
        )
        ;(f.mesh.material as ShaderMaterial).uniforms.uIntensity.value =
          1.6 * (1 - k) ** 1.5
        faceCamera(f.mesh, ctx.camera)
      }
      skyFlash *= Math.exp(-ctx.dt / 0.6)

      // 태양 잠식: 해 앞에 검은 원판을 비껴 놓아 이지러진 모습으로
      const dim = world.solarDim
      bite.visible = anchors.sunShining && dim > 0.01
      if (bite.visible) {
        const toCamera = ctx.camera.position.clone().normalize()
        right.setFromMatrixColumn(ctx.camera.matrixWorld, 0)
        const r = anchors.sunRadius
        bite.position
          .copy(toCamera)
          .multiplyScalar(r * 1.15)
          .addScaledVector(right, r * 2.1 * (1 - Math.sqrt(dim)))
        bite.scale.setScalar(r * 1.03)
        faceCamera(bite, ctx.camera)
      }
    },
    target(sceneId) {
      const id = beingIdOf(sceneId)
      const v = id ? visuals.get(id) : undefined
      if (!v || !v.wanted) return null
      return { position: v.root.position.clone(), radius: v.radius * 1.2 }
    },
    flash: () => skyFlash,
    dispose() {
      for (const id of [...visuals.keys()]) removeVisual(id)
      for (const id of [...clashes.keys()]) removeClash(id)
      for (const f of flashes) disposeObject(f.mesh)
      disposeObject(group)
    },
  }
}
