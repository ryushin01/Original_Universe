/**
 * 작은 천체 실제 모양 모델 만들기: `pnpm shapes <아포피스 OBJ> <핼리 TAB>`
 *
 * NASA PDS 자료실은 사람 확인 때문에 자동으로 받을 수 없어서, 브라우저로 받아 푼 파일을 넘깁니다.
 * - 아포피스: gbo.ast-apophis.jpl.radar.shape_model_v1.0 묶음의 `data/apophis_v233s7.obj`
 *   (레이더 모양 모델, 꼭짓점 2000·면 3996, km, DOI 10.26033/ydyq-5756)
 * - 핼리 혜성 핵: small_bodies.stooke.shape-models 묶음의 `data/1682q1halley.tab`
 *   (경도·위도 5° 간격 반지름 km, Stooke·Abergel, DOI 10.26033/yt84-5y91)
 *
 * 천체 고정 좌표(x: 경도 0°, y: 동경 90°, z: 북극)를 장면 좌표(x, z, −y)로 돌리고, 가장 먼 점이
 * 반지름 1이 되게 맞춰 16비트 정수로 줄인 뒤 base64로 `src/pages/universe/ui/scene/solar/shapeData.ts`에 씁니다.
 */
import { readFile, writeFile } from 'node:fs/promises'

const [objPath, tabPath] = process.argv.slice(2)
if (!objPath || !tabPath)
  throw new Error(
    '쓰는 법: pnpm shapes <apophis_v233s7.obj> <1682q1halley.tab>',
  )

/** OBJ의 v·f 줄 (면은 1부터 세는 번호, 삼각형만) */
async function readObj(file) {
  const vertices = []
  const faces = []
  for (const line of (await readFile(file, 'utf8')).split('\n')) {
    const [kind, ...rest] = line.trim().split(/\s+/)
    if (kind === 'v') vertices.push(rest.slice(0, 3).map(Number))
    else if (kind === 'f') {
      const ids = rest.map((t) => Number(t.split('/')[0]) - 1)
      if (ids.length !== 3) throw new Error(`삼각형이 아닌 면: ${line}`)
      faces.push(ids)
    }
  }
  return { vertices, faces }
}

/** 경도·위도 격자 반지름 표 → 극에 꼭짓점 하나씩 둔 삼각형 메시 */
async function readGrid(file) {
  const radius = new Map()
  for (const line of (await readFile(file, 'utf8')).split('\n')) {
    const [lon, lat, r] = line.trim().split(/\s+/).map(Number)
    if (Number.isFinite(r)) radius.set(`${lon % 360},${lat}`, r)
  }
  const lons = Array.from({ length: 72 }, (_, i) => i * 5)
  const lats = Array.from({ length: 35 }, (_, i) => -85 + i * 5)
  const at = (lon, lat) => {
    const r = radius.get(`${lon},${lat}`)
    if (r === undefined) throw new Error(`반지름 없음: ${lon}, ${lat}`)
    const a = (lon * Math.PI) / 180
    const b = (lat * Math.PI) / 180
    return [
      r * Math.cos(b) * Math.cos(a),
      r * Math.cos(b) * Math.sin(a),
      r * Math.sin(b),
    ]
  }
  const vertices = [at(0, -90)]
  for (const lat of lats) for (const lon of lons) vertices.push(at(lon, lat))
  vertices.push(at(0, 90))
  const south = 0
  const north = vertices.length - 1
  const id = (row, col) => 1 + row * 72 + (col % 72)
  const faces = []
  for (let c = 0; c < 72; c++) faces.push([south, id(0, c + 1), id(0, c)])
  for (let r = 0; r < lats.length - 1; r++)
    for (let c = 0; c < 72; c++) {
      faces.push([id(r, c), id(r, c + 1), id(r + 1, c + 1)])
      faces.push([id(r, c), id(r + 1, c + 1), id(r + 1, c)])
    }
  const top = lats.length - 1
  for (let c = 0; c < 72; c++) faces.push([north, id(top, c), id(top, c + 1)])
  return { vertices, faces }
}

/** 장면 좌표로 돌려 가장 먼 점을 1로 맞추고 16비트로 줄임 */
function pack({ vertices, faces }) {
  const far = Math.max(...vertices.map((v) => Math.hypot(...v)))
  const positions = new Int16Array(vertices.length * 3)
  vertices.forEach(([x, y, z], i) => {
    positions[3 * i] = Math.round((x / far) * 32767)
    positions[3 * i + 1] = Math.round((z / far) * 32767)
    positions[3 * i + 2] = Math.round((-y / far) * 32767)
  })
  const indices = Uint16Array.from(faces.flat())
  return {
    positions: Buffer.from(positions.buffer).toString('base64'),
    indices: Buffer.from(indices.buffer).toString('base64'),
    sizeKm: Math.round(far * 2 * 1000) / 1000,
  }
}

const apophis = pack(await readObj(objPath))
const halley = pack(await readGrid(tabPath))
const out = `/**
 * 작은 천체의 실제 모양 모델 (\`pnpm shapes\`가 만든 파일, 손으로 고치지 않음).
 * 장면 좌표(x: 경도 0°, y: 북극, z: 서경 90°)이고 가장 먼 점이 1인 16비트 정수 꼭짓점과 삼각형 번호를 base64로 담음.
 * - 아포피스: NASA PDS 레이더 모양 모델 (Brozović 외 2018, Lawrence·Benner, DOI 10.26033/ydyq-5756)
 * - 핼리 혜성 핵: Giotto·Vega 영상으로 만든 Stooke·Abergel 모양 모델 (DOI 10.26033/yt84-5y91)
 */
export interface PackedShape {
  positions: string
  indices: string
  /** 가장 먼 두 점 사이 거리의 어림 (km, 가장 먼 점 반지름 × 2) */
  sizeKm: number
}

export const SHAPE_DATA: Record<'apophis' | 'halley', PackedShape> = ${JSON.stringify({ apophis, halley }, null, 2)}
`
await writeFile('src/pages/universe/ui/scene/solar/shapeData.ts', out)
console.log(
  `만듦 shapeData.ts: 아포피스 ${apophis.sizeKm} km, 핼리 ${halley.sizeKm} km`,
)
