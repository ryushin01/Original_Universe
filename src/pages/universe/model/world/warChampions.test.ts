import { describe, expect, it } from 'vitest'
import { advanceTo, initialWorld } from './engine'
import { declareWar } from './actions'
import type { WarDeclaration } from './actions'
import { isBeingId } from '../mythic/catalog'
import {
  FACTIONS,
  FACTION_BY_ID,
  MEGAWEAPONS,
  MEGAWEAPON_IDS,
  isMegaweaponId,
} from '../war/catalog'
import {
  DIVINE_ROUNDS,
  DUEL_ROUND,
  NO_EXTRAS,
  ROUNDS,
  divineStrike,
  duelOdds,
  megaweaponStrike,
  planWar,
  warOdds,
} from '../war/combat'
import type { WarExtras } from '../war/combat'
import { BEING_BY_ID } from '../mythic/catalog'
import { extrasOf, fallenSide, warMotifs } from './war'
import type { WorldState } from './types'

const START = 2026.87
const fresh = (): WorldState => ({ ...initialWorld(START), budget: 1e4 })
const texts = (s: WorldState) => s.events.map((e) => e.text.ko).join('\n')
const NO_SUPPORT = { megastructures: 0, colonies: false }
const defaults = (a: string, b: string): WarExtras => ({
  aBeing: FACTION_BY_ID[a as 'axis'].patron,
  bBeing: FACTION_BY_ID[b as 'axis'].patron,
  aWeapon: FACTION_BY_ID[a as 'axis'].megaweapon,
  bWeapon: FACTION_BY_ID[b as 'axis'].megaweapon,
})
const declaration = (patch: Partial<WarDeclaration> = {}): WarDeclaration => ({
  a: 'axis',
  b: 'alliance',
  site: 'earth',
  size: 'fleet',
  target: null,
  ...defaults('axis', 'alliance'),
  ...patch,
})

describe('세력의 수호 존재와 대형 병기', () => {
  it('세력마다 서로 다른 수호 존재(우주적 존재)와 대형 병기가 있다', () => {
    const patrons = FACTIONS.map((f) => f.patron)
    expect(new Set(patrons).size).toBe(FACTIONS.length)
    for (const f of FACTIONS) {
      expect(isBeingId(f.patron), f.id).toBe(true)
      expect(isMegaweaponId(f.megaweapon), f.id).toBe(true)
    }
    // 기본 대진: 악시스는 수르트·전쟁 거신병, 얼라이언스는 현무·방벽 거신
    expect(FACTION_BY_ID.axis.patron).toBe('surtr')
    expect(FACTION_BY_ID.alliance.patron).toBe('black-tortoise')
    expect(FACTION_BY_ID.precursors.megaweapon).toBe('warden')
  })

  it('대형 병기는 교전 차례 안에서 쏘고, 한 번의 일격은 적당한 세기다', () => {
    expect(MEGAWEAPON_IDS).toHaveLength(11)
    for (const id of MEGAWEAPON_IDS) {
      const w = MEGAWEAPONS[id]
      expect(w.rounds.length, id).toBeGreaterThan(0)
      for (const r of w.rounds) expect(r).toBeLessThan(ROUNDS)
      expect(w.strike).toBeGreaterThan(0)
      expect(w.strike).toBeLessThanOrEqual(0.1)
      expect(w.motifs).toContain('superweapon')
    }
    // 니콜-다이슨 광선은 다이슨 구조물을 지었으면 더 셈 (카르다쇼프 2단계)
    expect(
      megaweaponStrike('nicoll-dyson', { megastructures: 1, colonies: false }),
    ).toBeGreaterThan(megaweaponStrike('nicoll-dyson', NO_SUPPORT))
  })
})

