/**
 * 우주적 존재의 모습: 별자리처럼 선(획)과 별(마디)로 그립니다.
 * 좌표는 존재의 반지름을 1로 한 값이고, 'screen' 그림은 카메라를 향한 판에,
 * 'world' 그림(고리·바퀴·구체 무리 등)은 공간에 그대로 놓습니다.
 * t는 실제로 흐른 초 (동작 줄이기면 0으로 고정).
 */
import type { BeingForm, FormOptions } from '../../../../model/mythic/catalog'

/** 획 하나: [x, y, z, x, y, z, ...] */
export type Stroke = number[]

export interface Drawing {
  strokes: Stroke[]
  space: 'screen' | 'world'
  /** 획과 따로 빛나는 별 [x, y, z, 크기] */
  stars: number[]
  /** 획 없이 떠도는 입자 무리의 중심과 퍼짐 (떼·구름·색채) */
  cloud?: { spread: number; swirl: number; count: number }
  /** 가운데를 가리는 검은 핵 (공허·눈의 동공) 반지름 */
  core?: number
}

const TAU = Math.PI * 2

/* ── 획 도우미 ────────────────────────────────────── */

const line = (...pts: Array<[number, number]>): Stroke =>
  pts.flatMap(([x, y]) => [x, y, 0])

/** 2차 베지어 */
function quad(
  a: [number, number],
  c: [number, number],
  b: [number, number],
  n = 10,
): Stroke {
  const out: Stroke = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    out.push(
      u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
      0,
    )
  }
  return out
}

function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  a0: number,
  a1: number,
  n = 16,
): Stroke {
  const out: Stroke = []
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n
    out.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 0)
  }
  return out
}

const circle = (cx: number, cy: number, r: number, n = 16) =>
  arc(cx, cy, r, r, 0, TAU, n)

/** x를 뒤집은 획 (좌우 대칭) */
const mirror = (s: Stroke): Stroke => s.map((v, i) => (i % 3 === 0 ? -v : v))

function shift(s: Stroke, dx: number, dy: number, scale = 1): Stroke {
  return s.map((v, i) =>
    i % 3 === 0 ? v * scale + dx : i % 3 === 1 ? v * scale + dy : v,
  )
}

/** (px, py)를 축으로 각 a만큼 돌림 */
function rotate(s: Stroke, px: number, py: number, a: number): Stroke {
  const c = Math.cos(a)
  const sn = Math.sin(a)
  const out = s.slice()
  for (let i = 0; i < out.length; i += 3) {
    const x = out[i] - px
    const y = out[i + 1] - py
    out[i] = px + x * c - y * sn
    out[i + 1] = py + x * sn + y * c
  }
  return out
}

/** 굽이치는 등뼈: from→to 사이를 n점으로, 진폭·파수·위상 */
function spine(
  from: [number, number],
  to: [number, number],
  n: number,
  amp: number,
  waves: number,
  phase: number,
): Stroke {
  const out: Stroke = []
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  for (let i = 0; i <= n; i++) {
    const t = i / n
    // 머리 쪽으로 갈수록 덜 흔들림
    const w = amp * Math.sin(t * waves * TAU + phase) * (1 - 0.6 * t)
    out.push(from[0] + dx * t + nx * w, from[1] + dy * t + ny * w, 0)
  }
  return out
}

/** 획을 법선 방향으로 띄운 획 (몸통 두께) */
function offset(s: Stroke, d: number, taper = true): Stroke {
  const out: Stroke = []
  const n = s.length / 3
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 1)
    const b = Math.min(n - 1, i + 1)
    const tx = s[b * 3] - s[a * 3]
    const ty = s[b * 3 + 1] - s[a * 3 + 1]
    const len = Math.hypot(tx, ty) || 1
    const k = taper ? 0.35 + 0.65 * Math.sin((Math.PI * i) / (n - 1)) : 1
    out.push(
      s[i * 3] - (ty / len) * d * k,
      s[i * 3 + 1] + (tx / len) * d * k,
      0,
    )
  }
  return out
}

/** 획의 i번째 점 */
const pointOf = (s: Stroke, i: number): [number, number] => {
  const k = Math.max(0, Math.min(s.length / 3 - 1, i)) * 3
  return [s[k], s[k + 1]]
}

const endOf = (s: Stroke) => pointOf(s, s.length / 3 - 1)

/* ── 날개 ─────────────────────────────────────────── */

/** 펼친 날개 (오른쪽): 어깨에서 끝까지 앞날개, 뒷날개, 깃 */
function wing(
  shoulder: [number, number],
  span: number,
  lift: number,
  feathers = 4,
  bat = false,
): Stroke[] {
  const [sx, sy] = shoulder
  const tip: [number, number] = [sx + span, sy + 0.3 * span + lift]
  const front = quad(
    [sx, sy],
    [sx + span * 0.45, sy + 0.55 * span + lift * 0.6],
    tip,
  )
  const back = quad(
    tip,
    [sx + span * 0.55, sy + 0.05 * span + lift * 0.3],
    [sx + 0.05, sy - 0.25 * span],
  )
  const out = [front, back]
  for (let k = 1; k <= feathers; k++) {
    const p = pointOf(back, Math.round((k / (feathers + 1)) * 10))
    out.push(
      bat
        ? line(p, [sx + span * 0.12 * k, sy + 0.1])
        : line(p, [p[0] + 0.08 * span, p[1] - 0.22 * span]),
    )
  }
  return out
}

