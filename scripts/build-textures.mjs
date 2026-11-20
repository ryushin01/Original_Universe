/**
 * 위성·왜행성·태양 텍스처 만들기: `pnpm textures` (일부만: `pnpm textures io europa`)
 *
 * 원본(NASA 3D Resources, Solar System Scope)을 내려받아 1024×512 WebP(`public/textures/<이름>.webp`)로 만듭니다.
 * 필요: libwebp의 `cwebp`·`dwebp` (macOS: `brew install webp`). 받은 원본은 임시 폴더에서만 다룹니다.
 *
 * - `fill`: 자료가 빈 곳을 가장 가까운 경계에 비춘 주변 지형으로 채움
 *   - `dark`: 검게 비운 곳 (이오의 극지방)
 *   - `blank`: 흐린 회색으로 메운 곳 (칼리스토). 밝고 잔무늬가 없는 곳을 고름
 * - `colors`: 흑백(또는 지나치게 짙은) 지도를 밝기에 따라 실제 빛깔로 칠함 [밝기, 색] 목록
 *
 * 출처와 손본 내용은 docs/data-sources.md에 있습니다.
 */
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const NASA =
  'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/'
const SSS = 'https://www.solarsystemscope.com/textures/download/'

/** @type {Record<string, { url: string, fill?: 'dark' | 'blank', colors?: Array<[number, string]> }>} */
const SOURCES = {
  io: {
    url: `${NASA}Jupiter%20-%20Io%20(A)/Jupiter%20-%20Io%20(A).jpg`,
    fill: 'dark',
  },
  // 붉은 갈색 줄무늬(리니아)와 흰 얼음
  europa: {
    url: `${NASA}Jupiter%20-%20Europa/Jupiter%20-%20Europa.jpg`,
    colors: [
      [0, '3d2418'],
      [90, '80513a'],
      [160, 'cbb79c'],
      [200, 'e9e0d1'],
      [255, 'fbf8f2'],
    ],
  },
  // 어두운 옛 지형과 밝은 홈 지형
  ganymede: {
    url: `${NASA}Jupiter%20-%20Ganymede/Jupiter%20-%20Ganymede.jpg`,
    colors: [
      [0, '2a2420'],
      [90, '5e554b'],
      [175, 'a89c8c'],
      [220, 'd9d2c6'],
      [255, 'f2efe9'],
    ],
  },
  // 가장 어두운 갈릴레이 위성, 밝은 충돌구 분출물
  callisto: {
    url: `${NASA}Jupiter%20-%20Callisto/Jupiter%20-%20Callisto.jpg`,
    fill: 'blank',
    colors: [
      [0, '1c1814'],
      [86, '3b342d'],
      [139, '5e554a'],
      [200, '9a9083'],
      [255, 'ddd6cc'],
    ],
  },
  // 지나치게 짙은 주황을 옅은 황갈색 안개로, 밝기 차이는 키움
  titan: {
    url: `${NASA}Saturn%20-%20Titan/Saturn%20-%20Titan.jpg`,
    colors: [
      [0, '6a3c18'],
      [112, '9c5f2a'],
      [132, 'd0974b'],
      [150, 'eec27e'],
      [255, 'fbe3b4'],
    ],
  },
  pluto: { url: `${NASA}Pluto/Pluto.jpg` },
  // 돈(Dawn) 탐사선 자료에 없는 곳은 가상 지형 (Solar System Scope, CC BY 4.0)
  ceres: { url: `${SSS}2k_ceres_fictional.jpg` },
  sun: { url: `${SSS}2k_sun.jpg` },
}

const W = 1024
const H = 512

const readPpm = async (file) => {
  const data = await readFile(file)
  // P6\n<w> <h>\n255\n<RGB...>
  let at = 0
  const fields = []
  while (fields.length < 3) {
    const end = data.indexOf(0x0a, at)
    fields.push(data.subarray(at, end).toString('ascii'))
    at = end + 1
  }
  const [w, h] = fields[1].split(' ').map(Number)
  if (fields[0] !== 'P6' || fields[2] !== '255')
    throw new Error(`PPM이 아닙니다: ${file}`)
  const px = new Uint8Array(data.subarray(at, at + w * h * 3))
  if (px.length !== w * h * 3) throw new Error(`PPM이 짧습니다: ${file}`)
  return { w, h, px }
}

