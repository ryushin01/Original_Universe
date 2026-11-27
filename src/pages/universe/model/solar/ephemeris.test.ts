import {
  DEG,
  dateToYear,
  distance,
  dot,
  length,
  sub,
  wrap180,
  yearToJd,
} from '@/shared/lib'
import type { Vec3 } from '@/shared/lib'
import {
  bodyAxes,
  eclipticLongitude,
  equatorAxes,
  heliocentricPosition,
  satelliteOffsetKm,
  secularElements,
} from './ephemeris'
import { BODIES } from './bodies'
import { elementsFromState, stateFromElements } from './kepler'

const jdOf = (iso: string) => yearToJd(dateToYear(new Date(iso)))
const pos = (id: Parameters<typeof heliocentricPosition>[0], iso: string) =>
  heliocentricPosition(id, jdOf(iso)) as Vec3

describe('행성 위치 (JPL 근사 궤도 요소)', () => {
  it('J2000의 지구는 근일점 근처, 황경 약 100°에 있다', () => {
    const earth = pos('earth', '2000-01-01T12:00:00Z')
    expect(length(earth)).toBeCloseTo(0.9833, 3)
    expect(eclipticLongitude(earth)).toBeCloseTo(100.4, 0)
  })

  it.each([
    ['mars', '2025-01-16T00:00:00Z'],
    ['jupiter', '2026-01-10T00:00:00Z'],
    ['saturn', '2025-09-21T00:00:00Z'],
  ] as const)('%s 충(%s)에는 지구와 황경이 같다', (id, iso) => {
    const diff = wrap180(
      eclipticLongitude(pos(id, iso)) - eclipticLongitude(pos('earth', iso)),
    )
    expect(Math.abs(diff)).toBeLessThan(2)
  })

  it('수성은 근일점 0.307 AU, 원일점 0.467 AU 사이에 있다', () => {
    const el = secularElements(
      BODIES.mercury.orbit.type === 'secular'
        ? BODIES.mercury.orbit.row
        : (null as never),
      0.26,
    )
    expect(el.a * (1 - el.e)).toBeCloseTo(0.3075, 3)
    expect(el.a * (1 + el.e)).toBeCloseTo(0.4667, 3)
  })
})

describe('소천체', () => {
  it('아포피스는 2029년 4월 13일 지구 가까이를 지난다', () => {
    let closest = Infinity
    let when = 0
    const start = jdOf('2029-04-10T00:00:00Z')
    for (let k = 0; k < 24 * 7; k++) {
      const jd = start + k / 24
      const d = distance(
        heliocentricPosition('apophis', jd) as Vec3,
        heliocentricPosition('earth', jd) as Vec3,
      )
      if (d < closest) {
        closest = d
        when = jd
      }
    }
    // 실제 최근접: 약 3만 8천 km (0.00025 AU), 2029-04-13 21:46 UTC
    expect(closest).toBeLessThan(0.002)
    expect(Math.abs(when - jdOf('2029-04-13T21:46:00Z'))).toBeLessThan(1)
  })

  it('핼리 혜성은 2023년 말 원일점(약 35 AU), 2061년 7월 근일점(약 0.59 AU)', () => {
    expect(length(pos('halley', '2023-12-09T00:00:00Z'))).toBeGreaterThan(34.5)
    expect(length(pos('halley', '2061-07-28T00:00:00Z'))).toBeLessThan(0.62)
  })
})

describe('달', () => {
  it('2024년 1월 25일 보름달에는 달이 태양 반대편에 있다', () => {
    const jd = jdOf('2024-01-25T17:54:00Z')
    const earth = heliocentricPosition('earth', jd) as Vec3
    const moon = satelliteOffsetKm('moon', jd)
    // 지구에서 본 태양 방향은 −earth, 보름달이면 달은 +earth 쪽
    const elongation = wrap180(
      eclipticLongitude(moon) - eclipticLongitude(earth),
    )
    expect(Math.abs(elongation)).toBeLessThan(6)
    expect(length(moon)).toBeGreaterThan(356_000)
    expect(length(moon)).toBeLessThan(407_000)
  })
})

describe('궤도 요소 ↔ 위치·속도', () => {
  it('왕복 변환해도 같은 궤도 요소가 나온다', () => {
    const el = {
      a: 1.52,
      e: 0.093,
      i: 1.85,
      node: 49.6,
      argPeri: 286.5,
      meanAnomaly: 19.4,
    }
    const { r, v } = stateFromElements(el)
    const back = elementsFromState(r, v)
    expect(back.a).toBeCloseTo(el.a, 8)
    expect(back.e).toBeCloseTo(el.e, 8)
    expect(back.i).toBeCloseTo(el.i, 6)
    expect(back.node).toBeCloseTo(el.node, 6)
    expect(back.argPeri).toBeCloseTo(el.argPeri, 6)
    expect(back.meanAnomaly).toBeCloseTo(el.meanAnomaly, 6)
  })

  it('탈출 속도를 넘으면 묶이지 않은 궤도로 본다', () => {
    const r: Vec3 = [1, 0, 0]
    const v: Vec3 = [0, 0.03, 0] // 탈출 속도(0.0243 AU/일)보다 빠름
    expect(elementsFromState(r, v).e).toBeGreaterThanOrEqual(1)
    expect(length(sub(r, r))).toBe(0)
  })
})