const both = (strokes: Stroke[]) => [...strokes, ...strokes.map(mirror)]

/* ── 꼴별 그림 ────────────────────────────────────── */

function bird(o: FormOptions, t: number): Drawing {
  const flap = Math.sin(t * TAU * 0.35) * 0.28
  const strokes: Stroke[] = [
    // 몸과 머리
    line([0, 0.45], [0, 0.1], [0, -0.3]),
    circle(0, 0.53, 0.08, 10),
    line([0, 0.61], [0.05, 0.67]),
    ...both(wing([0.06, 0.25], 0.95, flap, 4)),
  ]
  const tail = o.tail ?? 'short'
  const sway = Math.sin(t * 0.9) * 0.08
  if (tail === 'long')
    for (const x of [-0.18, 0, 0.18])
      strokes.push(
        quad([0, -0.3], [x * 2 + sway, -0.75], [x + sway * 2, -1.25]),
      )
  else if (tail === 'fan')
    for (const x of [-0.45, -0.22, 0, 0.22, 0.45])
      strokes.push(line([0, -0.3], [x + sway, -0.88]))
  else
    strokes.push(line([0, -0.3], [-0.1, -0.55]), line([0, -0.3], [0.1, -0.55]))
  if (o.crest)
    for (const x of [-0.06, 0, 0.06])
      strokes.push(quad([x, 0.6], [x * 2, 0.75], [x * 3 - 0.02, 0.82], 4))
  if (o.mane)
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * TAU
      strokes.push(
        line(
          [Math.cos(a) * 0.09, 0.53 + Math.sin(a) * 0.09],
          [Math.cos(a) * 0.18, 0.53 + Math.sin(a) * 0.18],
        ),
      )
    }
  if (o.legs)
    for (let k = 0; k < o.legs; k++) {
      const x = (k - (o.legs - 1) / 2) * 0.09
      strokes.push(line([x * 0.5, -0.12], [x, -0.42]))
    }
  return { strokes, space: 'screen', stars: [0, 0.53, 0, 1.6] }
}

/** 용·뱀의 몸통과 머리 */
function serpentine(o: FormOptions, t: number, dragon: boolean): Drawing {
  const phase = t * 1.6
  const body = spine([-1.1, -0.25], [0.65, 0.2], 30, 0.32, 1.25, phase)
  const belly = offset(body, -0.1)
  const back = offset(body, 0.06)
  const strokes: Stroke[] = [body, belly]
  const [hx, hy] = endOf(body)
  const dir = Math.atan2(hy - pointOf(body, 27)[1], hx - pointOf(body, 27)[0])
  if (o.humanFace) {
    strokes.push(circle(hx + 0.12, hy + 0.04, 0.13, 12))
    strokes.push(line([hx + 0.07, hy + 0.07], [hx + 0.11, hy + 0.07]))
    strokes.push(line([hx + 0.15, hy + 0.07], [hx + 0.19, hy + 0.07]))
  } else {
    // 주둥이와 턱
    const snout = rotate(
      line([0, 0.06], [0.28, 0.03], [0.32, -0.02], [0.12, -0.06], [0, -0.05]),
      0,
      0,
      dir,
    )
    strokes.push(shift(snout, hx, hy))
  }
  if (dragon && o.horns !== false && !o.humanFace)
    strokes.push(
      shift(
        rotate(quad([0, 0.05], [-0.12, 0.2], [-0.28, 0.24], 5), 0, 0, dir),
        hx,
        hy,
      ),
      shift(
        rotate(quad([0.02, 0.05], [-0.05, 0.24], [-0.18, 0.32], 5), 0, 0, dir),
        hx,
        hy,
      ),
    )
  if (dragon && !o.humanFace) {
    // 수염
    const whip = Math.sin(t * 1.3) * 0.08
    strokes.push(
      shift(
        quad([0.25, -0.02], [0.45, -0.2 + whip], [0.6, -0.12 - whip]),
        hx,
        hy,
      ),
    )
  }
  if (o.fins)
    for (let k = 6; k < 26; k += 4) {
      const p = pointOf(back, k)
      strokes.push(line(p, [p[0] - 0.06, p[1] + 0.12]))
    }
  if (dragon && o.legs) {
    for (const k of [9, 13, 20, 24]) {
      const p = pointOf(belly, k)
      const step = Math.sin(t * 2 + k) * 0.06
      strokes.push(
        line(
          p,
          [p[0] + 0.06 + step, p[1] - 0.16],
          [p[0] + 0.14 + step, p[1] - 0.2],
        ),
      )
    }
  }
  if (o.wings) {
    const p = pointOf(back, 18)
    const flap = Math.sin(t * TAU * 0.3) * 0.2
    for (const s of wing(p, 0.65, flap, 3, true))
      strokes.push(rotate(s, p[0], p[1], 0.3))
  }
  return { strokes, space: 'screen', stars: [hx, hy + 0.04, 0, 1.4] }
}

