/**
 * 모델 없이 계산으로 만드는 그 밖의 몸
 * - void: 빛을 삼키는 검은 핵과 그 둘레를 도는 원반 (아자토스·별 없는 허기)
 * - globes: 서로 맞물려 맴도는 빛 구체 무리 (요그소토스)
 * - blob: 들끓는 덩어리와 촉수, 날개를 달 수도 (슈브니구라스·울부짖는 성운·혼돈)
 * - eye: 늘 이쪽을 보는 거대한 눈 (감기지 않는 눈)
 * - wheels: 눈이 가득한 바퀴 속의 바퀴 (오파님)
 * - harvester: 고리와 집광판, 앞의 깔때기로 별을 거두는 기계 (항성 수확기)
 * - winged: 빛 핵을 감싼 날개 여러 쌍 (세라핌·케루빔)
 * - colour: 이름 붙일 수 없는 빛깔로 일렁이는 안개 (우주에서 온 색채)
 */
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  Quaternion,
  RingGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import type { BufferGeometry, Object3D } from 'three'
import { seededRandom } from '@/shared/lib'
import { Constellation, linkNearest, spreadPick } from './body'
import type { Body3D, BodyFrame } from './body'
import { WingPair, hologramPair, setMaterials } from './extras'
import { makeBodyMaterial, makeWireMaterial } from './hologram'
import { Tube } from './tube'

const v = new Vector3()
const w = new Vector3()
const m = new Matrix4()
const qa = new Quaternion()
const one = new Vector3(1, 1, 1)
const scaleOf = (o: Object3D) => o.getWorldScale(w).x

/** 공통 바탕: 재질 한 쌍, 공격 때 덮치기·질 때 가라앉기 */
function frame(color: string) {
  const object = new Group()
  const pose = new Group()
  object.add(pose)
  const body = makeBodyMaterial(color)
  const wire = makeWireMaterial(color)
  let lunge = -1
  let falling = -1
  return {
    object,
    pose,
    body,
    wire,
    step(f: BodyFrame) {
      setMaterials(body, wire, f)
      if (lunge >= 0) {
        lunge += f.dt / 0.7
        pose.position.z = Math.sin(Math.min(lunge, 1) * Math.PI) * 0.2
        if (lunge >= 1) lunge = -1
      }
      if (falling >= 0) {
        falling += f.dt
        pose.rotation.z = Math.min(falling * 0.5, 1.1)
        pose.position.y = -falling * 0.12
      }
    },
    strike() {
      lunge = 0
    },
    fall() {
      if (falling < 0) falling = 0
    },
    dispose() {
      body.dispose()
      wire.dispose()
    },
  }
}

/** 둘레를 도는 입자 원반 (안쪽일수록 빠르고 밝음) */
function orbitDisk(
  color: string,
  count: number,
  inner: number,
  outer: number,
  seed: number,
) {
  const random = seededRandom(seed)
  const seeds = Array.from({ length: count }, () => ({
    angle: random() * Math.PI * 2,
    r: inner + (outer - inner) * random() ** 1.6,
    y: (random() - 0.5) * 0.06,
  }))
  const stars = new Constellation(color, count, new Uint16Array(0), 0.022)
  stars.sparkle = 0.5
  seeds.forEach((s, i) => {
    const hot = 1 - (s.r - inner) / (outer - inner)
    stars.tint(i, 1 + hot * 0.8, 1 + hot * 0.7, 1 + hot * 0.5)
  })
  return {
    stars,
    update(f: BodyFrame, tilt: Matrix4, scale: number) {
      const t = f.reducedMotion ? 0 : f.time
      seeds.forEach((s, i) => {
        const a = s.angle + t * 0.9 * (inner / s.r) ** 1.5
        stars.set(
          i,
          v.set(Math.cos(a) * s.r, s.y, Math.sin(a) * s.r).applyMatrix4(tilt),
        )
      })
      stars.commit(f, scale)
    },
  }
}

/* ── 공허 ──────────────────────────────────────────────── */

