/**
 * 3D 몸에 덧붙이는 것: 날개(깃털·막), 후광, 해 원반, 뿔, 불꽃 깃, 뱀 꼬리.
 * 몸의 자리(머리·등·엉덩이·꼬리)를 매 프레임 따라가고, 재질은 몸과 같은 홀로그램 결입니다
 * (몸에 주는 물결 변형은 받지 않게 재질을 따로 둠).
 */
import {
  BufferGeometry,
  CircleGeometry,
  ConeGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Mesh,
  Quaternion,
  TorusGeometry,
  Vector3,
} from 'three'
import type { Object3D, ShaderMaterial } from 'three'
import { Constellation } from './body'
import type { BodyFrame } from './body'
import type { Anchor, Extra } from './bodySpecs'
import { makeBodyMaterial, makeWireMaterial } from './hologram'
import { Tube } from './tube'

export type AnchorFn = (name: Anchor, out: Vector3) => Vector3

export interface ExtraPart {
  object: Object3D
  update(frame: BodyFrame, anchor: AnchorFn, scale: number): void
  dispose(): void
}

/** 몸과 그물 선 한 쌍 (같은 모양) */
export function hologramPair(
  geometry: BufferGeometry,
  body: ShaderMaterial,
  wire: ShaderMaterial,
): Group {
  const group = new Group()
  const fill = new Mesh(geometry, body)
  const lines = new Mesh(geometry, wire)
  fill.renderOrder = 7
  lines.renderOrder = 8
  fill.frustumCulled = false
  lines.frustumCulled = false
  group.add(fill, lines)
  return group
}

/** 몸 재질과 그물 재질을 함께 맞춤 */
export function setMaterials(
  body: ShaderMaterial,
  wire: ShaderMaterial,
  frame: BodyFrame,
  wireShare = 0.16,
) {
  body.uniforms.uOpacity.value = frame.opacity * 0.95
  wire.uniforms.uOpacity.value = frame.opacity * wireShare
  body.uniforms.uTime.value = frame.time
  wire.uniforms.uTime.value = frame.time
}

/* ── 날개 ─────────────────────────────────────────────── */

function triangles(points: number[][], faces: number[][]) {
  const geometry = new BufferGeometry()
  const position: number[] = []
  for (const face of faces) for (const i of face) position.push(...points[i])
  geometry.setAttribute('position', new Float32BufferAttribute(position, 3))
  return geometry
}

/** 오른쪽(+X) 깃털 날개: 앞 가장자리에서 뒤로 뻗은 깃 아홉 */
function featherWing(): { geometry: BufferGeometry; joints: number[][] } {
  const edge = (u: number) => [
    u,
    0.1 * Math.sin(Math.min(u, 1) * Math.PI * 0.8),
    0.04 - 0.08 * u,
  ]
  const points: number[][] = [[0, 0, 0]]
  const faces: number[][] = []
  const joints: number[][] = [[0, 0, 0]]
  const count = 9
  for (let k = 0; k < count; k++) {
    const u0 = k / count
    const u1 = (k + 1) / count
    const a = points.push(edge(u0)) - 1
    const b = points.push(edge(u1)) - 1
    // 끝 깃일수록 길고 바깥으로 눕힘
    const angle = (k / (count - 1)) * 1.15
    const length = 0.28 + 0.42 * (k / (count - 1)) ** 1.3
    const mid = (u0 + u1) / 2
    const tip = [
      mid + Math.sin(angle) * length,
      edge(mid)[1] - 0.03,
      edge(mid)[2] - Math.cos(angle) * length,
    ]
    const c = points.push(tip) - 1
    faces.push([a, c, b], [0, a, b])
    joints.push(tip)
  }
  joints.push(edge(1))
  return { geometry: triangles(points, faces), joints }
}