function hydra(o: FormOptions, t: number): Drawing {
  const heads = o.heads ?? 7
  const strokes: Stroke[] = [
    arc(0, -0.45, 0.5, 0.3, 0, Math.PI, 14),
    line([-0.5, -0.45], [0.5, -0.45]),
  ]
  const stars: number[] = []
  for (let k = 0; k < heads; k++) {
    const spread = (k / (heads - 1) - 0.5) * 2
    const sway = Math.sin(t * 1.2 + k * 1.7) * 0.12
    const neck = quad(
      [spread * 0.35, -0.2],
      [spread * 0.55 + sway, 0.25],
      [spread * 0.9 + sway * 1.5, 0.75 - Math.abs(spread) * 0.25],
      8,
    )
    strokes.push(neck)
    const [x, y] = endOf(neck)
    strokes.push(
      line([x, y], [x + 0.12, y + 0.04], [x + 0.13, y - 0.03], [x, y - 0.04]),
    )
    stars.push(x + 0.04, y + 0.01, 0, 1.1)
  }
  // 꼬리
  strokes.push(spine([-0.4, -0.55], [-1.1, -0.8], 10, 0.08, 1.5, t))
  return { strokes, space: 'screen', stars }
}

function beast(o: FormOptions, t: number): Drawing {
  const gait = t * 3.2
  const heavy = o.heavy ? 1.3 : 1
  const strokes: Stroke[] = [
    // 등과 배
    quad([-0.6, 0.12], [-0.05, 0.3], [0.45, 0.2]),
    quad([-0.55, -0.12 * heavy], [-0.05, -0.2 * heavy], [0.42, -0.12 * heavy]),
  ]
  // 다리 넷: 허벅지와 정강이, 걸음에 따라 흔들림
  const legs: Array<[number, number]> = [
    [0.36, 0],
    [0.25, Math.PI],
    [-0.42, Math.PI / 2],
    [-0.5, (3 * Math.PI) / 2],
  ]
  for (const [x, ph] of legs) {
    const swing = Math.sin(gait + ph) * 0.18
    const knee: [number, number] = [x + swing * 0.5, -0.45]
    const foot: [number, number] = [x + swing, -0.78]
    strokes.push(line([x, -0.1 * heavy], knee, foot))
    if (o.heavy)
      strokes.push(
        line(
          [x + 0.07, -0.12 * heavy],
          [knee[0] + 0.07, knee[1]],
          [foot[0] + 0.07, foot[1]],
        ),
      )
  }
  // 목과 머리
  const nod = Math.sin(gait * 0.5) * 0.03
  const hx = o.equine ? 0.82 : 0.74
  const hy = 0.42 + nod
  strokes.push(
    line([0.42, 0.18], [hx - 0.08, hy - 0.02]),
    line([0.42, -0.08], [hx - 0.06, hy - 0.18]),
  )
  const snout = o.canine || o.equine ? 0.26 : o.feline ? 0.14 : 0.2
  strokes.push(
    line(
      [hx - 0.1, hy],
      [hx + snout * 0.5, hy + 0.04],
      [hx + snout, hy - 0.06],
      [hx + snout * 0.6, hy - 0.14],
      [hx - 0.06, hy - 0.16],
    ),
  )
  if (o.maw)
    strokes.push(
      line(
        [hx + snout, hy - 0.06],
        [hx + snout * 1.1, hy - 0.22],
        [hx, hy - 0.2],
      ),
    )
  // 귀
  if (o.canine)
    strokes.push(
      line(
        [hx - 0.06, hy + 0.02],
        [hx - 0.02, hy + 0.2],
        [hx + 0.04, hy + 0.03],
      ),
    )
  else if (o.feline)
    strokes.push(arc(hx - 0.02, hy + 0.06, 0.06, 0.08, 0.2, Math.PI - 0.2, 5))
  else strokes.push(line([hx - 0.07, hy + 0.02], [hx - 0.1, hy + 0.12]))
  if (o.horn)
    strokes.push(
      quad(
        [hx + 0.02, hy + 0.06],
        [hx + 0.1, hy + 0.25],
        [hx + 0.2, hy + 0.34],
        5,
      ),
    )
  if (o.horns)
    strokes.push(
      quad(
        [hx - 0.04, hy + 0.05],
        [hx - 0.18, hy + 0.2],
        [hx - 0.3, hy + 0.18],
        5,
      ),
      quad([hx, hy + 0.06], [hx - 0.08, hy + 0.26], [hx - 0.2, hy + 0.3], 5),
    )
  if (o.mane)
    for (let k = 0; k < 5; k++) {
      const p: [number, number] = [0.45 + k * 0.06, 0.2 + k * 0.045]
      strokes.push(line(p, [p[0] - 0.12, p[1] + 0.06 + Math.sin(t + k) * 0.02]))
    }
  // 꼬리
  const flick = Math.sin(t * 1.4) * 0.2
  if (o.equine)
    for (const d of [0, 0.06, 0.12])
      strokes.push(
        quad([-0.6, 0.1], [-0.85, -0.05 + d], [-0.82 + flick * 0.3, -0.5 + d]),
      )
  else if (o.heads === 2)
    // 키메라: 뱀 꼬리와 등의 염소 머리
    strokes.push(
      spine([-0.6, 0.1], [-1.05, 0.35 + flick * 0.5], 10, 0.06, 1.5, t * 2),
      line([-0.1, 0.25], [-0.05, 0.48], [0.05, 0.52], [0.02, 0.4]),
      quad([-0.05, 0.5], [-0.15, 0.62], [-0.25, 0.6], 4),
    )
  else
    strokes.push(
      quad(
        [-0.6, 0.1],
        [-0.95, o.canine ? 0.05 : 0.35],
        [-1.05, (o.canine ? -0.15 : 0.55) + flick * 0.4],
      ),
    )
  if (o.wings) {
    const flap = Math.sin(t * TAU * 0.3) * 0.22
    strokes.push(
      ...wing([-0.05, 0.25], 0.75, flap, 3).map((s) =>
        rotate(s, -0.05, 0.25, 0.5),
      ),
    )
  }
  if (o.halo) strokes.push(circle(hx, hy + 0.38, 0.16, 14))
  return { strokes, space: 'screen', stars: [hx + 0.03, hy - 0.02, 0, 1.2] }
}

