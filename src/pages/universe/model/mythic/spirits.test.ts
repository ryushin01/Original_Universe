import { describe, expect, it } from 'vitest'
import { BEINGS, GROUP_NAME } from './catalog'
import { LORE } from './lore'

describe('영수', () => {
  it('영수 12종은 전승 설명이 있고, 다른 묶음의 존재와 이름이 겹치지 않는다', () => {
    const spirits = BEINGS.filter((b) => b.group === 'spirit')
    expect(spirits).toHaveLength(12)
    expect(GROUP_NAME.spirit.ko).toBe('영수')
    for (const b of spirits) {
      expect(b.faction, b.id).toBe('spirit')
      expect(LORE[b.id]?.ko, b.id).toBeTruthy()
    }
    const names = BEINGS.map((b) => b.name.ko)
    expect(new Set(names).size).toBe(names.length)
    expect(BEINGS).toHaveLength(94)
  })
})