/** 오른쪽(+X) 막 날개 (용·박쥐): 팔과 손가락 뼈 사이에 막, 뒷가장자리는 오목하게 */
function membraneWing(): { geometry: BufferGeometry; joints: number[][] } {
  const shoulder = [0, 0, 0]
  const elbow = [0.3, 0.14, 0.02]
  const wrist = [0.55, 0.2, -0.02]
  const tips = [
    [0.98, 0.24, -0.16],
    [0.92, 0.02, -0.42],
    [0.72, -0.12, -0.62],
    [0.42, -0.1, -0.72],
  ]
  const body = [0.02, -0.04, -0.55]
  const points = [shoulder, elbow, wrist, ...tips, body]
  const faces: number[][] = [
    [0, 1, 2],
    [0, 2, 6],
    [0, 6, 7],
  ]
  for (let i = 0; i < tips.length; i++) {
    const a = tips[i]
    const b = i + 1 < tips.length ? tips[i + 1] : body
    // 손가락 사이 막을 손목 쪽으로 오목하게
    const m = [0, 1, 2].map(
      (c) => (a[c] + b[c]) / 2 + (wrist[c] - (a[c] + b[c]) / 2) * 0.28,
    )
    const mi = points.push(m) - 1
    faces.push([2, 3 + i, mi], [2, mi, i + 1 < tips.length ? 4 + i : 7])
  }
  return {
    geometry: triangles(points, faces),
    joints: [shoulder, elbow, wrist, ...tips],
  }
}

const wingShapes: Partial<
  Record<'feather' | 'membrane', { geometry: BufferGeometry; joints: number[][] }>
> = {}

function wingShape(style: 'feather' | 'membrane') {
  return (wingShapes[style] ??=
    style === 'feather' ? featherWing() : membraneWing())
}

/**
 * 날개 한 쌍: 왼쪽은 오른쪽을 거울에 비춤. flap(t)로 퍼덕임.
 * spread: 날개를 위아래로 벌린 기본 각도(라디안), tilt: 쌍 전체 기울기
 */
export class WingPair {
  readonly object = new Group()
  private readonly right = new Group()
  private readonly left = new Group()
  private readonly stars: Constellation
  private readonly joints: number[][]

  constructor(
    style: 'feather' | 'membrane',
    body: ShaderMaterial,
    wire: ShaderMaterial,
    color: string,
    private readonly span = 0.85,
    private readonly spread = 0.25,
    private readonly phase = 0,
    private readonly amplitude = 0.45,
  ) {
    const shape = wingShape(style)
    this.joints = shape.joints
    for (const [side, group] of [
      [1, this.right],
      [-1, this.left],
    ] as const) {
      const wing = hologramPair(shape.geometry, body, wire)
      wing.scale.set(side * span, span, span)
      group.add(wing)
      this.object.add(group)
    }
    // 날개 뼈를 별자리로
    const n = shape.joints.length
    const links: number[] = []
    for (let i = 1; i < n; i++)
      links.push(style === 'membrane' && i > 3 ? 2 : i - 1, i)
    const all = new Uint16Array([...links, ...links.map((i) => i + n)])
    this.stars = new Constellation(color, n * 2, all, 0.035)
    this.stars.lineOpacity = 0.35
    this.object.add(this.stars.lines, this.stars.stars)
  }

  private readonly p = new Vector3()

  update(frame: BodyFrame, scale: number, speed = 1) {
    const t = frame.reducedMotion ? 0 : frame.time * speed
    const beat = Math.sin(t * 2.4 + this.phase)
    const angle = this.spread + beat * this.amplitude
    this.right.rotation.set(0, beat * 0.08, -angle)
    this.left.rotation.set(0, -beat * 0.08, angle)
    this.object.updateMatrix()
    this.right.updateMatrix()
    this.left.updateMatrix()
    const n = this.joints.length
    for (const [k, group, side] of [
      [0, this.right, 1],
      [1, this.left, -1],
    ] as const)
      for (let i = 0; i < n; i++) {
        const j = this.joints[i]
        this.p
          .set(j[0] * side * this.span, j[1] * this.span, j[2] * this.span)
          .applyMatrix4(group.matrix)
        this.stars.set(k * n + i, this.p)
      }
    this.stars.commit(frame, scale)
  }