function turtle(t: number): Drawing {
  const paddle = Math.sin(t * 1.5) * 0.12
  const strokes: Stroke[] = [
    arc(0, -0.1, 0.62, 0.48, 0, Math.PI, 18),
    line([-0.62, -0.1], [0.62, -0.1]),
    // 등딱지 무늬
    line([-0.3, -0.1], [-0.18, 0.2], [0.18, 0.2], [0.3, -0.1]),
    line([-0.18, 0.2], [-0.1, 0.36]),
    line([0.18, 0.2], [0.1, 0.36]),
    line([-0.45, 0.12], [-0.18, 0.2]),
    line([0.45, 0.12], [0.18, 0.2]),
    // 머리
    line([0.6, 0], [0.82, 0.08], [0.9, 0.0], [0.62, -0.08]),
    // 지느러미발
    line([0.4, -0.12], [0.6 + paddle, -0.42]),
    line([-0.4, -0.12], [-0.6 - paddle, -0.42]),
    line([0.2, -0.12], [0.28 - paddle, -0.38]),
    line([-0.2, -0.12], [-0.28 + paddle, -0.38]),
  ]
  // 등딱지를 휘감은 뱀
  const snake: Stroke = []
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * TAU * 1.1 + t * 0.4
    snake.push(
      Math.cos(a) * 0.78,
      -0.05 + Math.sin(a) * 0.55 + Math.sin(a * 3 + t) * 0.04,
      0,
    )
  }
  strokes.push(snake)
  const head = endOf(snake)
  return {
    strokes,
    space: 'screen',
    stars: [0.86, 0.03, 0, 1.1, head[0], head[1], 0, 1.1],
  }
}

/** 세계를 휘감은 고리 뱀 (공간에 놓임) */
function ring(t: number): Drawing {
  const strokes: Stroke[] = []
  for (const r0 of [1, 0.93]) {
    const s: Stroke = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * TAU * 0.97 + t * 0.15
      const r = r0 + Math.sin(a * 9 - t * 1.5) * 0.035
      s.push(Math.cos(a) * r, Math.sin(a * 2) * 0.04, Math.sin(a) * r)
    }
    strokes.push(s)
  }
  const a = t * 0.15
  const head = [Math.cos(a) * 0.965, 0, Math.sin(a) * 0.965]
  // 제 꼬리를 문 머리
  strokes.push([
    head[0],
    0.08,
    head[2],
    head[0] + Math.sin(a) * 0.12,
    0,
    head[2] - Math.cos(a) * 0.12,
    head[0],
    -0.08,
    head[2],
  ])
  return { strokes, space: 'world', stars: [head[0], 0, head[2], 1.6] }
}

function weapon(
  kind: FormOptions['weapon'],
  hand: [number, number],
  t: number,
): Stroke[] {
  const [x, y] = hand
  switch (kind) {
    case 'spear':
      return [
        line([x, y - 0.5], [x, y + 0.75]),
        line([x - 0.05, y + 0.62], [x, y + 0.8], [x + 0.05, y + 0.62]),
      ]
    case 'hammer':
      return [
        line([x, y - 0.1], [x, y + 0.4]),
        line(
          [x - 0.14, y + 0.4],
          [x + 0.14, y + 0.4],
          [x + 0.14, y + 0.55],
          [x - 0.14, y + 0.55],
          [x - 0.14, y + 0.4],
        ),
      ]
    case 'sword':
      return [
        line([x, y], [x + 0.05, y + 0.85]),
        line([x - 0.08, y + 0.08], [x + 0.1, y + 0.06]),
      ]
    case 'scythe':
      return [
        line([x, y - 0.55], [x, y + 0.7]),
        quad([x, y + 0.7], [x - 0.35, y + 0.78], [x - 0.48, y + 0.5], 8),
      ]
    case 'bow':
      return [
        arc(x, y, 0.18, 0.45, -Math.PI / 2, Math.PI / 2, 10),
        line([x, y - 0.45], [x, y + 0.45]),
      ]
    case 'axe':
      return [
        line([x, y - 0.3], [x, y + 0.55]),
        quad([x, y + 0.5], [x + 0.28, y + 0.42], [x + 0.02, y + 0.25], 6),
      ]
    case 'bolt': {
      const j = Math.sin(t * 9) * 0.03
      return [
        line(
          [x, y],
          [x + 0.12 + j, y + 0.25],
          [x - 0.02, y + 0.3],
          [x + 0.14 - j, y + 0.62],
        ),
      ]
    }
    default:
      return []
  }
}

