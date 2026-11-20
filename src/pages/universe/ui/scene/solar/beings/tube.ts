/**
 * 등뼈(점 n개)를 따라 굵기가 변하는 관: 뱀·용의 몸, 촉수, 뱀 꼬리.
 * 매 프레임 등뼈를 바꾸고 update()를 부르면 정점을 다시 짓습니다(평행 이동 틀).
 * 면 법선은 그릴 때 화면에서 구하므로(hologram.ts) 위치만 바꿉니다.
 */
import { BufferAttribute, BufferGeometry, Vector3 } from 'three'

const t = new Vector3()
const n = new Vector3()
const b = new Vector3()
const prev = new Vector3()
const up = new Vector3()

export class Tube {
  readonly geometry = new BufferGeometry()
  /** 등뼈 점 (x, y, z) × count: 0이 머리 쪽 */
  readonly spine: Float32Array
  /** 점마다 굵기 (반지름) */
  readonly radius: Float32Array
  private readonly positions: Float32Array

  constructor(
    readonly count: number,
    readonly sides: number,
    radius: (s: number) => number,
  ) {
    this.spine = new Float32Array(count * 3)
    this.radius = new Float32Array(count)
    for (let i = 0; i < count; i++) this.radius[i] = radius(i / (count - 1))
    this.positions = new Float32Array(count * sides * 3)
    this.geometry.setAttribute(
      'position',
      new BufferAttribute(this.positions, 3),
    )
    const index: number[] = []
    for (let i = 0; i < count - 1; i++)
      for (let j = 0; j < sides; j++) {
        const a = i * sides + j
        const c = i * sides + ((j + 1) % sides)
        index.push(a, a + sides, c, c, a + sides, c + sides)
      }
    this.geometry.setIndex(index)
  }

  /** i번째 등뼈 점 */
  point(i: number, out: Vector3) {
    return out.fromArray(this.spine, i * 3)
  }

  /** 등뼈를 따라 관의 정점을 다시 지음 */
  update() {
    const { count, sides, spine, positions } = this
    up.set(0, 1, 0)
    for (let i = 0; i < count; i++) {
      // 접선: 앞뒤 점의 차이
      const i0 = Math.max(0, i - 1)
      const i1 = Math.min(count - 1, i + 1)
      t.set(
        spine[i1 * 3] - spine[i0 * 3],
        spine[i1 * 3 + 1] - spine[i0 * 3 + 1],
        spine[i1 * 3 + 2] - spine[i0 * 3 + 2],
      ).normalize()
      if (i === 0) {
        // 처음 법선: 접선과 가장 덜 나란한 축
        n.crossVectors(t, Math.abs(t.y) > 0.9 ? up.set(1, 0, 0) : up)
        n.cross(t).normalize()
      } else {
        // 앞 법선을 새 접선에 수직이 되게 (평행 이동): 관이 꼬이지 않음
        n.copy(prev).addScaledVector(t, -prev.dot(t))
        if (n.lengthSq() < 1e-8) n.crossVectors(t, up).normalize()
        else n.normalize()
      }
      prev.copy(n)
      b.crossVectors(t, n)
      const r = this.radius[i]
      const x = spine[i * 3]
      const y = spine[i * 3 + 1]
      const z = spine[i * 3 + 2]
      for (let j = 0; j < sides; j++) {
        const a = (j / sides) * Math.PI * 2
        const c = Math.cos(a) * r
        const s = Math.sin(a) * r
        const k = (i * sides + j) * 3
        positions[k] = x + n.x * c + b.x * s
        positions[k + 1] = y + n.y * c + b.y * s
        positions[k + 2] = z + n.z * c + b.z * s
      }
    }
    this.geometry.attributes.position.needsUpdate = true
  }

  /** 머리 쪽 방향 (0번 점에서 앞으로) */
  heading(out: Vector3) {
    const s = this.spine
    return out.set(s[0] - s[3], s[1] - s[4], s[2] - s[5]).normalize()
  }

  dispose() {
    this.geometry.dispose()
  }
}
