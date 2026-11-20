import { describe, expect, it } from 'vitest'
import { BODIES, BODY_IDS } from '../../../model/solar/bodies'

/** 저장소 파일 읽기 (tsconfig에 node 타입을 넣지 않으므로 런타임 내장 모듈을 씀) */
const fs = (
  globalThis as unknown as {
    process: {
      getBuiltinModule(id: 'node:fs'): {
        readFileSync(path: string): Uint8Array
        readFileSync(path: string, encoding: 'utf8'): string
        readdirSync(path: string): string[]
      }
    }
  }
).process.getBuiltinModule('node:fs')

const ascii = (b: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...b.subarray(from, to))
const u16 = (b: Uint8Array, at: number) => b[at]! | (b[at + 1]! << 8)
const u24 = (b: Uint8Array, at: number) => u16(b, at) | (b[at + 2]! << 16)

/** WebP 머리말에서 가로·세로 (손실·무손실·확장 형식) */
function webpSize(b: Uint8Array): [number, number] {
  expect(ascii(b, 0, 4)).toBe('RIFF')
  expect(ascii(b, 8, 12)).toBe('WEBP')
  const chunk = ascii(b, 12, 16)
  if (chunk === 'VP8 ') return [u16(b, 26) & 0x3fff, u16(b, 28) & 0x3fff]
  if (chunk === 'VP8L') {
    const bits = u16(b, 21) | (u16(b, 23) << 16)
    return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1]
  }
  if (chunk === 'VP8X') return [u24(b, 24) + 1, u24(b, 27) + 1]
  throw new Error(`알 수 없는 WebP 형식: ${chunk}`)
}

const textured = BODY_IDS.filter((id) => BODIES[id].texture)

describe('천체 텍스처', () => {
  it('태양·세레스·갈릴레이 위성·타이탄·명왕성에도 텍스처가 있다', () => {
    for (const id of [
      'sun',
      'ceres',
      'io',
      'europa',
      'ganymede',
      'callisto',
      'titan',
      'pluto',
    ] as const)
      expect(BODIES[id].texture, id).toBe(id)
    // 모양 모델로 그리는 핼리 혜성·아포피스만 텍스처 없이 잡음으로 칠함
    expect(BODY_IDS.filter((id) => !BODIES[id].texture).sort()).toEqual([
      'apophis',
      'halley',
    ])
  })

  it('텍스처 파일이 있고 경위도 지도(가로:세로 2:1)이며 1024~2048px이다', () => {
    for (const id of textured) {
      const name = id === 'earth' ? 'earth-albedo' : BODIES[id].texture!
      const [w, h] = webpSize(fs.readFileSync(`public/textures/${name}.webp`))
      expect(w, name).toBe(h * 2)
      expect(w, name).toBeGreaterThanOrEqual(1024)
      expect(w, name).toBeLessThanOrEqual(2048)
    }
  })

  it('모든 텍스처 파일의 출처가 문서에 적혀 있다', () => {
    const doc = fs.readFileSync('docs/data-sources.md', 'utf8')
    const names = fs
      .readdirSync('public/textures')
      .filter((f) => f.endsWith('.webp'))
      .map((f) => f.replace(/(-1024)?\.webp$/, ''))
    for (const name of new Set(names))
      expect(doc.includes(`\`${name}\``), name).toBe(true)
  })
})