function giant(o: FormOptions, t: number): Drawing {
  const breathe = Math.sin(t * 0.8) * 0.02
  const strokes: Stroke[] = []
  const stars: number[] = []
  const headY = 0.72 + breathe
  // 머리
  if (o.headdress === 'falcon')
    strokes.push(
      line(
        [-0.1, headY - 0.1],
        [-0.12, headY + 0.08],
        [0.02, headY + 0.13],
        [0.16, headY + 0.02],
        [0.08, headY - 0.02],
        [0.1, headY - 0.1],
      ),
    )
  else strokes.push(circle(0, headY, 0.12, 12))
  if (o.headdress === 'sun' || o.headdress === 'falcon')
    strokes.push(circle(0, headY + 0.3, 0.14, 14))
  if (o.headdress === 'sun') stars.push(0, headY + 0.3, 0, 2.2)
  if (o.headdress === 'crown')
    strokes.push(
      line(
        [-0.12, headY + 0.1],
        [-0.12, headY + 0.22],
        [-0.06, headY + 0.15],
        [0, headY + 0.24],
        [0.06, headY + 0.15],
        [0.12, headY + 0.22],
        [0.12, headY + 0.1],
      ),
    )
  if (o.horns)
    strokes.push(
      quad(
        [-0.08, headY + 0.1],
        [-0.2, headY + 0.24],
        [-0.16, headY + 0.36],
        5,
      ),
      quad([0.08, headY + 0.1], [0.2, headY + 0.24], [0.16, headY + 0.36], 5),
    )
  if ((o.heads ?? 1) >= 3)
    strokes.push(
      circle(-0.24, headY - 0.05, 0.08, 10),
      circle(0.24, headY - 0.05, 0.08, 10),
    )
  if (o.halo) strokes.push(circle(0, headY + 0.02, 0.24, 20))
  // 몸통
  strokes.push(
    line([-0.32, 0.52], [0.32, 0.52]),
    line([-0.32, 0.52], [-0.18, -0.05], [0.18, -0.05], [0.32, 0.52]),
  )
  // 팔 (여럿이면 각도를 달리해서)
  const pairs = Math.max(1, Math.round((o.arms ?? 2) / 2))
  for (let k = 0; k < pairs; k++) {
    const lift = k * 0.35 + Math.sin(t * 0.7 + k) * 0.06
    const left = line(
      [-0.32, 0.5],
      [-0.55, 0.25 + lift],
      [-0.62, -0.02 + lift * 1.2],
    )
    strokes.push(left, mirror(left))
  }
  if (o.weapon) strokes.push(...weapon(o.weapon, [0.62, 0.0 + 0.06], t))
  // 다리
  if (o.serpentLegs) {
    for (const side of [-1, 1]) {
      const coil = spine(
        [side * 0.15, -0.05],
        [side * 0.75, -0.95],
        16,
        0.12,
        1.5,
        t * 1.4 + side,
      )
      strokes.push(coil, offset(coil, 0.06))
    }
  } else if (o.robe) {
    const hem: Stroke = []
    for (let i = 0; i <= 12; i++) {
      const x = -0.45 + (0.9 * i) / 12
      hem.push(x, -0.95 + (i % 2 === 0 ? 0 : 0.08) + Math.sin(t + i) * 0.02, 0)
    }
    strokes.push(
      line([-0.2, 0.2], [-0.45, -0.95]),
      line([0.2, 0.2], [0.45, -0.95]),
      hem,
    )
  } else {
    strokes.push(
      line([-0.14, -0.05], [-0.2, -0.5], [-0.25, -0.95]),
      line([0.14, -0.05], [0.2, -0.5], [0.25, -0.95]),
    )
  }
  if (o.wings) {
    const flap = Math.sin(t * TAU * 0.25) * 0.18
    strokes.push(...both(wing([0.15, 0.45], 0.85, flap, 4)))
  }
  stars.push(0, headY, 0, 1.5)
  return { strokes, space: 'screen', stars }
}