describe('궤도를 바꾼 천체와 태양 질량', () => {
  const T0 = jdOf('2030-01-01T00:00:00Z')

  it('태양은 원점, 위성은 태양 기준 궤도가 없다', () => {
    expect(heliocentricPosition('sun', T0)).toEqual([0, 0, 0])
    expect(heliocentricPosition('moon', T0)).toBeNull()
    expect(heliocentricPosition('io', T0)).toBeNull()
  })

  it('N체 계산 뒤의 궤도 요소가 있으면 그 궤도를 따라 돈다', () => {
    const override = {
      elements: { a: 2, e: 0, i: 0, node: 0, argPeri: 0, meanAnomaly: 0 },
      epochJd: T0,
      sunMass: 1,
    }
    const start = heliocentricPosition('earth', T0, 1, override) as Vec3
    expect(start[0]).toBeCloseTo(2, 9)
    // 2AU 원 궤도는 한 바퀴 약 1033일: 4분의 1 바퀴 뒤 y축 위
    const quarter = heliocentricPosition(
      'earth',
      T0 + 365.25 * 2 ** 1.5 * 0.25,
      1,
      override,
    ) as Vec3
    expect(quarter[0]).toBeCloseTo(0, 1)
    expect(quarter[1]).toBeCloseTo(2, 1)
  })

  it('태양이 질량을 잃으면 궤도가 그 비율만큼 넓어진다', () => {
    const normal = length(heliocentricPosition('mars', T0) as Vec3)
    const lighter = length(heliocentricPosition('mars', T0, 0.5) as Vec3)
    expect(lighter / normal).toBeCloseTo(2, 9)
  })
})

describe('위성 위치와 자전축', () => {
  const T0 = jdOf('2030-01-01T00:00:00Z')

  it('달은 지구에서 약 36만~41만km에 있다', () => {
    const km = length(satelliteOffsetKm('moon', T0))
    expect(km).toBeGreaterThan(356_000)
    expect(km).toBeLessThan(407_000)
  })

  it('이오는 목성 적도면 위 421,700km 원 궤도를 돈다', () => {
    const offset = satelliteOffsetKm('io', T0)
    expect(length(offset)).toBeCloseTo(421_700, 0)
    const pole = equatorAxes(BODIES.jupiter.pole).z
    expect(Math.abs(dot(offset, pole)) / length(offset)).toBeLessThan(1e-9)
  })

  it('행성은 모행성 기준 위치가 없다(원점)', () => {
    expect(satelliteOffsetKm('mars', T0)).toEqual([0, 0, 0])
  })

  it('자전축이 없으면 황도 좌표축 그대로, 있으면 서로 수직인 단위 축', () => {
    expect(equatorAxes()).toEqual({ x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] })
    const { x, y, z } = equatorAxes(BODIES.earth.pole)
    for (const axis of [x, y, z]) expect(length(axis)).toBeCloseTo(1, 12)
    expect(dot(x, y)).toBeCloseTo(0, 12)
    expect(dot(y, z)).toBeCloseTo(0, 12)
    // 지구 북극은 황도 북극에서 자전축 기울기(23.44°)만큼 기움
    expect(Math.acos(z[2]) / DEG).toBeCloseTo(23.44, 1)
  })

  it('지구는 하루에 한 바퀴 돌고, 조석 고정 위성은 모행성을 바라본다', () => {
    const a = bodyAxes('earth', T0)
    const b = bodyAxes('earth', T0 + 23.9345 / 24)
    expect(dot(a.x, b.x)).toBeCloseTo(1, 3)
    const half = bodyAxes('earth', T0 + 23.9345 / 48)
    expect(dot(a.x, half.x)).toBeCloseTo(-1, 3)

    const toward: Vec3 = [0.3, -0.8, 0.1]
    const io = bodyAxes('io', T0, toward)
    expect(dot(io.x, toward)).toBeGreaterThan(0)
    expect(length(io.x)).toBeCloseTo(1, 12)
    expect(dot(io.x, io.z)).toBeCloseTo(0, 12)
  })

  it('자전축 자료가 없는 위성은 황도 북극을 축으로 돈다', () => {
    const { z, x } = bodyAxes('io', T0)
    expect(z).toEqual([0, 0, 1])
    expect(x[2]).toBe(0)
  })
})