  dispose() {
    this.stars.dispose()
  }
}

/* ── 덧붙이는 것 하나하나 ─────────────────────────────── */

const halo = new TorusGeometry(0.2, 0.012, 5, 48)
const disc = new CircleGeometry(0.26, 32)
const ring = new TorusGeometry(0.3, 0.01, 4, 48)
const horn = new ConeGeometry(0.03, 0.2, 5)
const snakeHead = new IcosahedronGeometry(1, 0)

const scratch = new Vector3()
const forward = new Vector3(0, 0, 1)

function makeExtra(extra: Extra, color: string): ExtraPart {
  const body = makeBodyMaterial(color)
  const wire = makeWireMaterial(color)
  const object = new Group()
  const base = (frame: BodyFrame) => setMaterials(body, wire, frame)
  const disposeMaterials = () => {
    body.dispose()
    wire.dispose()
  }

  switch (extra.kind) {
    case 'wings': {
      const pair = new WingPair(extra.style, body, wire, color, extra.span ?? 0.85)
      object.add(pair.object)
      return {
        object,
        update(frame, anchor, scale) {
          base(frame)
          // 등에서 조금 뒤·위로
          anchor('back', object.position).add(scratch.set(0, 0.05, -0.06))
          pair.update(frame, scale)
        },
        dispose() {
          pair.dispose()
          disposeMaterials()
        },
      }
    }
    case 'halo': {
      const mesh = hologramPair(halo, body, wire)
      mesh.rotation.x = Math.PI / 2
      object.add(mesh)
      return {
        object,
        update(frame, anchor) {
          base(frame)
          anchor('head', object.position).y += 0.16
          mesh.rotation.z = frame.time * 0.3
        },
        dispose: disposeMaterials,
      }
    }
    case 'disc': {
      const face = hologramPair(disc, body, wire)
      const rim = hologramPair(ring, body, wire)
      object.add(face, rim)
      const rays = new Constellation(color, 24, new Uint16Array(
        Array.from({ length: 12 }, (_, i) => [i * 2, i * 2 + 1]).flat(),
      ), 0.04)
      object.add(rays.lines, rays.stars)
      object.scale.setScalar(extra.size ?? 1)
      return {
        object,
        update(frame, anchor, scale) {
          base(frame)
          anchor('head', object.position).add(scratch.set(0, 0.04, -0.14))
          // 햇살 열두 줄이 천천히 돎
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 + frame.time * 0.15
            const long = i % 2 ? 0.46 : 0.56
            rays.set(i * 2, scratch.set(Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0))
            rays.set(
              i * 2 + 1,
              scratch.set(Math.cos(a) * long, Math.sin(a) * long, 0),
            )
          }
          rays.commit(frame, scale * (extra.size ?? 1))
        },
        dispose() {
          rays.dispose()
          disposeMaterials()
        },
      }
    }
    case 'horns': {
      for (let i = 0; i < extra.count; i++) {
        const mesh = hologramPair(horn, body, wire)
        const side = extra.count === 1 ? 0 : i === 0 ? -1 : 1
        mesh.position.set(side * 0.05, 0.08, 0)
        // 하나면 앞으로 비스듬히, 둘이면 바깥·뒤로
        mesh.rotation.set(extra.count === 1 ? 0.5 : -0.35, 0, -side * 0.4)
        object.add(mesh)
      }
      return {
        object,
        update(frame, anchor) {
          base(frame)
          anchor('head', object.position)
        },
        dispose: disposeMaterials,
      }
    }
    case 'plumes': {
      // 꼬리에서 흩날리는 불꽃 깃 세 줄 (별을 이은 선)
      const per = 14
      const links: number[] = []
      for (let j = 0; j < 3; j++)
        for (let i = 1; i < per; i++) links.push(j * per + i - 1, j * per + i)
      const stars = new Constellation(color, per * 3, new Uint16Array(links), 0.05)
      stars.sparkle = 0.5
      stars.lineOpacity = 0.7
      for (let j = 0; j < 3; j++)
        for (let i = 0; i < per; i++) {
          // 끝으로 갈수록 밝은 불빛
          const k = i / (per - 1)
          stars.tint(j * per + i, 1 + k * 0.6, 1 + k * 0.3, 1 - k * 0.2)
        }
      object.add(stars.lines, stars.stars)
      const root = new Vector3()
      return {
        object,
        update(frame, anchor, scale) {
          anchor('tail', root)
          const t = frame.reducedMotion ? 0 : frame.time
          for (let j = 0; j < 3; j++)
            for (let i = 0; i < per; i++) {
              const s = i / (per - 1)
              scratch.set(
                (j - 1) * 0.12 * s + Math.sin(s * 5 - t * 3 + j * 2) * 0.05 * s,
                -0.06 * s + Math.cos(s * 4 - t * 2.5 + j) * 0.04 * s,
                -0.7 * s,
              )
              stars.set(j * per + i, scratch.add(root))
            }
          stars.commit(frame, scale)
        },
        dispose() {
          stars.dispose()
          disposeMaterials()
        },
      }
    }
    case 'tail': {
      const count = extra.count ?? 1
      const coil = extra.coil ?? false
      const tubes = Array.from({ length: count }, () => {
        const tube = new Tube(coil ? 48 : 26, 6, (s) =>
          coil ? 0.075 * (1 - s) ** 0.5 + 0.008 : 0.11 * (1 - s) ** 0.7 + 0.006,
        )
        object.add(hologramPair(tube.geometry, body, wire))
        return tube
      })
      // 감은 뱀은 머리를 붙임
      const head = coil ? hologramPair(snakeHead, body, wire) : undefined
      if (head) {
        head.scale.set(0.07, 0.05, 0.11)
        object.add(head)
      }
      const root = new Vector3()
      const dir = new Vector3()
      const q = new Quaternion()
      return {
        object,
        update(frame, anchor) {
          base(frame)
          const t = frame.reducedMotion ? 0 : frame.time
          anchor(extra.at, root)
          tubes.forEach((tube, k) => {
            const side = count === 1 ? 0 : k === 0 ? -1 : 1
            for (let i = 0; i < tube.count; i++) {
              const s = i / (tube.count - 1)
              if (coil) {
                // 몸을 한 바퀴 반 감아 내려감 (머리는 앞 위)
                const a = Math.PI / 2 + s * Math.PI * 3 + Math.sin(t * 0.8) * 0.05
                const r = 0.62 + 0.04 * Math.sin(s * 9 - t * 1.5)
                scratch.set(Math.cos(a) * r, 0.42 - s * 0.7, Math.sin(a) * r)
              } else {
                // 엉덩이(꼬리 뿌리)에서 아래·뒤로 늘어지며 물결침
                scratch.set(
                  root.x + side * (0.08 + s * 0.25) + Math.sin(s * 7 - t * 2 + k) * 0.06 * s,
                  root.y - s * 0.95,
                  root.z - s * 0.5 + Math.sin(s * 5 - t * 1.6 + k * 2) * 0.14 * s,
                )
              }
              scratch.toArray(tube.spine, i * 3)
            }
            tube.update()
          })
          if (head) {
            const tube = tubes[0]
            tube.point(0, head.position)
            tube.heading(dir)
            head.quaternion.copy(q.setFromUnitVectors(forward, dir))
            head.position.addScaledVector(dir, 0.06)
          }
        },
        dispose() {
          for (const tube of tubes) tube.dispose()
          disposeMaterials()
        },
      }
    }
  }
}

export function createExtras(extras: Extra[] | undefined, color: string) {
  return (extras ?? []).map((extra) => makeExtra(extra, color))
}
