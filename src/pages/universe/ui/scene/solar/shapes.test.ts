import { describe, expect, it } from 'vitest'
import type { BufferAttribute } from 'three'
import { SHAPES, decodeShape, makeShapeGeometry } from './shapes'
import { SHAPE_DATA } from './shapeData'

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

  it('실제 모양 모델: 아포피스(꼭짓점 2000·면 3996)와 핼리 핵을 바깥을 보는 메시로 푼다', () => {
    const apophis = decodeShape(SHAPE_DATA.apophis)
    expect(apophis.getAttribute('position').count).toBe(2000)
    expect(apophis.index!.count).toBe(3996 * 3)
    for (const [id, packed] of Object.entries(SHAPE_DATA)) {
      const g = decodeShape(packed)
      const pos = g.getAttribute('position') as BufferAttribute
      expect(Math.max(...radii(pos)), id).toBeCloseTo(1, 3)
      // 법선이 대체로 바깥(꼭짓점 방향)을 봄
      const n = g.getAttribute('normal') as BufferAttribute
      let outward = 0
      for (let i = 0; i < pos.count; i++)
        if (
          n.getX(i) * pos.getX(i) +
            n.getY(i) * pos.getY(i) +
            n.getZ(i) * pos.getZ(i) >
          0
        )
          outward++
      expect(outward / pos.count, id).toBeGreaterThan(0.9)
    }
    // 알려진 크기: 아포피스 약 0.34~0.45 km, 핼리 핵 약 15 km로 길쭉함
    expect(SHAPE_DATA.apophis.sizeKm).toBeGreaterThan(0.3)
    expect(SHAPE_DATA.apophis.sizeKm).toBeLessThan(0.5)
    expect(SHAPE_DATA.halley.sizeKm).toBeGreaterThan(14)
    const halley = decodeShape(SHAPE_DATA.halley)
    halley.computeBoundingBox()
    const size = halley.boundingBox!.getSize(halley.boundingBox!.min.clone())
    const [long, , short] = [size.x, size.y, size.z].sort((a, b) => b - a)
    expect(long / short).toBeGreaterThan(1.5)
  })
})
