import { describe, expect, it, vi } from 'vitest'

/** 받기를 시험에서 직접 끝내도록 텍스처 불러오기를 바꿔 끼움 */
const { pending, started } = vi.hoisted(() => ({
  pending: new Map<
    string,
    { resolve: (value: unknown) => void; reject: (error: unknown) => void }
  >(),
  started: [] as string[],
}))

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()
  class FakeImageBitmapLoader {
    setOptions() {
      return this
    }
    loadAsync(url: string) {
      started.push(url)
      return new Promise((resolve, reject) =>
        pending.set(url, { resolve, reject }),
      )
    }
  }
  return { ...actual, ImageBitmapLoader: FakeImageBitmapLoader }
})

const tick = () => new Promise((resolve) => setTimeout(resolve, 5))

describe('텍스처 받는 순서', () => {
  it('덜 급한 텍스처는 먼저 받던 텍스처가 다 끝난(실패 포함) 뒤 받고, 불러오기 진행에 넣지 않는다', async () => {
    const { loadTexture, loadTextureLater, onTextureProgress } =
      await import('./common')
    const progress: Array<[number, number]> = []
    onTextureProgress((loaded, total) => progress.push([loaded, total]))

    const a = loadTexture('a.webp')
    const later = loadTextureLater('io.webp')
    // 장면을 만드는 동안 뒤이어 시작한 텍스처까지 기다림
    const b = loadTexture('b.webp')
    await tick()
    expect(started).toEqual(['a.webp', 'b.webp'])

    pending.get('a.webp')!.resolve({})
    await a
    await tick()
    expect(started).toEqual(['a.webp', 'b.webp'])

    pending.get('b.webp')!.reject(new Error('404'))
    await b.catch(() => {})
    await tick()
    expect(started).toEqual(['a.webp', 'b.webp', 'io.webp'])

    pending.get('io.webp')!.resolve({})
    await expect(later).resolves.toBeDefined()
    expect(progress.at(-1)).toEqual([2, 2])
    onTextureProgress(null)
  })
})
