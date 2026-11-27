import {
  BLAST_SOURCES,
  brightnessKey,
  debrisArrivalYears,
  ozoneBiosphereLoss,
  ozoneFatality,
  ozoneLoss,
  peakApparentMagnitude,
} from './stellar'
import { STELLAR_ENGINE_ACCEL, stellarEngineShiftAu } from './flyby'
import {
  METEOR_SHOWERS,
  METEOR_STORM_FACTOR,
  activeShower,
  peakJd,
  showerById,
  yearOfJd,
} from './meteors'

const byKind = (kind: string) => BLAST_SOURCES.find((s) => s.kind === kind)!

describe('별 폭발 규칙', () => {
  it('Ia형 초신성은 II형보다 최대 밝기가 밝다(같은 거리)', () => {
    const ia = {
      ...byKind('supernova'),
      snType: 'Ia' as const,
      distanceLy: 100,
    }
    const ii = { ...ia, snType: 'II' as const }
    expect(peakApparentMagnitude(ia)!).toBeLessThan(peakApparentMagnitude(ii)!)
  })

  it('감마선 폭발·마그네타는 겉보기 등급이 없고 번쩍임으로 본다', () => {
    for (const kind of ['grb', 'magnetar']) {
      const magnitude = peakApparentMagnitude(byKind(kind))
      expect(magnitude).toBeNull()
      expect(brightnessKey(magnitude)).toBe('flash')
    }
    expect(peakApparentMagnitude(byKind('kilonova'))).not.toBeNull()
  })

  it.each([
    [-13, 'brighterThanMoon'],
    [-5, 'daylight'],
    [0, 'bright'],
    [3, 'faint'],
  ] as const)('겉보기 %d등급은 %s', (magnitude, key) => {
    expect(brightnessKey(magnitude)).toBe(key)
  })

  it('가까울수록 오존층을 더 없애되 95%를 넘지 않는다', () => {
    for (const kind of ['supernova', 'grb', 'kilonova', 'magnetar']) {
      const near = ozoneLoss({ ...byKind(kind), distanceLy: 1 })
      const far = ozoneLoss({ ...byKind(kind), distanceLy: 1e6 })
      expect(near).toBe(0.95)
      expect(far).toBeLessThan(0.01)
    }
    const ia = ozoneLoss({
      ...byKind('supernova'),
      snType: 'Ia',
      distanceLy: 33,
    })
    expect(ia).toBeCloseTo(0.47, 6)
  })

  it('오존이 30% 넘게 줄 때부터 인구·생물 피해가 생기고, 잔해는 거리에 비례해 늦게 닿는다', () => {
    expect(ozoneFatality(0.2)).toBe(0)
    expect(ozoneBiosphereLoss(0.3)).toBe(0)
    expect(ozoneFatality(0.8)).toBeCloseTo(0.2, 9)
    expect(ozoneBiosphereLoss(0.8)).toBeCloseTo(40, 9)
    expect(debrisArrivalYears(100)).toBeCloseTo(100 * (299_792 / 5000), 6)
  })
})

describe('항성 엔진', () => {
  it('슈카도프 추진기는 10만 년에 태양계를 수십 AU 옮긴다', () => {
    expect(STELLAR_ENGINE_ACCEL).toBe(1e-12)
    expect(stellarEngineShiftAu(0)).toBe(0)
    const shift = stellarEngineShiftAu(100_000)
    expect(shift).toBeGreaterThan(10)
    expect(shift).toBeLessThan(100)
    // 등가속도라 시간의 제곱에 비례
    expect(stellarEngineShiftAu(200_000) / shift).toBeCloseTo(4, 9)
  })
})

describe('유성우 규칙', () => {
  const perseids = showerById('perseids')!

  it('모르는 유성우 이름은 찾지 못한다', () => {
    expect(showerById('vulcanids')).toBeUndefined()
    expect(perseids.id).toBe('perseids')
  })

  it('극대 시각은 율리우스일로도 같은 해를 가리킨다', () => {
    const jd = peakJd(perseids, 2030)
    const year = yearOfJd(jd)
    expect(year).toBeGreaterThan(2030)
    expect(year).toBeLessThan(2031)
  })

  it('극대에는 그 유성우가 가장 활발하고, 유성 폭풍이면 활동도가 200배', () => {
    const peak = yearOfJd(peakJd(perseids, 2030))
    const normal = activeShower(peak)
    expect(normal?.shower.id).toBe('perseids')
    const storm = activeShower(peak, {
      showerId: 'perseids',
      factor: METEOR_STORM_FACTOR,
    })
    expect(storm?.zhr).toBeCloseTo(normal!.zhr * METEOR_STORM_FACTOR, 6)
    // 다른 유성우의 폭풍은 페르세우스자리에 영향 없음
    const other = METEOR_SHOWERS.find((s) => s.id !== 'perseids')!
    expect(
      activeShower(peak, { showerId: other.id, factor: 1 })?.zhr,
    ).toBeCloseTo(normal!.zhr, 6)
  })
})