const writePpm = (file, { w, h, px }) =>
  writeFile(file, Buffer.concat([Buffer.from(`P6\n${w} ${h}\n255\n`), px]))

const luma = (px, i) =>
  Math.floor(
    (299 * px[3 * i] + 587 * px[3 * i + 1] + 114 * px[3 * i + 2]) / 1000,
  )

/** (2r+1)² 상자 평균 (적분 영상, 가장자리는 잘라 냄) */
function boxMean(values, w, h, r) {
  const S = new Float64Array((w + 1) * (h + 1))
  for (let y = 0; y < h; y++) {
    let acc = 0
    for (let x = 0; x < w; x++) {
      acc += values[y * w + x]
      S[(y + 1) * (w + 1) + x + 1] = S[y * (w + 1) + x + 1] + acc
    }
  }
  const out = new Float64Array(w * h)
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r)
    const y1 = Math.min(h, y + r + 1)
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r)
      const x1 = Math.min(w, x + r + 1)
      const s =
        S[y1 * (w + 1) + x1] -
        S[y0 * (w + 1) + x1] -
        S[y1 * (w + 1) + x0] +
        S[y0 * (w + 1) + x0]
      out[y * w + x] = s / ((y1 - y0) * (x1 - x0))
    }
  }
  return out
}

/** 빈 곳 표시를 r픽셀 넓힘 (가로는 감쌈) */
function dilate(mask, w, h, r) {
  let m = mask
  for (let k = 0; k < r; k++) {
    const grown = m.slice()
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (m[i]) continue
        if (
          m[y * w + ((x - 1 + w) % w)] ||
          m[y * w + ((x + 1) % w)] ||
          (y > 0 && m[i - w]) ||
          (y < h - 1 && m[i + w])
        )
          grown[i] = 1
      }
    m = grown
  }
  return m
}

/** 자료가 빈 곳 고르기 */
function blankMask({ w, h, px }, kind) {
  const n = w * h
  const lum = new Float64Array(n)
  for (let i = 0; i < n; i++) lum[i] = luma(px, i)
  if (kind === 'dark') {
    const m = boxMean(lum, w, h, 1)
    return dilate(
      Uint8Array.from(m, (v) => (v < 30 ? 1 : 0)),
      w,
      h,
      2,
    )
  }
  // 메운 곳은 흐릿해서(잔무늬 없음) 둘레 밝기의 표준편차가 작거나, 아주 밝음
  const m = boxMean(lum, w, h, 4)
  const m2 = boxMean(
    lum.map((v) => v * v),
    w,
    h,
    4,
  )
  const smooth = boxMean(
    m.map((a, i) => (Math.sqrt(Math.max(0, m2[i] - a * a)) < 7 ? 1 : 0)),
    w,
    h,
    6,
  )
  const bright = boxMean(lum, w, h, 6)
  return dilate(
    Uint8Array.from(smooth, (v, i) => (v > 0.5 || bright[i] > 160 ? 1 : 0)),
    w,
    h,
    6,
  )
}

/**
 * 빈 곳을 가장 가까운 경계(위·아래·왼쪽·오른쪽 중 가까운 쪽)에 비춘 자리의 지형으로 채움.
 * 한 번에 못 채운 곳은 채운 곳을 자료로 삼아 되풀이
 */
