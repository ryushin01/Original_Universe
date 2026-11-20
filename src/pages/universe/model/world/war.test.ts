import { describe, expect, it } from 'vitest'
import { advanceTo, initialWorld } from './engine'
import { build, canDeclareWar, declareWar } from './actions'
import type { WarDeclaration } from './actions'
import {
  FACTIONS,
  FACTION_BY_ID,
  FLEET_SIZE_IDS,
  MOTIF_IDS,
  SPECIALS,
  WEAPONS,
  factionMotifs,
  fleetPower,
} from '../war/catalog'
import { BREAK, ROUNDS, planWar, warOdds } from '../war/combat'
import {
  MAX_WARS,
  ragingWars,
  superweaponTargets,
  warStrength,
  warSupport,
} from './war'
import { hasPendingEvents, isRemoved } from './selectors'
import type { WorldState } from './types'

const START = 2026.87
const fresh = (): WorldState => ({ ...initialWorld(START), budget: 1e4 })
const texts = (s: WorldState) => s.events.map((e) => e.text.ko).join('\n')
const war = (patch: Partial<WarDeclaration> = {}): WarDeclaration => ({
  a: 'federation',
  b: 'empire',
  site: 'jupiter',
  size: 'fleet',
  target: null,
  ...patch,
})
const NO_SUPPORT = { megastructures: 0, colonies: false }

describe('우주 대전 목록', () => {
  it('나무위키 「스페이스 오페라」 주요 소재 36개가 모두 어느 세력에서든 나온다', () => {
    expect(MOTIF_IDS).toHaveLength(36)
    const shown = new Set(FACTIONS.flatMap(factionMotifs))
    expect(MOTIF_IDS.filter((id) => !shown.has(id))).toEqual([])
  })

  it('세력마다 병기·특수 작전·함대가 있고, 특수 작전은 교전 차례 안에서 터진다', () => {
    expect(FACTIONS).toHaveLength(12)
    for (const f of FACTIONS) {
      expect(WEAPONS[f.weapon], f.id).toBeDefined()
      expect(f.specials.length, f.id).toBeGreaterThan(0)
      for (const size of FLEET_SIZE_IDS)
        expect(fleetPower(f, size), f.id).toBeGreaterThan(0)
    }
    for (const special of Object.values(SPECIALS))
      for (const r of special.rounds) expect(r).toBeLessThan(ROUNDS)
  })
})

describe('전투 계산', () => {
  it('같은 시드는 같은 결과, 차례는 시간 순서이고 무너지면 거기서 끝난다', () => {
    const one = planWar('federation', 'empire', 'fleet', NO_SUPPORT, 42)
    expect(planWar('federation', 'empire', 'fleet', NO_SUPPORT, 42)).toEqual(
      one,
    )
    const ats = one.rounds.map((r) => r.at)
    expect(ats).toEqual([...ats].sort((x, y) => x - y))
    const broke = one.rounds.findIndex((r) => r.broke)
    if (broke >= 0) expect(one.rounds).toHaveLength(broke + 1)
    expect(one.days).toBeGreaterThanOrEqual(10)
  })

  it('전력과 특수 작전이 크게 앞서면 거의 이긴다 (란체스터 제곱 법칙)', () => {
    expect(
      warOdds('federation', 'pirates', 'fleet', NO_SUPPORT),
    ).toBeGreaterThan(0.85)
    expect(warOdds('pirates', 'federation', 'fleet', NO_SUPPORT)).toBeLessThan(
      0.15,
    )
  })

  it('메가스트럭처 지원 사격과 식민지 봉기는 조건이 맞을 때만 터진다', () => {
    const specials = (support: typeof NO_SUPPORT) =>
      planWar('colonies', 'swarm', 'fleet', support, 7)
        .rounds.flatMap((r) => r.specials)
        .map((s) => s.id)
    expect(specials(NO_SUPPORT)).not.toContain('megastructure')
    expect(specials(NO_SUPPORT)).not.toContain('colony-uprising')
    const supported = specials({ megastructures: 2, colonies: true })
    expect(supported).toContain('megastructure')
    expect(supported).toContain('colony-uprising')
  })
})

