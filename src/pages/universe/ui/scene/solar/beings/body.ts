/**
 * 우주적 존재의 3D 몸이 따르는 약속과, 몸 위에 별자리(별과 선)를 그리는 공통 도구
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  Points,
  ShaderMaterial,
} from 'three'
import type { Camera, Object3D, Vector3 } from 'three'

export interface BodyFrame {
  /** 지난 프레임부터 흐른 시간 (초) */
  dt: number
  /** 장면 시간 (초, 움직임 줄이기면 멈춤) */
  time: number
  /** 몸 전체의 불투명도 (0~1) */
  opacity: number
  reducedMotion: boolean
  camera: Camera
  /** 화면 높이에 맞춘 점 크기 배율 */
  pixelScale: number
  pixelRatio: number
}

export interface Body3D {
  /** 반지름 1 안에 든 몸 (앞 +Z, 위 +Y) */
  object: Object3D
  update(frame: BodyFrame): void
  /** 격돌 여파를 터뜨릴 때 (공격 동작) */
  strike(): void
  /** 싸움에 져서 사라질 때 (쓰러지는 동작) */
  fall(): void
  dispose(): void
}

const starVertex = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aTint;
uniform float uPixelScale;
uniform float uPixelRatio;
varying float vAlpha;
varying vec3 vTint;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(aSize * uPixelScale / max(-mv.z, 1e-3), 1.0, 26.0) * uPixelRatio;
  vAlpha = aAlpha;
  vTint = aTint;
  gl_Position = projectionMatrix * mv;
}
`

const starFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
varying vec3 vTint;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float a = exp(-d * 3.5);
  gl_FragColor = vec4(uColor * vTint * (1.1 + 0.6 * a), a * vAlpha * uOpacity);
}
`

/**
 * 몸 위의 별자리: 별 count개와 별 둘을 잇는 선(links: 별 번호 쌍).
 * 별 자리는 매 프레임 set()으로 바꿈
 */
export class Constellation {
  readonly lines: LineSegments
  readonly stars: Points
  private readonly positions: Float32Array
  private readonly linePositions: Float32Array
  private readonly alpha: BufferAttribute
  private readonly tints: BufferAttribute
  private readonly twinkle: Float32Array
  /** 별 반짝임 세기 (0이면 고르게) */
  sparkle = 0.35
  /** 선 밝기 */
  lineOpacity = 0.55

