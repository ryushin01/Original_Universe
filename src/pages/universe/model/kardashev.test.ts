import { describe, expect, it } from 'vitest'
import {
  KARDASHEV_LANDMARKS,
  KARDASHEV_NOTES,
  KARDASHEV_TYPES,
  kardashevOf,
  nextType,
  powerAt,
  yearsToReach,
} from './kardashev'

describe('카르다쇼프 척도', () => {
  it('세이건 연속식: 1 MW가 0, 10¹⁶ W가 Ⅰ단계, 태양을 다 쓰면 약 2.06', () => {
    expect(kardashevOf(1e6)).toBe(0)
    expect(kardashevOf(1e16)).toBeCloseTo(1, 10)
    expect(kardashevOf(3.828e26)).toBeCloseTo(2.06, 2)
    expect(kardashevOf(1e4)).toBeCloseTo(-0.2, 10)
    expect(kardashevOf(0)).toBeNull()
    for (const p of [1e4, 2.075e13, 5e36])
      expect(powerAt(kardashevOf(p)!) / p).toBeCloseTo(1, 10)
  })

  it('0~Ⅵ단계가 있고, Ⅰ~Ⅲ단계에는 카르다쇼프의 원래 기준(1964)이 있다', () => {
    expect(KARDASHEV_TYPES.map((t) => t.level)).toEqual([0, 1, 2, 3, 4, 5, 6])
    const watts = KARDASHEV_TYPES.filter((t) => t.watts !== null).map(
      (t) => t.watts!,
    )
    expect(watts).toEqual([1e6, 1e16, 1e26, 1e36, 1e46])
    expect(
      KARDASHEV_TYPES.filter((t) => t.original).map((t) => t.level),
    ).toEqual([1, 2, 3])
    for (const t of KARDASHEV_TYPES) {
      expect(t.scope.ko.length, `${t.level}`).toBeGreaterThan(10)
      expect(t.examples.en.length, `${t.level}`).toBeGreaterThan(10)
    }
    expect(KARDASHEV_NOTES.length).toBeGreaterThanOrEqual(4)
  })

  it('기준점은 낮은 것부터이고, 2025년 인류는 약 0.73', () => {
    const ks = KARDASHEV_LANDMARKS.map((m) => m.k)
    expect([...ks].sort((a, b) => a - b)).toEqual(ks)
    // 2025년 1차 에너지 약 655 EJ ≈ 20.8 TW
    const today = kardashevOf(655e18 / (365.25 * 86400))!
    expect(today).toBeCloseTo(KARDASHEV_LANDMARKS.at(-1)!.k, 2)
  })

  it('다음 단계까지의 배수와 햇수', () => {
    const next = nextType(0.73)!
    expect(next.level).toBe(1)
    expect(next.factor).toBeCloseTo(10 ** 2.7, 0)
    expect(nextType(1.95)?.level).toBe(2)
    expect(nextType(4.2)).toBeNull()
    // 해마다 1.5%씩 늘면 500배까지 약 414년
    expect(yearsToReach(2e13, 1e16, 0.015)).toBeCloseTo(
      Math.log(500) / 0.015,
      6,
    )
    expect(yearsToReach(2e16, 1e16, 0.015)).toBe(0)
  })
})
