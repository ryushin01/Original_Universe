import { describe, expect, it } from 'vitest'
import type { BufferAttribute } from 'three'
import { SHAPES, makeShapeGeometry } from './shapes'

const radii = (pos: BufferAttribute) =>
  Array.from({ length: pos.count }, (_, i) =>
    Math.hypot(pos.getX(i), pos.getY(i), pos.getZ(i)),
  )

describe('작은 천체의 울퉁불퉁한 모양', () => {
  it('핼리 혜성 핵과 아포피스에 모양이 있다', () => {
    expect(Object.keys(SHAPES).sort()).toEqual(['apophis', 'halley'])
  })

  for (const [id, spec] of Object.entries(SHAPES)) {
    it(`${id}: 시드가 같으면 모양이 같고, 가장 먼 점이 반지름 1이다`, () => {
      const a = makeShapeGeometry(spec!, 32)
      const b = makeShapeGeometry(spec!, 32)
      const pa = a.getAttribute('position') as BufferAttribute
      const pb = b.getAttribute('position') as BufferAttribute
      expect(Array.from(pa.array)).toEqual(Array.from(pb.array))
      const r = radii(pa)
      expect(Math.max(...r)).toBeCloseTo(1, 6)
      // 잘록한 허리도 뭉개지지 않음 (짧은 축 0.5 × 허리)
      expect(Math.min(...r)).toBeGreaterThan(0.2)
      // 꼭짓점을 합쳐 이음매 없이 매끈한 법선
      expect(a.index).not.toBeNull()
      const n = a.getAttribute('normal') as BufferAttribute
      for (let i = 0; i < n.count; i++) {
        const l = Math.hypot(n.getX(i), n.getY(i), n.getZ(i))
        expect(l).toBeCloseTo(1, 4)
      }
    })
  }

  it('핼리 혜성 핵은 길쭉하고 허리가 잘록한 땅콩 모양이다', () => {
    const g = makeShapeGeometry(SHAPES.halley!, 48)
    g.computeBoundingBox()
    const box = g.boundingBox!
    const length = box.max.x - box.min.x
    const width = box.max.y - box.min.y
    expect(length / width).toBeGreaterThan(1.5)
    // 가운데 단면이 두 덩이의 단면보다 가늚
    const pos = g.getAttribute('position') as BufferAttribute
    const girth = (x0: number) => {
      let r = 0
      for (let i = 0; i < pos.count; i++)
        if (Math.abs(pos.getX(i) - x0) < 0.06)
          r = Math.max(r, Math.hypot(pos.getY(i), pos.getZ(i)))
      return r
    }
    const lobe = Math.min(girth(box.min.x * 0.5), girth(box.max.x * 0.5))
    expect(girth(0)).toBeLessThan(lobe)
  })
})
