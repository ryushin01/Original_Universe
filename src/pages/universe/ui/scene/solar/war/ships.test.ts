import { describe, expect, it } from 'vitest'
import { FACTIONS, SHIP_CLASSES } from '../../../../model/war/catalog'
import type { ShipClassId } from '../../../../model/war/catalog'
import { MODEL_IDS } from '../beings/models'
import { buildShip, lookOf } from './ships'
import type { BuildId } from './ships'

const BUILDS: BuildId[] = [
  'battleship',
  'carrier',
  'dreadnought',
  'station',
  'fortress',
  'bioship',
]

describe('우주 대전 함선 모양', () => {
  it('계산으로 짓는 함선은 반지름 1 안의 유한한 삼각형 도형이다', () => {
    for (const id of BUILDS) {
      const g = buildShip(id)
      const p = g.getAttribute('position')
      expect(p.count % 3, id).toBe(0)
      expect(p.count, id).toBeGreaterThan(30)
      for (let i = 0; i < p.count; i++) {
        const r = Math.hypot(p.getX(i), p.getY(i), p.getZ(i))
        expect(Number.isFinite(r), id).toBe(true)
        expect(r, id).toBeLessThanOrEqual(1.0001)
      }
      g.dispose()
    }
  })

  it('세력·함급마다 있는 모델이나 지을 함선을 가리킨다', () => {
    for (const faction of FACTIONS)
      for (const cls of Object.keys(SHIP_CLASSES) as ShipClassId[]) {
        const look = lookOf(faction.id, cls)
        if ('model' in look)
          expect(MODEL_IDS, `${faction.id}/${cls}`).toContain(look.model)
        else expect(BUILDS, `${faction.id}/${cls}`).toContain(look.build)
      }
  })
})
