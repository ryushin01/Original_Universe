import { BufferAttribute, BufferGeometry, Line, Vector3 } from 'three'
import { setLine } from './common'

const points = (n: number, x = 0) =>
  Array.from({ length: n }, (_, i) => new Vector3(i + x, 0, 0))

describe('선 갱신', () => {
  it('점 수가 같으면 버퍼를 새로 만들지 않고 값만 고쳐 쓴다', () => {
    const line = new Line(new BufferGeometry())
    setLine(line, points(4))
    const geometry = line.geometry
    const attribute = geometry.getAttribute('position') as BufferAttribute
    const version = attribute.version
    setLine(line, points(4, 10))
    expect(line.geometry).toBe(geometry)
    expect(line.geometry.getAttribute('position')).toBe(attribute)
    expect(attribute.version).toBeGreaterThan(version)
    expect(attribute.getX(0)).toBe(10)
    // 화면 밖 판정이 새 위치를 따름
    expect(line.geometry.boundingSphere!.center.x).toBeCloseTo(11.5)
  })

  it('점 수가 바뀌면 새 버퍼를 만든다', () => {
    const line = new Line(new BufferGeometry())
    setLine(line, points(4))
    const geometry = line.geometry
    setLine(line, points(6))
    expect(line.geometry).not.toBe(geometry)
    expect(line.geometry.getAttribute('position').count).toBe(6)
  })
})