describe('신적 존재·대형 병기가 낀 전투 계산', () => {
  it('아무도 가세하지 않으면 예전과 같은 결과', () => {
    expect(planWar('axis', 'alliance', 'fleet', NO_SUPPORT, 42)).toEqual(
      planWar('axis', 'alliance', 'fleet', NO_SUPPORT, 42, NO_EXTRAS),
    )
  })

  it('존재는 일격의 차례에 내리치고, 둘 다 있으면 결투해 진 존재는 더 내리치지 못한다', () => {
    for (const seed of [1, 7, 42, 99, 1234]) {
      const plan = planWar(
        'federation',
        'empire',
        'armada',
        NO_SUPPORT,
        seed,
        defaults('federation', 'empire'),
      )
      const duels = plan.rounds.flatMap((r, i) =>
        r.specials
          .filter((x) => x.id === 'divine-duel')
          .map((x) => ({ ...x, round: i })),
      )
      if (plan.rounds.length <= DUEL_ROUND) continue
      expect(duels).toHaveLength(1)
      expect(duels[0].round).toBe(DUEL_ROUND)
      const loser = duels[0].side === 'a' ? 'b' : 'a'
      plan.rounds.forEach((r, i) => {
        const strikes = r.specials.filter((x) => x.id === 'divine-strike')
        if (!DIVINE_ROUNDS.includes(i)) expect(strikes).toHaveLength(0)
        if (i > DUEL_ROUND)
          expect(strikes.some((x) => x.side === loser)).toBe(false)
      })
    }
  })

  it('대형 병기는 제 차례에 쏘고, 강한 존재가 가세하면 승산이 오른다', () => {
    const extras: WarExtras = { ...NO_EXTRAS, aWeapon: 'colossus' }
    const plan = planWar('axis', 'alliance', 'fleet', NO_SUPPORT, 5, extras)
    plan.rounds.forEach((r, i) => {
      const fired = r.specials.some((x) => x.id === 'megaweapon')
      expect(fired).toBe(MEGAWEAPONS.colossus.rounds.includes(i))
    })
    const strong: WarExtras = { ...NO_EXTRAS, aBeing: 'azathoth' }
    expect(
      warOdds('pirates', 'colonies', 'fleet', NO_SUPPORT, strong, 120),
    ).toBeGreaterThan(warOdds('pirates', 'colonies', 'fleet', NO_SUPPORT))
    // 일격의 세기: 권능이 클수록, 상성이 좋을수록 셈
    const surtr = BEING_BY_ID.surtr
    const tortoise = BEING_BY_ID['black-tortoise']
    expect(divineStrike(tortoise, surtr)).toBeGreaterThan(
      divineStrike(tortoise, null),
    )
    expect(duelOdds(defaults('axis', 'alliance'))).toBeLessThan(0.5)
    expect(duelOdds(NO_EXTRAS)).toBeNull()
  })

  it('함대 전력이 크게 앞서면 존재·병기가 가세해도 대체로 이긴다', () => {
    expect(
      warOdds(
        'axis',
        'pirates',
        'fleet',
        NO_SUPPORT,
        defaults('axis', 'pirates'),
        120,
      ),
    ).toBeGreaterThan(0.75)
  })
})

describe('신적 존재·대형 병기가 낀 우주 대전 진행', () => {
  it('강림·병기 등장·일격·결투를 기록하고, 결투에 진 쪽을 알려 준다', () => {
    const { state, result } = declareWar(fresh(), declaration())
    expect(result.ok).toBe(true)
    const [w] = state.wars
    expect(extrasOf(w)).toEqual(defaults('axis', 'alliance'))
    const first = advanceTo(state, w.rounds[0].year + 1e-6)
    expect(texts(first)).toContain('수르트가 악시스 편에 강림했습니다.')
    expect(texts(first)).toContain(
      '더 얼라이언스의 방벽 거신이 전장에 떠올랐습니다.',
    )
    const end = advanceTo(state, w.endYear + 1 / 365.25)
    const all = texts(end)
    expect(all).toContain('함대를 내리쳤습니다')
    expect(all).toContain('불을 뿜어')
    if (w.rounds.length > DUEL_ROUND) {
      expect(all).toContain('신들의 결투:')
      const duel = w.rounds[DUEL_ROUND].specials.find(
        (x) => x.id === 'divine-duel',
      )!
      expect(fallenSide(w, end.year)).toBe(duel.side === 'a' ? 'b' : 'a')
      expect(fallenSide(w, w.startYear)).toBeNull()
    }
    // 소재에 우주적 존재와 슈퍼 웨폰이 더해짐
    const motifs = warMotifs(w.a, w.b, extrasOf(w))
    expect(motifs).toContain('cosmic-being')
    expect(motifs).toContain('superweapon')
    expect(motifs).toContain('mech')
  })

  it('한 존재가 두 편에 서거나, 없는 존재·병기는 막는다', () => {
    const same = declareWar(
      fresh(),
      declaration({ aBeing: 'surtr', bBeing: 'surtr' }),
    )
    expect(same.result.ok).toBe(false)
    expect(
      declareWar(fresh(), declaration({ aBeing: 'nobody' })).result.ok,
    ).toBe(false)
    expect(
      declareWar(fresh(), declaration({ bWeapon: 'death-ray' })).result.ok,
    ).toBe(false)
    // 빼면 함대만 싸움
    const plain = declareWar(
      fresh(),
      declaration({ aBeing: null, bBeing: '', aWeapon: '', bWeapon: null }),
    )
    expect(plain.result.ok).toBe(true)
    expect(extrasOf(plain.state.wars[0])).toEqual(NO_EXTRAS)
  })
})