function fillBlanks(image, kind) {
  const { w, h } = image
  let px = image.px
  let mask = blankMask(image, kind)
  const BIG = 1 << 20
  for (let pass = 0; pass < 6 && mask.some(Boolean); pass++) {
    const n = w * h
    const up = new Int32Array(n)
    const down = new Int32Array(n)
    const left = new Int32Array(n)
    const right = new Int32Array(n)
    for (let x = 0; x < w; x++) {
      let d = BIG
      for (let y = 0; y < h; y++)
        up[y * w + x] = d = mask[y * w + x] ? d + 1 : 0
      d = BIG
      for (let y = h - 1; y >= 0; y--)
        down[y * w + x] = d = mask[y * w + x] ? d + 1 : 0
    }
    for (let y = 0; y < h; y++) {
      let d = BIG
      for (let k = 0; k < 2 * w; k++) {
        const x = k % w
        left[y * w + x] = d = mask[y * w + x] ? d + 1 : 0
      }
      d = BIG
      for (let k = 2 * w - 1; k >= 0; k--) {
        const x = k % w
        right[y * w + x] = d = mask[y * w + x] ? d + 1 : 0
      }
    }
    const out = px.slice()
    const after = mask.slice()
    let filled = 0
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (!mask[i]) continue
        const options = [
          [up[i], 0, -1],
          [down[i], 0, 1],
          [left[i], -1, 0],
          [right[i], 1, 0],
        ].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
        for (const [d, dx, dy] of options) {
          if (d >= BIG) continue
          const sy = y + dy * 2 * d
          const sx = (((x + dx * 2 * d) % w) + w) % w
          if (sy < 0 || sy >= h || mask[sy * w + sx]) continue
          out.set(px.subarray(3 * (sy * w + sx), 3 * (sy * w + sx) + 3), 3 * i)
          after[i] = 0
          filled++
          break
        }
      }
    px = out
    mask = after
    if (!filled) break
  }
  return { ...image, px }
}

/** 밝기에 따라 [밝기, 색] 사이를 이어 칠함 */
function colorize(image, stops) {
  const points = stops.map(([v, hex]) => [
    v,
    [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16)),
  ])
  const table = new Uint8Array(256 * 3)
  for (let v = 0; v < 256; v++) {
    const k = points.findIndex(([x], j) => j > 0 && v <= x)
    const [x0, c0] = points[k - 1]
    const [x1, c1] = points[k]
    const t = x1 > x0 ? (v - x0) / (x1 - x0) : 0
    for (let c = 0; c < 3; c++)
      table[v * 3 + c] = Math.round(c0[c] + (c1[c] - c0[c]) * t)
  }
  const px = new Uint8Array(image.px.length)
  for (let i = 0; i < image.w * image.h; i++)
    px.set(
      table.subarray(luma(image.px, i) * 3, luma(image.px, i) * 3 + 3),
      i * 3,
    )
  return { ...image, px }
}

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' })

const names = process.argv.slice(2).length
  ? process.argv.slice(2)
  : Object.keys(SOURCES)
const work = await mkdtemp(path.join(tmpdir(), 'textures-'))
try {
  for (const name of names) {
    const source = SOURCES[name]
    if (!source)
      throw new Error(
        `모르는 텍스처: ${name} (${Object.keys(SOURCES).join(', ')})`,
      )
    const response = await fetch(source.url)
    if (!response.ok)
      throw new Error(`${name}: ${response.status} ${source.url}`)
    const original = path.join(work, `${name}.jpg`)
    await writeFile(original, Buffer.from(await response.arrayBuffer()))
    // 손실 없이 줄여 픽셀로 풀고, 손본 뒤 한 번만 손실 압축
    run('cwebp', [
      '-quiet',
      '-lossless',
      '-resize',
      `${W}`,
      `${H}`,
      original,
      '-o',
      path.join(work, `${name}.webp`),
    ])
    run('dwebp', [
      '-quiet',
      path.join(work, `${name}.webp`),
      '-ppm',
      '-o',
      path.join(work, `${name}.ppm`),
    ])
    let image = await readPpm(path.join(work, `${name}.ppm`))
    if (source.fill) image = fillBlanks(image, source.fill)
    if (source.colors) image = colorize(image, source.colors)
    await writePpm(path.join(work, `${name}-out.ppm`), image)
    const out = path.join('public', 'textures', `${name}.webp`)
    run('cwebp', [
      '-quiet',
      '-q',
      '78',
      path.join(work, `${name}-out.ppm`),
      '-o',
      out,
    ])
    console.log('만듦', out)
  }
} finally {
  await rm(work, { recursive: true, force: true })
}