describe('우주 대전 진행', () => {
  it('개전하면 기록을 남기고, 진행 중에는 저장·공유를 막고, 끝나면 승자와 여파를 남긴다', () => {
    const { state, result } = declareWar(fresh(), war())
    expect(result.ok).toBe(true)
    expect(state.wars).toHaveLength(1)
    expect(texts(state)).toContain('우주 대전이 시작됩니다')
    expect(hasPendingEvents(state)).toBe(true)
    const [w] = state.wars
    const middle = advanceTo(state, w.rounds[0].year + 1e-6)
    expect(texts(middle)).toContain('워프 항로를 열고')
    const strength = warStrength(w, w.rounds[0].year)
    expect(strength.a).toBeCloseTo(w.rounds[0].a)
    const end = advanceTo(state, w.endYear + 1 / 365.25)
    expect(ragingWars(end)).toHaveLength(0)
    expect(texts(end)).toContain('우주 대전이 끝났습니다')
    // 목성 곁이므로 잔해가 위성으로 떨어짐
    expect(texts(end)).toContain('부서진 함선 잔해')
    expect(end.impacts.some((im) => im.target !== 'earth')).toBe(true)
  })

  it('행성 파괴포: 기함이 버티면 고른 위성을 부순다', () => {
    const { state } = declareWar(
      fresh(),
      war({ a: 'empire', b: 'federation', target: 'europa' }),
    )
    const [w] = state.wars
    const end = advanceTo(state, w.endYear + 1 / 365.25)
    const fired = w.rounds[2]?.specials.some((s) => s.id === 'planet-killer')
    if (fired && w.rounds[2].a >= BREAK) {
      expect(isRemoved(end, 'europa')).toBe(true)
      expect(end.removed.europa?.reason).toBe('destroyed')
      expect(texts(end)).toContain('행성 파괴포로 유로파를 부쉈습니다')
    } else expect(isRemoved(end, 'europa')).toBe(false)
    // 지구는 표적으로 고를 수 없음
    expect(superweaponTargets(state, 'earth')).not.toContain('earth')
  })

  it('해적의 약탈은 예산을 빼앗고, 봉인 해제는 우주적 존재를 깨운다', () => {
    const raided = declareWar(
      fresh(),
      war({ a: 'pirates', b: 'colonies', site: 'mars' }),
    ).state
    const afterRaid = advanceTo(raided, raided.wars[0].endYear + 1 / 365.25)
    expect(afterRaid.budget).toBeLessThan(raided.budget)
    expect(texts(afterRaid)).toContain('보급선을 털어')

    const sealed = declareWar(
      fresh(),
      war({ a: 'arcane', b: 'ascendancy', site: 'kuiper' }),
    ).state
    const third = sealed.wars[0].rounds[3]
    const later = advanceTo(sealed, sealed.wars[0].endYear + 1 / 365.25)
    if (third?.specials.some((s) => s.id === 'summon')) {
      expect(later.battles.length).toBeGreaterThan(0)
      expect(texts(later)).toContain('봉인을 풀어')
    }
  })

  it('지어 둔 메가스트럭처가 지원 사격에 쓰인다', () => {
    let s = fresh()
    s = build(s, 'space-elevator', true).state
    expect(warSupport(s, 'earth').megastructures).toBe(1)
  })

  it('같은 세력끼리, 없는 표적, 동시에 너무 많은 전쟁은 막는다', () => {
    const s = fresh()
    expect(canDeclareWar(s, war({ b: 'federation' })).ok).toBe(false)
    expect(canDeclareWar(s, war({ a: 'empire', target: 'earth' })).ok).toBe(
      false,
    )
    let many = s
    for (let k = 0; k < MAX_WARS; k++)
      many = declareWar(many, war({ site: k === 0 ? 'mars' : 'kuiper' })).state
    expect(canDeclareWar(many, war()).ok).toBe(false)
    expect(FACTION_BY_ID.empire.specials).toContain('planet-killer')
  })
})