function octopus(o: FormOptions, t: number): Drawing {
  const strokes: Stroke[] = [
    arc(0, 0.35, 0.42, 0.48, 0, Math.PI, 16),
    line([-0.42, 0.35], [0.42, 0.35]),
  ]
  for (let k = 0; k < 8; k++) {
    const x = -0.36 + (0.72 * k) / 7
    const curl = Math.sin(t * 1.3 + k) * 0.18
    strokes.push(
      quad(
        [x, 0.33],
        [x * 1.4 + curl, -0.25],
        [x * 1.8 - curl, -0.95 + Math.abs(x) * 0.3],
        10,
      ),
    )
  }
  if (o.wings) {
    const flap = Math.sin(t * TAU * 0.2) * 0.15
    strokes.push(...both(wing([0.4, 0.45], 0.7, flap, 3, true)))
  }
  return {
    strokes,
    space: 'screen',
    stars: [-0.14, 0.45, 0, 1.3, 0.14, 0.45, 0, 1.3],
  }
}

function fish(o: FormOptions, t: number): Drawing {
  const sway = Math.sin(t * 1.6) * 0.12
  const len = o.whale ? 1 : 0.85
  const strokes: Stroke[] = [
    quad([len, 0], [0.1, 0.42], [-0.7, 0.05]),
    quad([len, 0], [0.1, -0.38], [-0.7, -0.05]),
    // 꼬리
    line(
      [-0.7, 0.05],
      [-1.05, 0.35 + sway],
      [-0.92, 0 + sway * 0.5],
      [-1.05, -0.35 + sway],
      [-0.7, -0.05],
    ),
    // 지느러미
    line([0.05, 0.28], [-0.18, 0.5], [-0.25, 0.25]),
    line([0.3, -0.18], [0.12, -0.42], [0.05, -0.22]),
  ]
  if (o.fins)
    for (const x of [0.4, 0.2, 0])
      strokes.push(line([x, 0.3], [x - 0.08, 0.42]))
  const stars = [len - 0.22, 0.08, 0, 1.2]
  if (o.whale) {
    // 숨구멍 물보라
    for (let k = 0; k < 4; k++) {
      const a = -0.6 + k * 0.4
      const h = 0.25 + ((t * 0.6 + k * 0.25) % 1) * 0.35
      stars.push(0.5 + Math.sin(a) * h * 0.4, 0.38 + h, 0, 0.7)
    }
  }
  return { strokes, space: 'screen', stars }
}

function jelly(t: number): Drawing {
  const pulse = 1 + Math.sin(t * 1.4) * 0.06
  const strokes: Stroke[] = [arc(0, 0, 0.6 * pulse, 0.5, 0, Math.PI, 18)]
  const rim: Stroke = []
  for (let i = 0; i <= 18; i++) {
    const x = -0.6 * pulse + (1.2 * pulse * i) / 18
    rim.push(x, i % 2 === 0 ? 0 : -0.06, 0)
  }
  strokes.push(rim)
  for (const x of [-0.25, 0, 0.25])
    strokes.push(arc(x, 0.12, 0.1, 0.12, 0, TAU, 8))
  for (let k = 0; k < 10; k++) {
    const x = -0.5 + k / 9
    strokes.push(spine([x, -0.05], [x * 1.2, -1.3], 14, 0.07, 1.5, t * 1.2 + k))
  }
  return { strokes, space: 'screen', stars: [0, 0.2, 0, 1.4] }
}

function worm(t: number): Drawing {
  const body = spine([-1.1, -0.4], [0.6, 0.25], 26, 0.25, 1.1, t * 1.2)
  const strokes: Stroke[] = [
    body,
    offset(body, 0.16, false),
    offset(body, -0.16, false),
  ]
  for (let k = 2; k < 26; k += 3) {
    const a = pointOf(offset(body, 0.16, false), k)
    const b = pointOf(offset(body, -0.16, false), k)
    strokes.push(line(a, b))
  }
  const [hx, hy] = endOf(body)
  strokes.push(circle(hx + 0.1, hy + 0.04, 0.2, 14))
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU + t * 0.5
    strokes.push(
      line(
        [hx + 0.1 + Math.cos(a) * 0.2, hy + 0.04 + Math.sin(a) * 0.2],
        [hx + 0.1 + Math.cos(a) * 0.1, hy + 0.04 + Math.sin(a) * 0.1],
      ),
    )
  }
  return {
    strokes,
    space: 'screen',
    stars: [hx + 0.1, hy + 0.04, 0, 1.2],
    core: 0.08,
  }
}

function formless(t: number): Drawing {
  const blob: Stroke = []
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * TAU
    const r =
      0.55 + Math.sin(a * 3 + t * 1.1) * 0.07 + Math.sin(a * 5 - t * 0.7) * 0.04
    blob.push(Math.cos(a) * r * 1.1, Math.sin(a) * r * 0.8, 0)
  }
  const strokes: Stroke[] = [blob]
  for (let k = 0; k < 6; k++) {
    const x = -0.45 + (0.9 * k) / 5
    const step = Math.sin(t * 3 + k * 1.3) * 0.06
    strokes.push(line([x, -0.4], [x + step, -0.8]))
  }
  const flap = Math.sin(t * TAU * 0.4) * 0.15
  for (const y of [0.15, -0.05])
    strokes.push(...both(wing([0.5, y], 0.45, flap, 2)))
  return { strokes, space: 'screen', stars: [] }
}

