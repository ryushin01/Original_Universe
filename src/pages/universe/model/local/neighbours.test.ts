import { LOCAL_GALAXIES } from './catalog'
import { LOCAL_DETAILS } from './details'

describe('국부 은하군과 이웃 은하', () => {
  it('위치·거리·크기가 범위 안이고 id가 겹치지 않는다', () => {
    expect(new Set(LOCAL_GALAXIES.map((g) => g.id)).size).toBe(
      LOCAL_GALAXIES.length,
    )
    for (const g of LOCAL_GALAXIES) {
      expect(g.ra, g.id).toBeGreaterThanOrEqual(0)
      expect(g.ra, g.id).toBeLessThan(360)
      expect(Math.abs(g.dec), g.id).toBeLessThanOrEqual(90)
      expect(g.distanceLy, g.id).toBeGreaterThan(0)
      expect(g.diameterLy, g.id).toBeGreaterThan(0)
    }
  })

  it('국부 은하군(지름 약 1천만 광년) 밖 은하만 이웃 은하로 표시한다', () => {
    for (const g of LOCAL_GALAXIES)
      expect(Boolean(g.outside), g.id).toBe(g.distanceLy > 5_000_000)
    expect(
      LOCAL_GALAXIES.filter((g) => g.outside)
        .map((g) => g.id)
        .sort(),
    ).toEqual(['centaurus-a', 'm87', 'pinwheel', 'sombrero', 'whirlpool'])
  })

  it('덧붙임 설명은 목록에 있는 은하만 가리킨다', () => {
    const ids = new Set(LOCAL_GALAXIES.map((g) => g.id))
    for (const id of Object.keys(LOCAL_DETAILS))
      expect(ids.has(id), id).toBe(true)
  })
})
