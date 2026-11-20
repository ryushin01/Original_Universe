/**
 * 모델 없이 계산으로 만드는 뱀 무리의 몸
 * - serpent: 우주를 헤엄치는 큰 뱀 (이무기·브리트라·레비아탄·아펩)
 * - loong: 다리 넷·뿔·수염·등지느러미가 있는 동양 용, 날개를 달 수도 (청룡·황룡·촉룡·공공·응룡)
 * - ring: 제 꼬리를 문 고리 (우로보로스·요르문간드)
 * - hydra: 몸 하나에 목과 머리 여럿 (히드라·야마타노오로치)
 * 등뼈를 매 프레임 움직여 관(tube.ts)을 다시 짓고, 등뼈 위에 별자리를 둡니다.
 */
import {
  ConeGeometry,
  Group,
  IcosahedronGeometry,
  Quaternion,
  Vector3,
} from 'three'
import { Constellation } from './body'
import type { Body3D, BodyFrame } from './body'
import { WingPair, hologramPair, setMaterials } from './extras'
import { makeBodyMaterial, makeWireMaterial } from './hologram'
import { Tube } from './tube'

type Style = 'serpent' | 'loong' | 'ring' | 'hydra'

const headGeometry = new IcosahedronGeometry(1, 0)
const trunkGeometry = new IcosahedronGeometry(1, 2)
const hornGeometry = new ConeGeometry(0.018, 0.16, 4)
const spikeGeometry = new ConeGeometry(0.02, 0.07, 4)
const forward = new Vector3(0, 0, 1)
const p = new Vector3()
const q = new Vector3()
const dir = new Vector3()
const side = new Vector3()
const lift = new Vector3()
const rot = new Quaternion()

/** 등뼈 위치 (s: 0 머리 ~ 1 꼬리), 결과는 out */
function spineAt(style: Style, s: number, t: number, out: Vector3) {
  switch (style) {
    case 'serpent': {
      // 꼬리로 갈수록 크게 흔들며 S자로 헤엄침
      const phase = Math.PI * 2 * 1.4 * s - t * 1.6
      return out.set(
        Math.sin(phase) * (0.1 + 0.28 * s),
        0.16 * Math.sin(Math.PI * 1.4 * s - t * 1.1),
        0.95 - 1.9 * s,
      )
    }
    case 'loong': {
      // 옆과 위아래가 엇갈린 물결: 나사처럼 꿈틀대며 나아감
      const phase = Math.PI * 2 * 1.35 * s - t * 1.3
      return out.set(
        0.4 * Math.sin(phase),
        0.3 * Math.sin(phase * 0.8 + 1.2),
        0.9 - 1.8 * s,
      )
    }
    case 'ring': {
      // 거의 한 바퀴: 머리가 꼬리 끝을 묾
      const a = Math.PI * 2 * 0.94 * s + t * 0.25
      const r = 0.8 + 0.035 * Math.sin(a * 6 - t * 1.5)
      return out.set(
        Math.cos(a) * r,
        Math.sin(a) * r,
        0.06 * Math.sin(a * 4 + t * 0.5),
      )
    }
    case 'hydra':
      return out.set(0, 0, 0)
  }
}

interface Head {
  object: Group
  tube: Tube
}