function voidForm(t: number): Drawing {
  const strokes: Stroke[] = []
  for (let k = 0; k < 4; k++) {
    const s: Stroke = []
    const r0 = 0.45 + k * 0.17
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * TAU
      const r = r0 + Math.sin(a * (5 + k) + t * (0.8 + k * 0.3)) * 0.06
      s.push(Math.cos(a) * r, Math.sin(a) * r, 0)
    }
    strokes.push(s)
  }
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * TAU + t * 0.2
    const s: Stroke = []
    for (let i = 0; i <= 10; i++) {
      const r = 0.5 + i * 0.07
      const w = a + Math.sin(i * 0.9 + t * 1.5 + k) * 0.25
      s.push(Math.cos(w) * r, Math.sin(w) * r, 0)
    }
    strokes.push(s)
  }
  return { strokes, space: 'screen', stars: [], core: 0.42 }
}

function globes(t: number): Drawing {
  const stars: number[] = []
  const strokes: Stroke[] = []
  const centers: number[][] = []
  for (let k = 0; k < 15; k++) {
    const a = k * 2.399 + t * 0.12
    const y = 1 - (2 * (k + 0.5)) / 15
    const r = Math.sqrt(1 - y * y) * 0.75
    const p = [Math.cos(a) * r, y * 0.75, Math.sin(a) * r]
    centers.push(p)
    stars.push(p[0], p[1], p[2], 2.6 + (k % 3) * 0.8)
  }
  for (let k = 0; k < centers.length; k++) {
    const a = centers[k]
    const b = centers[(k + 4) % centers.length]
    strokes.push([...a, ...b])
  }
  return { strokes, space: 'world', stars }
}

function brood(t: number): Drawing {
  const strokes: Stroke[] = []
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * TAU + Math.sin(t * 0.3 + k) * 0.2
    strokes.push(
      spine(
        [Math.cos(a) * 0.35, Math.sin(a) * 0.3],
        [Math.cos(a) * 1.15, Math.sin(a) * 0.95],
        12,
        0.08,
        1.5,
        t * 1.6 + k,
      ),
    )
  }
  return {
    strokes,
    space: 'screen',
    stars: [],
    cloud: { spread: 0.6, swirl: 0.3, count: 260 },
  }
}

function eye(t: number): Drawing {
  const look = Math.sin(t * 0.35) * 0.12
  const strokes: Stroke[] = [
    quad([-1, 0], [0, 0.85], [1, 0], 18),
    quad([-1, 0], [0, -0.85], [1, 0], 18),
    circle(look, 0, 0.33, 18),
  ]
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU
    strokes.push(
      line(
        [Math.cos(a) * 1.08, Math.sin(a) * 0.6],
        [Math.cos(a) * 1.3, Math.sin(a) * 0.78],
      ),
    )
  }
  return { strokes, space: 'screen', stars: [look, 0, 0, 2], core: 0.16 }
}

function wheels(t: number): Drawing {
  const strokes: Stroke[] = []
  const stars: number[] = []
  const axes = [
    [t * 0.5, 0],
    [0, t * 0.4],
    [t * 0.3, t * 0.3],
  ]
  axes.forEach(([ax, ay], k) => {
    const r = 1 - k * 0.15
    const s: Stroke = []
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * TAU
      let x = Math.cos(a) * r
      let y = Math.sin(a) * r
      let z = 0
      // 축마다 다르게 기울임
      const y1 = y * Math.cos(ax) - z * Math.sin(ax)
      z = y * Math.sin(ax) + z * Math.cos(ax)
      y = y1
      const x1 = x * Math.cos(ay) + z * Math.sin(ay)
      z = -x * Math.sin(ay) + z * Math.cos(ay)
      x = x1
      s.push(x, y, z)
      if (i % 6 === 0) stars.push(x, y, z, 1.2)
    }
    strokes.push(s)
  })
  return { strokes, space: 'world', stars }
}

function angel(o: FormOptions, t: number): Drawing {
  const wings = o.wings ?? 6
  const strokes: Stroke[] = [
    circle(0, 0.18, 0.12, 12),
    line([-0.14, 0.05], [-0.22, -0.55], [0.22, -0.55], [0.14, 0.05]),
  ]
  const pairs = Math.round(wings / 2)
  for (let k = 0; k < pairs; k++) {
    const angle = pairs === 1 ? 0.2 : 0.9 - (1.8 * k) / (pairs - 1)
    const flap = Math.sin(t * TAU * 0.3 + k) * 0.12
    for (const s of wing([0.1, 0.05], 0.8, flap, 3)) {
      const r = rotate(s, 0.1, 0.05, angle * 0.7)
      strokes.push(r, mirror(r))
    }
  }
  if ((o.faces ?? 1) >= 4)
    for (const [x, y] of [
      [-0.24, 0.24],
      [0.24, 0.24],
      [0, 0.42],
    ])
      strokes.push(circle(x, y, 0.07, 8))
  if (o.weapon) strokes.push(...weapon(o.weapon, [0.3, -0.2], t))
  strokes.push(circle(0, 0.18, 0.26, 18))
  return { strokes, space: 'screen', stars: [0, 0.18, 0, 2.2] }
}

