import { describe, expect, it } from 'vitest'
import { moveStorageKey } from './storage'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

describe('moveStorageKey', () => {
  it('옛 키의 값을 새 키로 옮기고 옛 키를 지운다', () => {
    const storage = memoryStorage({ old: 'saves' })
    moveStorageKey(storage, 'old', 'new')
    expect(Object.fromEntries(storage.data)).toEqual({ new: 'saves' })
  })

  it('새 키에 값이 있으면 새 값을 두고 옛 키만 지운다', () => {
    const storage = memoryStorage({ old: 'ko', new: 'en' })
    moveStorageKey(storage, 'old', 'new')
    expect(Object.fromEntries(storage.data)).toEqual({ new: 'en' })
  })

  it('옛 키가 없으면 아무것도 바꾸지 않는다', () => {
    const storage = memoryStorage({ new: 'en' })
    moveStorageKey(storage, 'old', 'new')
    expect(Object.fromEntries(storage.data)).toEqual({ new: 'en' })
  })

  it('새 키에 쓰지 못하면 옛 값을 지우지 않는다', () => {
    const storage = memoryStorage({ old: 'saves' })
    storage.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    moveStorageKey(storage, 'old', 'new')
    expect(Object.fromEntries(storage.data)).toEqual({ old: 'saves' })
  })
})