export function createVoidBody(color: string, seed: number): Body3D {
  const base = frame(color)
  const core = new Mesh(
    new SphereGeometry(0.42, 32, 16),
    new MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  )
  core.renderOrder = 6
  const horizon = hologramPair(
    new SphereGeometry(0.47, 32, 16),
    base.body,
    base.wire,
  )
  ;(horizon.children[1] as Mesh).visible = false
  const disk = orbitDisk(color, 700, 0.55, 1, seed)
  base.pose.add(core, horizon, disk.stars.lines, disk.stars.stars)
  const tilt = new Matrix4().makeRotationX(0.35)
  return {
    object: base.object,
    update(f) {
      base.step(f)
      ;(core.material as MeshBasicMaterial).opacity = 0.94 * f.opacity
      disk.update(f, tilt, scaleOf(base.pose))
    },
    strike: base.strike,
    fall: base.fall,
    dispose() {
      core.geometry.dispose()
      ;(core.material as MeshBasicMaterial).dispose()
      horizon.children.forEach((c) => (c as Mesh).geometry.dispose())
      disk.stars.dispose()
      base.dispose()
    },
  }
}

/* ── 구체 무리 ─────────────────────────────────────────── */

export function createGlobesBody(color: string, seed: number): Body3D {
  const base = frame(color)
  const random = seededRandom(seed)
  const count = 18
  const globes = Array.from({ length: count }, () => ({
    dir: new Vector3(
      random() - 0.5,
      random() - 0.5,
      random() - 0.5,
    ).normalize(),
    r: 0.15 + random() * 0.5,
    size: 0.12 + random() * 0.17,
    phase: random() * 6.28,
  }))
  const geometry = new IcosahedronGeometry(1, 2)
  const fill = new InstancedMesh(geometry, base.body, count)
  const lines = new InstancedMesh(geometry, base.wire, count)
  lines.instanceMatrix = fill.instanceMatrix
  for (const o of [fill, lines]) o.frustumCulled = false
  fill.renderOrder = 7
  lines.renderOrder = 8
  const centers = new Float32Array(count * 3)
  globes.forEach((g, i) =>
    v
      .copy(g.dir)
      .multiplyScalar(g.r)
      .toArray(centers, i * 3),
  )
  const stars = new Constellation(
    color,
    count,
    linkNearest(centers, count),
    0.06,
  )
  stars.lineOpacity = 0.3
  base.pose.add(fill, lines, stars.lines, stars.stars)
  return {
    object: base.object,
    update(f) {
      base.step(f)
      const t = f.reducedMotion ? 0 : f.time
      globes.forEach((g, i) => {
        // 저마다 다른 축으로 천천히 맴돌며 부풀었다 줄어듦
        v.copy(g.dir)
          .multiplyScalar(g.r)
          .applyAxisAngle(
            w.set(0.3, 1, 0.2).normalize(),
            t * 0.15 + g.phase * 0.1,
          )
        const size = g.size * (1 + 0.12 * Math.sin(t * 1.3 + g.phase))
        m.compose(v, qa.identity(), w.set(size, size, size))
        fill.setMatrixAt(i, m)
        stars.set(i, v)
      })
      fill.instanceMatrix.needsUpdate = true
      stars.commit(f, scaleOf(base.pose))
    },
    strike: base.strike,
    fall: base.fall,
    dispose() {
      geometry.dispose()
      fill.dispose()
      stars.dispose()
      base.dispose()
    },
  }
}

/* ── 들끓는 덩어리 ─────────────────────────────────────── */

/** 덩어리 표면을 들끓게 하는 값 (-1~1 언저리) */
function boil(x: number, y: number, z: number, t: number) {
  return (
    Math.sin(x * 3.1 + t * 0.7) *
      Math.sin(y * 2.7 - t * 0.5) *
      Math.sin(z * 3.4 + t * 0.6) +
    0.5 * Math.sin(x * 5.3 - t * 0.9 + z * 2.1) * Math.cos(y * 4.7 + t * 0.4)
  )
}

function boilingSphere(radius: number) {
  const geometry = new IcosahedronGeometry(radius, 3)
  const position = geometry.attributes.position
  const rest = Float32Array.from(position.array as Float32Array)
  return {
    geometry,
    rest,
    update(t: number, strength: number) {
      const a = position.array as Float32Array
      for (let i = 0; i < position.count; i++) {
        const x = rest[i * 3]
        const y = rest[i * 3 + 1]
        const z = rest[i * 3 + 2]
        const k = 1 + strength * boil(x / radius, y / radius, z / radius, t)
        a[i * 3] = x * k
        a[i * 3 + 1] = y * k
        a[i * 3 + 2] = z * k
      }
      position.needsUpdate = true
    },
  }
}

