import { describe, expect, it } from 'vitest'
import { advanceTo, initialWorld } from './engine'
import { build, setCivLevel } from './actions'
import {
  CIV_LEVELS,
  CIV_LEVEL_BY_ID,
  wasteHeatC,
  withRequirements,
} from './civilization'
import {
  civHeatNowC,
  civilizationPower,
  earthTemperatureC,
  hasProject,
  humanity,
  incomeB,
  kardashev,
} from './selectors'
import {
  decodeSnapshot,
  encodeSnapshot,
  fromSnapshot,
  toSnapshot,
} from './snapshot'
import type { WorldState } from './types'

const START = 2026.87
const fresh = (): WorldState => ({ ...initialWorld(START), budget: 1e4 })
const texts = (s: WorldState) => s.events.map((e) => e.text.ko).join('\n')
const k = (s: WorldState) => kardashev(civilizationPower(s))!

describe('문명 단계 (카르다쇼프 척도)', () => {
  it('단계마다 그 척도에 맞는 에너지를 쓴다 (고대 0.5 ~ Ⅲ단계 3.0)', () => {
    for (const level of CIV_LEVELS) {
      const s = setCivLevel(fresh(), level.id).state
      expect(k(s), level.id).toBeCloseTo(level.k, 1)
    }
    // 에너지가 줄면 예산도 줄고, 늘면 늘어남
    const ancient = setCivLevel(fresh(), 'ancient').state
    const type2 = setCivLevel(fresh(), 'type2').state
    expect(incomeB(ancient)).toBeLessThan(incomeB(fresh()))
    expect(incomeB(type2)).toBeGreaterThan(incomeB(fresh()))
  })

  it('Ⅱ단계로 올리면 다이슨 구·링월드 등 구조물이 바로 서고, 지금으로 내리면 단계가 지은 것만 허문다', () => {
    // 달 기지는 직접 지어 둠
    const own = build(fresh(), 'moon-base', true).state
    const { state, result } = setCivLevel(own, 'type2')
    expect(result.ok).toBe(true)
    for (const kind of CIV_LEVEL_BY_ID.type2.structures)
      expect(hasProject(state, kind), kind).toBe(true)
    expect(state.civ.level).toBe('type2')
    expect(state.civ.granted).not.toContain('moon-base')
    expect(texts(state)).toContain(
      '문명 단계를 Ⅱ단계 항성 문명 (2.0)로 올렸습니다',
    )
    expect(texts(state)).toContain('다이슨 구')
    expect(texts(state)).toContain('지구 곁에 함대 배치')
    // Ⅰ단계로 내리면 다이슨 구는 허물고 Ⅰ단계 구조물은 남김
    const type1 = setCivLevel(state, 'type1').state
    expect(hasProject(type1, 'dyson-sphere')).toBe(false)
    expect(hasProject(type1, 'space-elevator')).toBe(true)
    expect(texts(type1)).toContain('허묾')
    const today = setCivLevel(type1, 'today').state
    expect(today.civ).toEqual({ level: null, granted: [] })
    expect(hasProject(today, 'space-elevator')).toBe(false)
    // 직접 지은 달 기지는 그대로
    expect(hasProject(today, 'moon-base')).toBe(true)
  })

  it('먼저 있어야 하는 구조물을 앞에 두고, 지구에서 쓰는 에너지의 폐열로 지구가 더워진다', () => {
    const order = withRequirements(['ringworld'])
    expect(order.indexOf('dyson-swarm')).toBeLessThan(
      order.indexOf('ringworld'),
    )
    // Ⅰ단계(10¹⁶ W)는 약 6°C, 지금(약 20 TW)은 0.02°C 아래
    expect(wasteHeatC(1e16)).toBeGreaterThan(5)
    expect(wasteHeatC(1e16)).toBeLessThan(6.5)
    expect(wasteHeatC(2e13)).toBeLessThan(0.02)
    const base = advanceTo(fresh(), START + 20)
    const hot = advanceTo(setCivLevel(fresh(), 'type1').state, START + 20)
    const rise = earthTemperatureC(hot)! - earthTemperatureC(base)!
    expect(rise).toBeGreaterThan(4.5)
    expect(rise).toBeLessThan(6.5)
  })

  it('자연 성장에도 폐열이 더해져 2430년 무렵 Ⅰ단계 폐열을 넘고, 더위로 사람이 줄면 균형에서 멈춘다', () => {
    // 지금은 0.05°C 아래라 오늘 기온(15°C)은 그대로
    expect(civHeatNowC(fresh())).toBeLessThan(0.05)
    const y2450 = advanceTo(fresh(), 2450)
    expect(civHeatNowC(y2450)).toBeGreaterThan(wasteHeatC(1e16))
    // 더워질수록 살 수 있는 사람이 줄어 쓰는 에너지와 폐열도 줄므로 40°C대에서 멈춤
    const y3000 = advanceTo(fresh(), 3000)
    const hot = earthTemperatureC(y3000)!
    expect(hot).toBeGreaterThan(40)
    expect(hot).toBeLessThan(55)
    expect(humanity(y3000)).toBeLessThan(humanity(y2450) * 0.7)
    // 한 번에 건너뛰든 5년씩 가든 같은 기온이고, 큰 걸음을 거듭해도 두 값 사이를 오가지 않음
    let stepped = fresh()
    for (let y = 2030; y <= 3000; y += 5) stepped = advanceTo(stepped, y)
    expect(earthTemperatureC(stepped)!).toBeCloseTo(hot, 1)
    let s = y3000
    for (let i = 0; i < 4; i++) {
      s = advanceTo(s, s.year + 500)
      expect(earthTemperatureC(s)!).toBeCloseTo(hot, 1)
    }
    // Ⅰ단계로 정하면 지구에서 쓰는 에너지가 10¹⁶ W로 묶여 약 6°C만 남음
    const type1 = advanceTo(setCivLevel(y3000, 'type1').state, 3010)
    expect(civHeatNowC(type1)).toBeCloseTo(wasteHeatC(1e16), 5)
    expect(earthTemperatureC(type1)!).toBeLessThan(25)
  })

  it('저장·공유해도 문명 단계가 남고, 잘못된 단계·미션 중에는 바꾸지 않는다', () => {
    const s = setCivLevel(fresh(), 'type2').state
    const restored = fromSnapshot(
      decodeSnapshot(encodeSnapshot(toSnapshot(s)))!,
    )
    expect(restored.civ.level).toBe('type2')
    expect([...restored.civ.granted].sort()).toEqual([...s.civ.granted].sort())
    expect(k(restored)).toBeCloseTo(2, 1)
    expect(setCivLevel(fresh(), 'type9').result.ok).toBe(false)
    const busy: WorldState = {
      ...fresh(),
      mission: {
        id: 'deflect',
        startYear: START,
        endYear: START + 1,
        status: 'running',
        result: null,
        startLosses: 0,
        startBudget: 1e4,
      },
    }
    expect(setCivLevel(busy, 'type1').result.ok).toBe(false)
  })
})
