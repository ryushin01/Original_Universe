import { GALAXY_OBJECTS } from './catalog'
import { GALAXY_DETAILS } from './details'

const exploded = GALAXY_OBJECTS.filter((o) => o.outburst)

describe('신성·초신성', () => {
  it('폭발 기록은 1000년 이후 지금까지, 해는 오름차순, 밝기는 맨눈 범위 안팎이다', () => {
    expect(exploded.length).toBeGreaterThanOrEqual(11)
    for (const o of exploded) {
      const { years, peakMag } = o.outburst!
      expect(years.length, o.id).toBeGreaterThan(0)
      for (const year of years) {
        expect(year, o.id).toBeGreaterThanOrEqual(1000)
        expect(year, o.id).toBeLessThanOrEqual(2026)
      }
      expect(
        [...years].sort((a, b) => a - b),
        o.id,
      ).toEqual(years)
      if (peakMag !== undefined) {
        // 기록상 가장 밝은 SN 1006(약 −7.5)보다 밝을 수 없음
        expect(peakMag, o.id).toBeGreaterThanOrEqual(-7.5)
        expect(peakMag, o.id).toBeLessThan(12)
      }
    }
  })

  it('초신성은 잔해 구름으로, 신성은 별로 그린다', () => {
    for (const o of exploded) {
      if (o.outburst!.type.startsWith('sn')) {
        expect(o.kind, o.id).toBe('remnant')
        expect(o.look, o.id).toBe('remnant')
      } else expect(o.kind, o.id).toBe('nova')
    }
  })

  it('반복 신성만 여러 번 터진다', () => {
    for (const o of exploded)
      if (o.outburst!.years.length > 1)
        expect(o.outburst!.type, o.id).toBe('recurrentNova')
  })

  it('게 성운은 SN 1054의 잔해로 하나만 있다', () => {
    const crab = GALAXY_OBJECTS.filter((o) => o.outburst?.years.includes(1054))
    expect(crab.map((o) => o.id)).toEqual(['crab'])
  })

  it('모든 천체의 위치·거리가 하늘 좌표 범위 안이고 id가 겹치지 않는다', () => {
    expect(new Set(GALAXY_OBJECTS.map((o) => o.id)).size).toBe(
      GALAXY_OBJECTS.length,
    )
    for (const o of GALAXY_OBJECTS) {
      if (o.id === 'sun') continue
      expect(o.ra, o.id).toBeGreaterThanOrEqual(0)
      expect(o.ra, o.id).toBeLessThan(360)
      expect(Math.abs(o.dec!), o.id).toBeLessThanOrEqual(90)
      expect(o.distanceLy, o.id).toBeGreaterThan(0)
    }
  })

  it('덧붙임 설명은 목록에 있는 천체만 가리킨다', () => {
    const ids = new Set(GALAXY_OBJECTS.map((o) => o.id))
    for (const id of Object.keys(GALAXY_DETAILS))
      expect(ids.has(id), id).toBe(true)
  })
})