export function createBlobBody(
  color: string,
  seed: number,
  tentacleCount: number,
  winged: boolean,
): Body3D {
  const base = frame(color)
  const random = seededRandom(seed)
  const blob = boilingSphere(0.5)
  base.pose.add(hologramPair(blob.geometry, base.body, base.wire))
  // 촉수: 아래·바깥으로 퍼진 뿌리에서 물결치며 뻗음
  const tentacles = Array.from({ length: tentacleCount }, (_, k) => {
    const a = (k / Math.max(1, tentacleCount)) * Math.PI * 2 + random() * 0.4
    const dir = new Vector3(
      Math.cos(a),
      -0.4 - random() * 0.6,
      Math.sin(a),
    ).normalize()
    const tube = new Tube(20, 5, (s) => 0.055 * (1 - s) + 0.006)
    base.pose.add(hologramPair(tube.geometry, base.body, base.wire))
    return { dir, tube, phase: random() * 6.28, length: 0.6 + random() * 0.35 }
  })
  const wings = winged
    ? [0, 1].map((k) => {
        const pair = new WingPair(
          'feather',
          base.body,
          base.wire,
          color,
          0.7,
          k ? 0.5 : -0.2,
          k * 1.4,
        )
        pair.object.position.set(0, 0.25, k ? -0.18 : 0.12)
        base.pose.add(pair.object)
        return pair
      })
    : []
  // 표면의 눈·입 같은 별
  const picked = spreadPick(blob.rest, blob.rest.length / 3, 26)
  const tips = tentacles.length
  const stars = new Constellation(
    color,
    picked.length + tips,
    new Uint16Array(0),
    0.06,
  )
  stars.sparkle = 0.6
  base.pose.add(stars.lines, stars.stars)
  const position = blob.geometry.attributes.position
  const side = new Vector3()
  return {
    object: base.object,
    update(f) {
      base.step(f)
      const t = f.reducedMotion ? 0 : f.time
      blob.update(t, 0.16)
      picked.forEach((i, k) => stars.set(k, v.fromBufferAttribute(position, i)))
      tentacles.forEach((ten, k) => {
        side.crossVectors(ten.dir, w.set(0, 1, 0)).normalize()
        for (let i = 0; i < ten.tube.count; i++) {
          const s = i / (ten.tube.count - 1)
          v.copy(ten.dir)
            .multiplyScalar(0.42 + s * ten.length)
            .addScaledVector(
              side,
              Math.sin(s * 6 - t * 2 + ten.phase) * 0.12 * s,
            )
          v.y += Math.cos(s * 4 - t * 1.4 + ten.phase) * 0.08 * s
          v.toArray(ten.tube.spine, i * 3)
        }
        ten.tube.update()
        stars.set(picked.length + k, ten.tube.point(ten.tube.count - 1, v))
      })
      const scale = scaleOf(base.pose)
      stars.commit(f, scale)
      for (const pair of wings) pair.update(f, scale, 0.7)
    },
    strike: base.strike,
    fall: base.fall,
    dispose() {
      blob.geometry.dispose()
      for (const ten of tentacles) ten.tube.dispose()
      for (const pair of wings) pair.dispose()
      stars.dispose()
      base.dispose()
    },
  }
}

/* ── 눈 ────────────────────────────────────────────────── */

