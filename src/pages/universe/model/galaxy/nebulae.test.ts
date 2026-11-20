import { describe, expect, it } from 'vitest'
import { GALAXY_OBJECTS } from './catalog'

describe('성운', () => {
  it('성운·초신성 잔해마다 3D 구름 빛깔과 하늘 위치·거리가 있다', () => {
    const clouds = GALAXY_OBJECTS.filter(
      (o) => o.kind === 'nebula' || o.kind === 'remnant',
    )
    expect(clouds.length).toBeGreaterThanOrEqual(15)
    for (const o of clouds) {
      expect(o.look, o.id).toBeDefined()
      expect(o.ra, o.id).toBeGreaterThanOrEqual(0)
      expect(o.ra, o.id).toBeLessThan(360)
      expect(Math.abs(o.dec!), o.id).toBeLessThanOrEqual(90)
      expect(o.distanceLy, o.id).toBeGreaterThan(0)
    }
  })
})
