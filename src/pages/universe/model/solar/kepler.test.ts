import { distance, dot, length } from '@/shared/lib'
import type { Vec3 } from '@/shared/lib'
import {
  elementsFromState,
  meanMotion,
  orbitPoints,
  orbitalPeriodDays,
  positionFromElements,
  stateFromElements,
} from './kepler'
import type { Elements } from './kepler'

const earthLike: Elements = {
  a: 1,
  e: 0.0167,
  i: 0,
  node: 0,
  argPeri: 102.9,
  meanAnomaly: 0,
}

describe('케플러 궤도', () => {
  it('지구 궤도(1AU)의 공전 주기는 약 365.25일, 평균 운동은 약 0.9856°/일', () => {
    expect(orbitalPeriodDays(1)).toBeCloseTo(365.25, 0)
    expect(meanMotion(1)).toBeCloseTo(0.9856, 3)
  })

  it('궤도 점들은 근일점과 원일점 거리 사이에 있고 처음 점이 근일점이다', () => {
    const el: Elements = { ...earthLike, e: 0.2, i: 10, node: 30 }
    const points = orbitPoints(el, 64)
    expect(points).toHaveLength(64)
    const distances = points.map((p) => length(p))
    expect(Math.min(...distances)).toBeCloseTo(0.8, 6)
    expect(Math.max(...distances)).toBeCloseTo(1.2, 6)
    expect(distances[0]).toBeCloseTo(0.8, 6)
    // 평균 근점 이각 0이면 근일점이므로 궤도 첫 점과 같은 곳
    expect(distance(points[0], positionFromElements(el))).toBeLessThan(1e-9)
  })

  it('황도면 위 궤도(i = 0)도 위치·속도에서 같은 요소로 돌아온다', () => {
    const el: Elements = { ...earthLike, e: 0.1, meanAnomaly: 40 }
    const { r, v } = stateFromElements(el)
    const back = elementsFromState(r, v)
    expect(back.a).toBeCloseTo(1, 9)
    expect(back.e).toBeCloseTo(0.1, 9)
    expect(back.i).toBeCloseTo(0, 9)
    expect(back.node).toBe(0)
    expect(back.argPeri).toBeCloseTo(102.9, 6)
    expect(back.meanAnomaly).toBeCloseTo(40, 6)
  })

  it('거꾸로 도는 황도면 궤도는 근일점 경도를 반대로 잰다', () => {
    const r: Vec3 = [1, 0, 0]
    const v: Vec3 = [0, -0.019, 0]
    const back = elementsFromState(r, v)
    expect(back.i).toBeCloseTo(180, 6)
    expect(back.e).toBeGreaterThan(0)
  })

  it('원 궤도(e = 0)는 승교점에서 잰 위치각을 평균 근점 이각으로 쓴다', () => {
    const el: Elements = {
      a: 2,
      e: 0,
      i: 20,
      node: 50,
      argPeri: 0,
      meanAnomaly: 75,
    }
    const { r, v } = stateFromElements(el)
    const back = elementsFromState(r, v)
    expect(back.e).toBeLessThan(1e-9)
    expect(back.a).toBeCloseTo(2, 9)
    expect(back.i).toBeCloseTo(20, 6)
    expect(back.node).toBeCloseTo(50, 6)
    expect(back.argPeri).toBe(0)
    expect(back.meanAnomaly).toBeCloseTo(75, 6)
  })

  it('원 궤도의 반 바퀴 뒤쪽(위치각 > 180°)도 바르게 잰다', () => {
    const el: Elements = {
      a: 1,
      e: 0,
      i: 0,
      node: 0,
      argPeri: 0,
      meanAnomaly: -120,
    }
    const { r, v } = stateFromElements(el)
    expect(elementsFromState(r, v).meanAnomaly).toBeCloseTo(-120, 6)
    // 원 궤도는 속도가 위치에 수직
    expect(Math.abs(dot(r, v))).toBeLessThan(1e-12)
  })
})