function mecha(o: FormOptions, t: number): Drawing {
  const h = o.heavy ? 1.25 : 1
  const sway = Math.sin(t * 0.6) * 0.03
  const strokes: Stroke[] = [
    // 머리와 눈 띠
    line([-0.1, 0.78], [0.1, 0.78], [0.12, 0.62], [-0.12, 0.62], [-0.1, 0.78]),
    line([-0.08, 0.7], [0.08, 0.7]),
    // 가슴
    line(
      [-0.38 * h, 0.55],
      [0.38 * h, 0.55],
      [0.26 * h, 0.05],
      [-0.26 * h, 0.05],
      [-0.38 * h, 0.55],
    ),
    // 어깨
    line(
      [-0.38 * h, 0.55],
      [-0.58 * h, 0.6],
      [-0.6 * h, 0.4],
      [-0.4 * h, 0.38],
    ),
    line([0.38 * h, 0.55], [0.58 * h, 0.6], [0.6 * h, 0.4], [0.4 * h, 0.38]),
    // 팔
    line([-0.55 * h, 0.4], [-0.62 * h, 0.05 + sway], [-0.58 * h, -0.28 + sway]),
    line([0.55 * h, 0.4], [0.62 * h, 0.05 - sway], [0.58 * h, -0.28 - sway]),
    // 허리와 다리
    line([-0.2, 0.05], [-0.22, -0.12], [0.22, -0.12], [0.2, 0.05]),
    line(
      [-0.16, -0.12],
      [-0.22 * h, -0.52],
      [-0.3 * h, -0.95],
      [-0.08, -0.95],
      [-0.06, -0.52],
      [-0.04, -0.12],
    ),
    line(
      [0.16, -0.12],
      [0.22 * h, -0.52],
      [0.3 * h, -0.95],
      [0.08, -0.95],
      [0.06, -0.52],
      [0.04, -0.12],
    ),
    // 등 날개판
    line([-0.3, 0.5], [-0.62, 0.95]),
    line([0.3, 0.5], [0.62, 0.95]),
  ]
  if (o.heavy)
    strokes.push(
      line([0.58 * h, -0.28], [0.95, -0.2], [0.95, -0.34], [0.58 * h, -0.36]),
    )
  return { strokes, space: 'screen', stars: [0, 0.32, 0, 2.6, 0, 0.7, 0, 1.2] }
}

function harvester(t: number): Drawing {
  const strokes: Stroke[] = []
  const stars: number[] = []
  const s: Stroke = []
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * TAU + t * 0.1
    s.push(Math.cos(a), Math.sin(a * 3) * 0.03, Math.sin(a))
  }
  strokes.push(s)
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU + t * 0.1
    const x = Math.cos(a)
    const z = Math.sin(a)
    // 가운데로 모이는 채굴 빔
    strokes.push([x, 0, z, x * 0.35, 0, z * 0.35])
    stars.push(x, 0, z, 1.6)
  }
  return { strokes, space: 'world', stars }
}

function swarm(): Drawing {
  return {
    strokes: [],
    space: 'screen',
    stars: [],
    cloud: { spread: 0.9, swirl: 1.4, count: 520 },
  }
}

function colour(): Drawing {
  return {
    strokes: [],
    space: 'screen',
    stars: [],
    cloud: { spread: 0.75, swirl: 0.5, count: 420 },
  }
}

/** 니알라토텝: 천 개의 얼굴이 몇 초마다 바뀜 */
const MASKS: Array<(t: number) => Drawing> = [
  (t) => giant({ wings: 2, horns: true }, t),
  (t) => beast({ canine: true, maw: true }, t),
  (t) => bird({ tail: 'fan' }, t),
  (t) => octopus({}, t),
  (t) => eye(t),
]

/** 그 꼴의 지금 모습 */
export function drawBeing(form: BeingForm, o: FormOptions, t: number): Drawing {
  switch (form) {
    case 'bird':
      return bird(o, t)
    case 'dragon':
      return serpentine(o, t, true)
    case 'serpent':
      return serpentine(o, t, false)
    case 'hydra':
      return hydra(o, t)
    case 'beast':
      return beast(o, t)
    case 'turtle':
      return turtle(t)
    case 'ring':
      return ring(t)
    case 'giant':
      return giant(o, t)
    case 'octopus':
      return octopus(o, t)
    case 'fish':
      return fish(o, t)
    case 'jelly':
      return jelly(t)
    case 'worm':
      return worm(t)
    case 'formless':
      return formless(t)
    case 'void':
      return voidForm(t)
    case 'globes':
      return globes(t)
    case 'brood':
      return brood(t)
    case 'masks':
      return MASKS[Math.floor(t / 3.2) % MASKS.length](t)
    case 'eye':
      return eye(t)
    case 'wheels':
      return wheels(t)
    case 'angel':
      return angel(o, t)
    case 'swarm':
      return swarm()
    case 'mecha':
      return mecha(o, t)
    case 'harvester':
      return harvester(t)
    case 'colour':
      return colour()
  }
}