export function createSerpentBody(
  style: Style,
  color: string,
  options: { heads?: number; wings?: boolean } = {},
): Body3D {
  const object = new Group()
  const pose = new Group()
  object.add(pose)
  const body = makeBodyMaterial(color)
  const wire = makeWireMaterial(color)

  const tubes: Tube[] = []
  const heads: Head[] = []
  const makeHead = (scale: number, horned: boolean) => {
    const head = new Group()
    const skull = hologramPair(headGeometry, body, wire)
    skull.scale.set(0.11 * scale, 0.07 * scale, 0.17 * scale)
    head.add(skull)
    if (horned)
      for (const k of [-1, 1]) {
        const horn = hologramPair(hornGeometry, body, wire)
        horn.position.set(k * 0.05 * scale, 0.07 * scale, -0.06 * scale)
        horn.rotation.set(-1.1, 0, -k * 0.35)
        horn.scale.setScalar(scale)
        head.add(horn)
      }
    pose.add(head)
    return head
  }

  // 몸통 (hydra는 목들)
  let main: Tube | undefined
  if (style !== 'hydra') {
    const thick = style === 'ring' ? 0.075 : style === 'loong' ? 0.07 : 0.085
    main = new Tube(style === 'ring' ? 90 : 72, 7, (s) =>
      style === 'loong'
        ? thick * (1 - s) ** 0.35 + 0.01
        : thick * (1 - s) ** 0.55 + 0.007,
    )
    tubes.push(main)
    pose.add(hologramPair(main.geometry, body, wire))
    heads.push({
      object: makeHead(style === 'ring' ? 1.1 : 1, style === 'loong'),
      tube: main,
    })
  }

  // 동양 용: 다리 넷 (앞 s=0.2, 뒤 s=0.62), 등지느러미
  const legs: { tube: Tube; at: number; side: number }[] = []
  const spikes: Group[] = []
  if (style === 'loong') {
    for (const at of [0.2, 0.62])
      for (const k of [-1, 1]) {
        const tube = new Tube(5, 5, (s) => 0.024 * (1 - s * 0.6))
        pose.add(hologramPair(tube.geometry, body, wire))
        legs.push({ tube, at, side: k })
      }
    for (let i = 0; i < 12; i++) {
      const spike = hologramPair(spikeGeometry, body, wire)
      pose.add(spike)
      spikes.push(spike)
    }
  }
  const wings =
    options.wings && style !== 'hydra'
      ? new WingPair('feather', body, wire, color, 0.75, 0.15)
      : undefined
  if (wings) pose.add(wings.object)

  // 머리 여럿: 몸통 덩어리에서 목이 부채꼴로 뻗음, 오로치는 꼬리도 여럿
  const count = options.heads ?? 0
  const necks: Tube[] = []
  const tails: Tube[] = []
  if (style === 'hydra') {
    const trunk = hologramPair(trunkGeometry, body, wire)
    trunk.scale.set(0.3, 0.24, 0.34)
    trunk.position.set(0, -0.3, -0.25)
    pose.add(trunk)
    for (let k = 0; k < count; k++) {
      const neck = new Tube(18, 6, (s) => 0.06 - s * 0.025)
      pose.add(hologramPair(neck.geometry, body, wire))
      necks.push(neck)
      tubes.push(neck)
      heads.push({ object: makeHead(0.85, false), tube: neck })
    }
    const tailCount = count >= 8 ? 4 : 1
    for (let k = 0; k < tailCount; k++) {
      const tail = new Tube(16, 5, (s) => 0.05 * (1 - s) + 0.006)
      pose.add(hologramPair(tail.geometry, body, wire))
      tails.push(tail)
    }
  }

  // 별자리: 등뼈 위의 별 (몸통은 4점마다, 목은 3점마다)
  const starPoints: { tube: Tube; i: number }[] = []
  for (const tube of [...tubes, ...tails])
    for (let i = 0; i < tube.count; i += tube === main ? 4 : 3)
      starPoints.push({ tube, i })
  const links: number[] = []
  starPoints.forEach((sp, k) => {
    if (k > 0 && starPoints[k - 1].tube === sp.tube) links.push(k - 1, k)
  })
  const stars = new Constellation(
    color,
    starPoints.length,
    new Uint16Array(links),
  )
  pose.add(stars.lines, stars.stars)

  let lunge = -1
  let falling = -1

  function build(t: number) {
    if (main) {
      for (let i = 0; i < main.count; i++)
        spineAt(style, i / (main.count - 1), t, p).toArray(main.spine, i * 3)
      main.update()
    }
    // 다리: 몸통의 그 자리에서 옆·아래로 뻗어 헤엄치듯 저음
    for (const leg of legs) {
      const i = Math.round(leg.at * (main!.count - 1))
      main!.point(i, p)
      main!.point(Math.max(0, i - 1), q)
      dir.subVectors(q, p).normalize()
      side
        .crossVectors(dir, lift.set(0, 1, 0))
        .normalize()
        .multiplyScalar(leg.side)
      const paddle = Math.sin(t * 2 + leg.at * 9 + leg.side) * 0.05
      for (let j = 0; j < leg.tube.count; j++) {
        const s = j / (leg.tube.count - 1)
        q.copy(p)
          .addScaledVector(side, 0.04 + s * 0.14)
          .addScaledVector(lift, -s * 0.12)
          .addScaledVector(dir, s * s * 0.08 + paddle * s)
        q.toArray(leg.tube.spine, j * 3)
      }
      leg.tube.update()
    }
    // 등지느러미: 등뼈를 따라 위로
    spikes.forEach((spike, k) => {
      const i = Math.round(
        (0.08 + (k / spikes.length) * 0.75) * (main!.count - 1),
      )
      main!.point(i, spike.position)
      spike.position.y += 0.06
    })
    // 히드라의 목: 몸통 위에서 부채꼴로 앞의 머리까지 휘어 오름
    necks.forEach((neck, k) => {
      const f = count > 1 ? k / (count - 1) - 0.5 : 0
      const sway = Math.sin(t * 1.2 + k * 1.7) * 0.08
      const base = q.set(f * 0.3, -0.18, -0.12)
      const tip = dir.set(
        Math.sin(f * 2.6) * 0.75 + sway,
        0.25 + 0.3 * Math.cos(f * 3.2) + Math.cos(t * 0.9 + k) * 0.06,
        0.2 + 0.45 * Math.cos(f * 2.6),
      )
      for (let i = 0; i < neck.count; i++) {
        const s = 1 - i / (neck.count - 1) // 0번 점이 머리
        // 두 점 사이를 위로 볼록하게 (2차 베지에)
        const cx = (base.x + tip.x) / 2
        const cy = Math.max(base.y, tip.y) + 0.25
        const cz = (base.z + tip.z) / 2
        const a = (1 - s) ** 2
        const b = 2 * (1 - s) * s
        const c = s * s
        p.set(
          a * base.x + b * cx + c * tip.x,
          a * base.y + b * cy + c * tip.y,
          a * base.z + b * cz + c * tip.z,
        )
        p.toArray(neck.spine, i * 3)
      }
      neck.update()
    })
    tails.forEach((tail, k) => {
      const f = tails.length > 1 ? k / (tails.length - 1) - 0.5 : 0
      for (let i = 0; i < tail.count; i++) {
        const s = i / (tail.count - 1)
        p.set(
          f * 0.4 + Math.sin(s * 5 - t * 1.6 + k) * 0.08 * s + f * s * 0.5,
          -0.3 - s * 0.25,
          -0.5 - s * 0.6,
        )
        p.toArray(tail.spine, i * 3)
      }
      tail.update()
    })
    // 머리: 등뼈 0번 점에서 앞 방향으로
    for (const head of heads) {
      head.tube.point(0, head.object.position)
      head.tube.heading(dir)
      head.object.quaternion.copy(rot.setFromUnitVectors(forward, dir))
      head.object.position.addScaledVector(dir, 0.1)
    }
    if (wings && main) {
      main.point(Math.round(0.16 * (main.count - 1)), wings.object.position)
      wings.object.position.y += 0.05
    }
  }

  return {
    object,
    update(frame: BodyFrame) {
      const t = frame.reducedMotion ? 0 : frame.time
      build(t)
      if (lunge >= 0) {
        lunge += frame.dt / 0.7
        pose.position.z = Math.sin(Math.min(lunge, 1) * Math.PI) * 0.22
        if (lunge >= 1) lunge = -1
      }
      if (falling >= 0) {
        falling += frame.dt
        pose.rotation.z = Math.min(falling * 0.5, 1.1)
        pose.position.y = -falling * 0.12
      }
      setMaterials(body, wire, frame)
      const scale = object.getWorldScale(q).x
      starPoints.forEach((sp, k) => stars.set(k, sp.tube.point(sp.i, p)))
      stars.commit(frame, scale)
      wings?.update(frame, scale, 0.8)
    },
    strike() {
      lunge = 0
    },
    fall() {
      if (falling < 0) falling = 0
    },
    dispose() {
      for (const tube of [...tubes, ...tails, ...legs.map((l) => l.tube)])
        tube.dispose()
      stars.dispose()
      wings?.dispose()
      body.dispose()
      wire.dispose()
    },
  }
}