export function createEyeBody(color: string, seed: number): Body3D {
  const base = frame(color)
  const eye = new Group()
  const ball = new SphereGeometry(0.6, 28, 18)
  const iris = new RingGeometry(0.15, 0.33, 40, 2)
  const lid = new TorusGeometry(0.66, 0.014, 4, 40, Math.PI * 0.85)
  eye.add(hologramPair(ball, base.body, base.wire))
  const irisMesh = hologramPair(iris, base.body, base.wire)
  irisMesh.position.z = 0.52
  const pupil = new Mesh(
    new CircleGeometry(0.15, 32),
    new MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  )
  pupil.position.z = 0.53
  pupil.renderOrder = 9
  eye.add(irisMesh, pupil)
  for (const k of [1, -1]) {
    const arc = hologramPair(lid, base.body, base.wire)
    arc.rotation.z = k > 0 ? Math.PI * 0.075 : Math.PI * 1.075
    arc.position.z = 0.12
    arc.scale.set(1, 0.62, 1)
    eye.add(arc)
  }
  // 핏줄: 홍채 가장자리에서 눈알 뒤로 뻗는 별줄
  const veins = 8
  const per = 5
  const links: number[] = []
  for (let k = 0; k < veins; k++)
    for (let i = 1; i < per; i++) links.push(k * per + i - 1, k * per + i)
  const veinStars = new Constellation(
    color,
    veins * per,
    new Uint16Array(links),
    0.035,
  )
  veinStars.lineOpacity = 0.45
  for (let k = 0; k < veins; k++)
    for (let i = 0; i < per; i++) {
      const a = (k / veins) * Math.PI * 2
      const back = 0.35 + i * 0.28
      v.set(
        Math.cos(a) * Math.sin(back),
        Math.sin(a) * Math.sin(back),
        Math.cos(back),
      ).multiplyScalar(0.61)
      veinStars.set(k * per + i, v)
    }
  eye.add(veinStars.lines, veinStars.stars)
  const disk = orbitDisk(color, 260, 0.75, 1, seed)
  base.pose.add(eye, disk.stars.lines, disk.stars.stars)
  const tilt = new Matrix4().makeRotationX(1.2)
  const camera = new Vector3()
  const inverse = new Matrix4()
  return {
    object: base.object,
    update(f) {
      base.step(f)
      const t = f.reducedMotion ? 0 : f.time
      // 늘 보는 이(카메라)를 바라봄
      base.pose.updateMatrixWorld(true)
      inverse.copy(base.pose.matrixWorld).invert()
      camera.setFromMatrixPosition(f.camera.matrixWorld).applyMatrix4(inverse)
      eye.lookAt(camera)
      pupil.scale.setScalar(1 + 0.25 * Math.sin(t * 0.7))
      ;(pupil.material as MeshBasicMaterial).opacity = 0.92 * f.opacity
      const scale = scaleOf(base.pose)
      veinStars.commit(f, scale)
      disk.update(f, tilt, scale)
    },
    strike: base.strike,
    fall: base.fall,
    dispose() {
      for (const g of [ball, iris, lid, pupil.geometry]) g.dispose()
      ;(pupil.material as MeshBasicMaterial).dispose()
      veinStars.dispose()
      disk.stars.dispose()
      base.dispose()
    },
  }
}

/* ── 바퀴 속의 바퀴 ────────────────────────────────────── */

export function createWheelsBody(color: string): Body3D {
  const base = frame(color)
  const torus = new TorusGeometry(0.8, 0.04, 6, 72)
  const inner = new TorusGeometry(0.55, 0.035, 6, 60)
  const wheels = [torus, torus, inner].map((g) => {
    const mesh = hologramPair(g, base.body, base.wire)
    base.pose.add(mesh)
    return mesh
  })
  const core = hologramPair(
    new IcosahedronGeometry(0.12, 1),
    base.body,
    base.wire,
  )
  base.pose.add(core)
  const perWheel = 16
  const stars = new Constellation(
    color,
    perWheel * 3 + 1,
    new Uint16Array(0),
    0.07,
  )
  stars.sparkle = 0.7
  base.pose.add(stars.lines, stars.stars)
  return {
    object: base.object,
    update(f) {
      base.step(f)
      const t = f.reducedMotion ? 0 : f.time
      // 서로 다른 축으로 도는 바퀴 (자이로스코프처럼)
      wheels[0].rotation.set(t * 0.4, 0, 0)
      wheels[1].rotation.set(0, t * 0.33, Math.PI / 2)
      wheels[2].rotation.set(Math.PI / 2 + t * 0.25, t * 0.2, 0)
      wheels.forEach((wheel, k) => {
        wheel.updateMatrix()
        const r = k === 2 ? 0.55 : 0.8
        for (let i = 0; i < perWheel; i++) {
          // 테두리에 가득한 눈
          const a = (i / perWheel) * Math.PI * 2
          stars.set(
            k * perWheel + i,
            v
              .set(Math.cos(a) * r, Math.sin(a) * r, 0)
              .applyMatrix4(wheel.matrix),
          )
        }
      })
      stars.set(perWheel * 3, v.set(0, 0, 0))
      core.rotation.y = t * 0.6
      stars.commit(f, scaleOf(base.pose))
    },
    strike: base.strike,
    fall: base.fall,
    dispose() {
      torus.dispose()
      inner.dispose()
      ;(core.children[0] as Mesh).geometry.dispose()
      stars.dispose()
      base.dispose()
    },
  }
}

/* ── 항성 수확기 ───────────────────────────────────────── */

