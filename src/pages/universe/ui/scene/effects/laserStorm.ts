/**
 * 공간을 가로지르는 레이저 (우주 대전의 장거리 포격, 은하 사이를 질러가는 레이저).
 * 얇은 원통을 인스턴스로 그려, 짧은 토막이 날아가거나(볼트) 줄기가 그어졌다 사라집니다(빔).
 * 덧셈 섞기라 색을 어둡게 하면 흐려지므로 인스턴스 색으로 나타났다 사라지게 합니다.
 */
import {
  AdditiveBlending,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
} from 'three'

export interface Shot {
  from: Vector3
  to: Vector3
  color: string
  /** 날아가는 토막의 길이 비율 (1이면 처음부터 끝까지 그어지는 줄기) */
  tail?: number
}

/** 붉은 레이저 (열에 여섯) */
const REDS = ['#ff2e2e', '#ff4d3a', '#ff1f5a']
/** 그 밖의 레이저 색 */
export const LASER_COLORS = [
  '#4fc3ff',
  '#7dff8a',
  '#d6a8ff',
  '#ffd27a',
  '#ff6ec7',
  '#9fd3ff',
]

export const laserColor = (random: () => number = Math.random) =>
  random() < 0.6
    ? REDS[Math.floor(random() * REDS.length)]
    : LASER_COLORS[Math.floor(random() * LASER_COLORS.length)]

interface Streak {
  shot: Shot | null
  start: number
  life: number
}

export interface LaserStorm {
  mesh: InstancedMesh
  /** spawn이 null을 돌려주면 그 자리는 쉼 */
  update(
    now: number,
    active: boolean,
    width: number,
    spawn: () => Shot | null,
  ): void
  dispose(): void
}

const up = new Vector3(0, 1, 0)
const m4 = new Matrix4()
const q4 = new Quaternion()
const s3 = new Vector3()
const head = new Vector3()
const tailPos = new Vector3()
const dir = new Vector3()
const tint = new Color()
const hidden = new Matrix4().makeScale(0, 0, 0)

export function createLaserStorm(count: number): LaserStorm {
  const geometry = new CylinderGeometry(1, 1, 1, 6, 1, true)
  const material = new MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const mesh = new InstancedMesh(geometry, material, count)
  mesh.frustumCulled = false
  const black = new Color(0, 0, 0)
  for (let i = 0; i < count; i++) {
    mesh.setMatrixAt(i, hidden)
    mesh.setColorAt(i, black)
  }
  const streaks: Streak[] = Array.from({ length: count }, () => ({
    shot: null,
    start: 0,
    life: 0,
  }))

  return {
    mesh,
    update(now, active, width, spawn) {
      streaks.forEach((s, i) => {
        if (active && (!s.shot || now - s.start > s.life)) {
          s.shot = spawn()
          s.start = now + Math.random() * 0.9
          s.life = 0.8 + Math.random() * 1.2
        }
        const k = (now - s.start) / Math.max(s.life, 1e-3)
        if (!s.shot || k < 0 || k > 1) {
          mesh.setMatrixAt(i, hidden)
          mesh.setColorAt(i, black)
          return
        }
        const { from, to } = s.shot
        const tail = s.shot.tail ?? 0.22
        // 머리가 끝까지 가는 동안 꼬리가 따라옴 (줄기는 꼬리가 출발점에 머묾)
        const reach = Math.min(1, k * (1 + tail) * 1.6)
        const back = tail >= 1 ? 0 : Math.max(0, reach - tail)
        head.lerpVectors(from, to, reach)
        tailPos.lerpVectors(from, to, back)
        dir.subVectors(head, tailPos)
        const length = dir.length()
        if (length < 1e-6) {
          mesh.setMatrixAt(i, hidden)
          return
        }
        q4.setFromUnitVectors(up, dir.multiplyScalar(1 / length))
        s3.set(width, length, width)
        m4.compose(head.clone().add(tailPos).multiplyScalar(0.5), q4, s3)
        mesh.setMatrixAt(i, m4)
        const fade = Math.sin(Math.min(1, k) * Math.PI)
        tint.set(s.shot.color).multiplyScalar(1.4 * fade)
        mesh.setColorAt(i, tint)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    },
    dispose() {
      geometry.dispose()
      material.dispose()
      mesh.removeFromParent()
    },
  }
}

/** 지금 벌어지는 우주 대전 세력들의 레이저 색 (없으면 빈 목록) */
export function warPalette(
  wars: ReadonlyArray<{ status: string; a: string; b: string }>,
  lasersOf: (faction: string) => string[],
): string[] {
  return wars
    .filter((w) => w.status === 'raging')
    .flatMap((w) => [...lasersOf(w.a), ...lasersOf(w.b)])
}
