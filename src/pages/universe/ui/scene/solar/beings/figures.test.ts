import { BEINGS } from '../../../../model/mythic/catalog'
import { drawBeing } from './figures'

describe('우주적 존재의 모습', () => {
  it('모든 존재를 유한한 좌표로 그리고, 움직여도 획 수가 그대로다', () => {
    for (const being of BEINGS) {
      const shape = being.shape ?? {}
      const first = drawBeing(being.form, shape, 0.3)
      const later = drawBeing(being.form, shape, 1.1)
      const strokes = first.strokes.length
      // 떼·구름은 획 없이 입자만, 나머지는 획이 있어야 함
      if (!first.cloud) expect(strokes, being.id).toBeGreaterThan(0)
      // 천 개의 얼굴(니알라토텝)만 시간에 따라 모습이 바뀜
      if (being.form !== 'masks')
        expect(later.strokes.length, being.id).toBe(strokes)
      for (const s of [...first.strokes, ...later.strokes]) {
        expect(s.length % 3, being.id).toBe(0)
        for (const v of s) {
          expect(Number.isFinite(v), being.id).toBe(true)
          expect(Math.abs(v), being.id).toBeLessThan(2)
        }
      }
      expect(first.stars.length % 4, being.id).toBe(0)
    }
  })
})
