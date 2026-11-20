import { describe, expect, it } from 'vitest'
import { MODEL_IDS, MODELS } from './models'

/** 저장소 파일 읽기 (tsconfig에 node 타입을 넣지 않으므로 런타임 내장 모듈을 씀) */
const fs = (
  globalThis as unknown as {
    process: {
      getBuiltinModule(id: 'node:fs'): {
        readFileSync(path: string, encoding: 'utf8'): string
        readdirSync(path: string): string[]
      }
    }
  }
).process.getBuiltinModule('node:fs')

interface Source {
  id: string
  title: string
  author: string
  licence: string
  page: string
  file: string
}

const { models: sources } = JSON.parse(
  fs.readFileSync('scripts/models/sources.json', 'utf8'),
) as { models: Source[] }

describe('우주적 존재 3D 모델', () => {
  it('원본 목록·장면의 모델 표·public/models 파일이 서로 맞다', () => {
    const ids = sources.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual([...MODEL_IDS].sort())
    for (const id of MODEL_IDS) expect(MODELS[id], id).toBeDefined()
    const files = fs
      .readdirSync('public/models')
      .filter((name) => name.endsWith('.glb'))
    expect(files.sort()).toEqual(ids.map((id) => `${id}.glb`).sort())
  })

  it('모델마다 저작자·사용 허락·원본 주소가 있다', () => {
    for (const s of sources) {
      expect(s.title.trim(), s.id).not.toBe('')
      expect(s.author.trim(), s.id).not.toBe('')
      expect(['CC0 1.0', 'CC BY 3.0'], s.id).toContain(s.licence)
      expect(s.page, s.id).toMatch(/^https:\/\/poly\.pizza\/m\/\w+$/)
      expect(s.file, s.id).toMatch(/^https:\/\/static\.poly\.pizza\/.+\.glb$/)
    }
  })

  it('데이터 출처 문서에 모델마다 제목·저작자·원본을 밝힌다 (CC BY 표시)', () => {
    const doc = fs.readFileSync('docs/data-sources.md', 'utf8')
    for (const s of sources) {
      const row = doc.split('\n').find((line) => line.includes(s.page))
      expect(row, s.id).toBeDefined()
      expect(row, s.id).toContain(s.title)
      expect(row, s.id).toContain(s.author)
      expect(row, s.id).toContain(s.licence)
    }
  })

  it('README 출처 표에 저작자를 모두 적는다', () => {
    const readme = fs.readFileSync('README.md', 'utf8')
    for (const author of new Set(sources.map((s) => s.author)))
      expect(readme, author).toContain(author)
  })
})