export function createHarvesterBody(color: string): Body3D {
  const base = frame(color)
  const geometries: BufferGeometry[] = [
    new OctahedronGeometry(0.24, 0),
    new TorusGeometry(0.7, 0.035, 6, 64),
    new TorusGeometry(0.95, 0.025, 6, 80),
    new ConeGeometry(0.34, 0.5, 14, 1, true),
    new CylinderGeometry(0.012, 0.012, 1, 5),
    new BoxGeometry(0.17, 0.012, 0.11),
  ]
  const [coreG, ringAG, ringBG, funnelG, armG, panelG] = geometries
  const core = hologramPair(coreG, base.body, base.wire)
  const ringA = hologramPair(ringAG, base.body, base.wire)
  const ringB = new Group()
  ringB.add(hologramPair(ringBG, base.body, base.wire))
  // 앞(+Z)으로 벌어진 깔때기로 별의 물질을 빨아들임
  const funnel = hologramPair(funnelG, base.body, base.wire)
  funnel.rotation.x = -Math.PI / 2
  funnel.position.z = 0.62
  base.pose.add(core, ringA, ringB, funnel)
  // 깔때기 가장자리와 핵을 잇는 팔 셋
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2
    const arm = hologramPair(armG, base.body, base.wire)
    const from = new Vector3(0, 0, 0)
    const to = new Vector3(Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0.87)
    arm.position.copy(from).add(to).multiplyScalar(0.5)
    arm.quaternion.setFromUnitVectors(
      new Vector3(0, 1, 0),
      to.clone().sub(from).normalize(),
    )
    arm.scale.set(1, from.distanceTo(to), 1)
    base.pose.add(arm)
  }
  const panels = 20
  const fill = new InstancedMesh(panelG, base.body, panels)
  const lines = new InstancedMesh(panelG, base.wire, panels)
  lines.instanceMatrix = fill.instanceMatrix
  for (const o of [fill, lines]) o.frustumCulled = false
  fill.renderOrder = 7
  lines.renderOrder = 8
  ringB.add(fill, lines)
  for (let i = 0; i < panels; i++) {
    const a = (i / panels) * Math.PI * 2
    v.set(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0)
    qa.setFromAxisAngle(w.set(0, 0, 1), a)
    fill.setMatrixAt(i, m.compose(v, qa, one))
  }
  fill.instanceMatrix.needsUpdate = true
  const stars = new Constellation(color, panels + 13, new Uint16Array(0), 0.05)
  base.pose.add(stars.lines, stars.stars)
  return {
    object: base.object,
    update(f) {
      base.step(f)
      const t = f.reducedMotion ? 0 : f.time
      core.rotation.set(t * 0.5, t * 0.7, 0)
      ringA.rotation.set(Math.PI / 2, 0, t * 0.35)
      ringB.rotation.set(0.45, 0, -t * 0.22)
      ringB.updateMatrix()
      for (let i = 0; i < panels; i++) {
        const a = (i / panels) * Math.PI * 2
        stars.set(
          i,
          v
            .set(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0)
            .applyMatrix4(ringB.matrix),
        )
      }
      for (let i = 0; i < 12; i++) {
        // 깔때기 입구에서 빨려 드는 빛
        const a = (i / 12) * Math.PI * 2 + t * 1.2
        const k = (t * 0.6 + i / 12) % 1
        stars.set(
          panels + i,
          v.set(
            Math.cos(a) * 0.34 * (1 - k),
            Math.sin(a) * 0.34 * (1 - k),
            0.87 - k * 0.6,
          ),
        )
      }
      stars.set(panels + 12, v.set(0, 0, 0))
      stars.commit(f, scaleOf(base.pose))
    },
    strike: base.strike,
    fall: base.fall,
    dispose() {
      for (const g of geometries) g.dispose()
      fill.dispose()
      stars.dispose()
      base.dispose()
    },
  }
}

/* ── 날개 여러 쌍 (천사) ───────────────────────────────── */

