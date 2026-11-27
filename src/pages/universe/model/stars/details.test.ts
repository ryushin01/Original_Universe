import { STARS } from './catalog'
import { STAR_DETAILS } from './details'

describe('별 자료', () => {
  it('id가 겹치지 않고 위치·거리·등급·물리량이 물리적으로 말이 된다', () => {
    expect(new Set(STARS.map((s) => s.id)).size).toBe(STARS.length)
    for (const s of STARS) {
      expect(s.ra, s.id).toBeGreaterThanOrEqual(0)
      expect(s.ra, s.id).toBeLessThan(360)
      expect(Math.abs(s.dec), s.id).toBeLessThanOrEqual(90)
      expect(s.distanceLy, s.id).toBeGreaterThan(0)
      // 하늘에서 가장 밝은 별(시리우스 −1.46)보다 밝은 별은 없음
      expect(s.magnitude, s.id).toBeGreaterThanOrEqual(-1.46)
      expect(s.magnitude, s.id).toBeLessThan(20)
      expect(s.mass, s.id).toBeGreaterThan(0.07)
      expect(s.mass, s.id).toBeLessThan(200)
      expect(s.radius, s.id).toBeGreaterThan(0)
      expect(s.luminosity, s.id).toBeGreaterThan(0)
      expect(s.temperature, s.id).toBeGreaterThan(2000)
      expect(s.temperature, s.id).toBeLessThan(50_000)
    }
  })

  it('모든 별에 설명과 별자리가 있고, 설명은 목록에 있는 별만 가리킨다', () => {
    const ids = new Set(STARS.map((s) => s.id))
    for (const s of STARS) {
      expect(STAR_DETAILS[s.id], s.id).toBeDefined()
      expect(STAR_DETAILS[s.id].constellation.ko, s.id).toMatch(/자리$/)
    }
    for (const id of Object.keys(STAR_DETAILS))
      expect(ids.has(id), id).toBe(true)
  })

  it('요청한 이름난 별 20개가 모두 있다', () => {
    for (const id of [
      'sirius',
      'canopus',
      'alpha-centauri',
      'proxima',
      'arcturus',
      'vega',
      'capella',
      'rigel',
      'procyon',
      'betelgeuse',
      'altair',
      'aldebaran',
      'antares',
      'spica',
      'pollux',
      'fomalhaut',
      'deneb',
      'regulus',
      'polaris',
      'barnard',
    ])
      expect(
        STARS.some((s) => s.id === id),
        id,
      ).toBe(true)
  })

  it('견우·직녀 전승과 천랑성·대화성 같은 동양 이름이 붙는다', () => {
    expect(STAR_DETAILS.vega.lore?.ko).toMatch(/칠석/)
    expect(STAR_DETAILS.altair.lore?.ko).toMatch(/직녀/)
    expect(STAR_DETAILS.sirius.eastName?.ko).toMatch(/천랑성/)
    expect(STAR_DETAILS.antares.eastName?.ko).toMatch(/대화성/)
    expect(STAR_DETAILS.sirius.companion?.ko).toMatch(/백색 왜성/)
  })
})