  constructor(
    color: string,
    readonly count: number,
    private readonly links: Uint16Array,
    size = 0.05,
  ) {
    this.positions = new Float32Array(count * 3)
    const starGeometry = new BufferGeometry()
    starGeometry.setAttribute(
      'position',
      new BufferAttribute(this.positions, 3),
    )
    const sizes = new Float32Array(count)
    this.twinkle = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // 별마다 다른 크기와 반짝임 (같은 몸이면 같은 무늬)
      const h = Math.sin(i * 12.9898) * 43758.5453
      const r = h - Math.floor(h)
      sizes[i] = size * (0.6 + r * 0.9)
      this.twinkle[i] = r * 6.283
    }
    starGeometry.setAttribute('aSize', new BufferAttribute(sizes, 1))
    this.alpha = new BufferAttribute(new Float32Array(count).fill(1), 1)
    starGeometry.setAttribute('aAlpha', this.alpha)
    this.tints = new BufferAttribute(new Float32Array(count * 3).fill(1), 3)
    starGeometry.setAttribute('aTint', this.tints)
    this.stars = new Points(
      starGeometry,
      new ShaderMaterial({
        vertexShader: starVertex,
        fragmentShader: starFragment,
        uniforms: {
          uColor: { value: new Color(color) },
          uOpacity: { value: 0 },
          uPixelScale: { value: 500 },
          uPixelRatio: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    this.linePositions = new Float32Array(links.length * 3)
    const lineGeometry = new BufferGeometry()
    lineGeometry.setAttribute(
      'position',
      new BufferAttribute(this.linePositions, 3),
    )
    this.lines = new LineSegments(
      lineGeometry,
      new LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    )
    for (const o of [this.lines, this.stars]) {
      o.frustumCulled = false
      o.renderOrder = 8
    }
  }

  /** i번째 별 자리 */
  set(i: number, p: Vector3) {
    this.positions[i * 3] = p.x
    this.positions[i * 3 + 1] = p.y
    this.positions[i * 3 + 2] = p.z
  }

  /** i번째 별의 색 배율 (기본 1, 1, 1) */
  tint(i: number, r: number, g: number, b: number) {
    const a = this.tints.array as Float32Array
    a[i * 3] = r
    a[i * 3 + 1] = g
    a[i * 3 + 2] = b
    this.tints.needsUpdate = true
  }

  /** 별 자리를 버퍼에 옮기고 밝기를 맞춤 */
  commit(frame: BodyFrame, scale: number) {
    const links = this.links
    const pos = this.positions
    const out = this.linePositions
    for (let k = 0; k < links.length; k++) {
      const i = links[k] * 3
      out[k * 3] = pos[i]
      out[k * 3 + 1] = pos[i + 1]
      out[k * 3 + 2] = pos[i + 2]
    }
    this.lines.geometry.attributes.position.needsUpdate = true
    this.stars.geometry.attributes.position.needsUpdate = true
    const alpha = this.alpha.array as Float32Array
    for (let i = 0; i < this.count; i++)
      alpha[i] = frame.reducedMotion
        ? 1 - this.sparkle / 2
        : 1 -
          this.sparkle +
          this.sparkle * Math.sin(frame.time * 2.2 + this.twinkle[i])
    this.alpha.needsUpdate = true
    ;(this.lines.material as LineBasicMaterial).opacity =
      this.lineOpacity * frame.opacity
    const u = (this.stars.material as ShaderMaterial).uniforms
    u.uOpacity.value = frame.opacity
    u.uPixelScale.value = frame.pixelScale * scale
    u.uPixelRatio.value = frame.pixelRatio
  }

  dispose() {
    this.lines.geometry.dispose()
    ;(this.lines.material as LineBasicMaterial).dispose()
    this.stars.geometry.dispose()
    ;(this.stars.material as ShaderMaterial).dispose()
  }
}

/**
 * 점들 가운데 서로 멀리 떨어진 count개를 고름 (가장 먼 점 고르기).
 * 몸 전체에 별이 고르게 퍼지게 함
 */
export function spreadPick(
  points: ArrayLike<number>,
  total: number,
  count: number,
): number[] {
  if (total === 0) return []
  const picked = [0]
  const best = new Float32Array(total).fill(Infinity)
  while (picked.length < Math.min(count, total)) {
    const last = picked[picked.length - 1]
    let far = 0
    let farIndex = 0
    for (let i = 0; i < total; i++) {
      const dx = points[i * 3] - points[last * 3]
      const dy = points[i * 3 + 1] - points[last * 3 + 1]
      const dz = points[i * 3 + 2] - points[last * 3 + 2]
      best[i] = Math.min(best[i], dx * dx + dy * dy + dz * dz)
      if (best[i] > far) {
        far = best[i]
        farIndex = i
      }
    }
    if (far === 0) break
    picked.push(farIndex)
  }
  return picked
}

/** 별들을 가장 짧은 선으로 모두 잇기 (최소 신장 트리): 별자리처럼 보이는 선 */
export function linkNearest(points: ArrayLike<number>, count: number) {
  const links: number[] = []
  if (count < 2) return new Uint16Array(links)
  const inTree = new Uint8Array(count)
  const dist = new Float32Array(count).fill(Infinity)
  const from = new Int32Array(count).fill(-1)
  dist[0] = 0
  for (let step = 0; step < count; step++) {
    let next = -1
    for (let i = 0; i < count; i++)
      if (!inTree[i] && (next < 0 || dist[i] < dist[next])) next = i
    inTree[next] = 1
    if (from[next] >= 0) links.push(from[next], next)
    for (let i = 0; i < count; i++) {
      if (inTree[i]) continue
      const dx = points[i * 3] - points[next * 3]
      const dy = points[i * 3 + 1] - points[next * 3 + 1]
      const dz = points[i * 3 + 2] - points[next * 3 + 2]
      const d = dx * dx + dy * dy + dz * dz
      if (d < dist[i]) {
        dist[i] = d
        from[i] = next
      }
    }
  }
  return new Uint16Array(links)
}