export function createWingedBody(
  color: string,
  pairs: number,
  faces: number,
): Body3D {
  const base = frame(color)
  const coreG = new IcosahedronGeometry(0.2, 1)
  const faceG = new IcosahedronGeometry(0.075, 1)
  const haloG = new TorusGeometry(0.24, 0.012, 5, 48)
  base.pose.add(hologramPair(coreG, base.body, base.wire))
  // 위 쌍은 얼굴을, 아래 쌍은 발을 가리고, 가운데 쌍으로 남 (이사야 6장의 세라핌)
  const layout = [
    { spread: -0.95, y: 0.12, tilt: -0.35, amplitude: 0.12, span: 0.75 },
    { spread: 0.1, y: 0, tilt: 0, amplitude: 0.45, span: 0.95 },
    { spread: 1.05, y: -0.12, tilt: 0.35, amplitude: 0.12, span: 0.7 },
  ].slice(0, pairs)
  const wings = layout.map((l, k) => {
    const pair = new WingPair(
      'feather',
      base.body,
      base.wire,
      color,
      l.span,
      l.spread,
      k * 0.9,
      l.amplitude,
    )
    pair.object.position.y = l.y
    pair.object.rotation.x = l.tilt
    base.pose.add(pair.object)
    return pair
  })
  const ring = new Group()
  const faceMeshes = Array.from({ length: faces }, (_, k) => {
    const mesh = hologramPair(faceG, base.body, base.wire)
    const a = (k / Math.max(1, faces)) * Math.PI * 2
    mesh.position.set(Math.cos(a) * 0.24, 0.02, Math.sin(a) * 0.24)
    ring.add(mesh)
    return mesh
  })
  const halo = hologramPair(haloG, base.body, base.wire)
  halo.rotation.x = Math.PI / 2
  halo.position.y = 0.36
  base.pose.add(ring, halo)
  const stars = new Constellation(color, 13 + faces, new Uint16Array(0), 0.05)
  stars.sparkle = 0.6
  base.pose.add(stars.lines, stars.stars)
  return {
    object: base.object,
    update(f) {
      base.step(f)
      const t = f.reducedMotion ? 0 : f.time
      ring.rotation.y = t * 0.3
      ring.updateMatrix()
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - t * 0.4
        stars.set(
          i,
          v.set(Math.cos(a) * 0.3, Math.sin(a * 2) * 0.03, Math.sin(a) * 0.3),
        )
      }
      stars.set(12, v.set(0, 0, 0))
      faceMeshes.forEach((mesh, k) =>
        stars.set(13 + k, v.copy(mesh.position).applyMatrix4(ring.matrix)),
      )
      const scale = scaleOf(base.pose)
      stars.commit(f, scale)
      for (const pair of wings) pair.update(f, scale, 0.7)
    },
    strike: base.strike,
    fall: base.fall,
    dispose() {
      for (const g of [coreG, faceG, haloG]) g.dispose()
      for (const pair of wings) pair.dispose()
      stars.dispose()
      base.dispose()
    },
  }
}

/* ── 색채 ──────────────────────────────────────────────── */

export function createColourBody(color: string, seed: number): Body3D {
  const base = frame(color)
  const random = seededRandom(seed)
  const blob = boilingSphere(0.42)
  base.pose.add(hologramPair(blob.geometry, base.body, base.wire))
  const count = 600
  const motes = Array.from({ length: count }, () => ({
    u: random(),
    s: random(),
    speed: 0.02 + random() * 0.08,
  }))
  const stars = new Constellation('#ffffff', count, new Uint16Array(0), 0.03)
  stars.sparkle = 0.6
  base.pose.add(stars.lines, stars.stars)
  const hue = new Color()
  return {
    object: base.object,
    update(f) {
      base.step(f)
      const t = f.reducedMotion ? 0 : f.time
      blob.update(t, 0.22)
      // 몸 빛깔도 천천히 이름 없는 색으로 바뀜
      hue.setHSL((t * 0.04) % 1, 0.65, 0.62)
      base.body.uniforms.uColor.value.copy(hue)
      base.wire.uniforms.uColor.value.copy(hue)
      motes.forEach((d, i) => {
        const a = d.u * 6.283 + t * (0.4 + d.speed * 8)
        const b = d.s * 6.283 + t * (0.3 + d.speed * 6)
        const r = 0.95 * (0.3 + 0.7 * Math.sqrt(d.s))
        stars.set(
          i,
          v.set(
            Math.sin(a) * r,
            Math.cos(b) * r * 0.75,
            Math.sin(a + b) * r * 0.5,
          ),
        )
        hue.setHSL((d.u + t * 0.05 + d.s * 0.3) % 1, 0.7, 0.6)
        stars.tint(i, hue.r * 1.4, hue.g * 1.4, hue.b * 1.4)
      })
      stars.commit(f, scaleOf(base.pose))
    },
    strike: base.strike,
    fall: base.fall,
    dispose() {
      blob.geometry.dispose()
      stars.dispose()
      base.dispose()
    },
  }
}
