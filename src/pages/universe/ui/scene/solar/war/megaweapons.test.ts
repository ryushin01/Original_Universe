import { describe, expect, it } from 'vitest'
import { MEGAWEAPONS, MEGAWEAPON_IDS } from '../../../../model/war/catalog'
import { buildMegaweapon, megaweaponShape } from './megaweapons'

describe('대형 병기 3D 꼴', () => {
  it('병기마다 다른 꼴이 있다', () => {
    const forms = MEGAWEAPON_IDS.map((id) => MEGAWEAPONS[id].form)
    expect(new Set(forms).size).toBe(MEGAWEAPON_IDS.length)
  })

  for (const id of MEGAWEAPON_IDS) {
    const form = MEGAWEAPONS[id].form
    it(`${id}(${form}): 반지름 1 안에 들고, 쏘는 자리와 핵도 그 안에 있다`, () => {
      const shape = buildMegaweapon(form)
      const position = shape.geometry.getAttribute('position')
      expect(position.count).toBeGreaterThan(30)
      expect(shape.geometry.boundingSphere!.radius).toBeLessThanOrEqual(1.01)
      expect(shape.muzzle.length()).toBeLessThanOrEqual(1.01)
      expect(shape.core.length()).toBeLessThanOrEqual(1.01)
      expect(shape.coreSize).toBeGreaterThan(0)
      for (let i = 0; i < position.count; i++)
        expect(Number.isFinite(position.getX(i))).toBe(true)
    })
  }

  it('같은 꼴은 한 번만 지어 함께 씀', () => {
    expect(megaweaponShape('warden')).toBe(megaweaponShape('warden'))
  })
})
