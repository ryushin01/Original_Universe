import { initialWorld, advanceTo, pruneFinished } from './engine'
import { build, launchStorm, startMission, summon } from './actions'
import type { SummonInput } from './actions'
import {
  BEINGS,
  BEING_BY_ID,
  CALAMITIES,
  GROUP_NAME,
  SITE_BY_ID,
} from '../mythic/catalog'
import type { Calamity } from '../mythic/catalog'
import { affinity, favoured, winChance } from '../mythic/combat'
import {
  BATTLE_AFTERGLOW_YEARS,
  applyCalamity,
  battleOf,
  visibleBeings,
} from './mythic'
import {
  bodyElements,
  bodyInsolation,
  earthPopulation,
  earthTemperatureC,
  hasPendingEvents,
  isRemoved,
} from './selectors'
import {
  decodeSnapshot,
  encodeSnapshot,
  fromSnapshot,
  toSnapshot,
} from './snapshot'
import type { WorldState } from './types'

const START = 2026.87
const fresh = (): WorldState => ({ ...initialWorld(START), budget: 1e12 })
const being = (id: string) => BEING_BY_ID[id]
const run = (s: WorldState, years: number) => advanceTo(s, s.year + years)
const texts = (s: WorldState) => s.events.map((e) => e.text.ko).join('\n')
const call = (s: WorldState, input: SummonInput) => summon(s, input)
const fixed = () => 0.42
const apply = (
  s: WorldState,
  id: string,
  calamity: Calamity,
  site: keyof typeof SITE_BY_ID = 'earth',
  finale = false,
) =>
  applyCalamity(
    s,
    being(id),
    calamity,
    SITE_BY_ID[site],
    being(id).power / 10,
    fixed,
    finale,
  )

describe('우주적 존재 목록', () => {
  it('모든 존재가 두 언어 이름·출전·전승과 올바른 권능·재해를 갖는다', () => {
    const ids = new Set<string>()
    for (const b of BEINGS) {
      expect(ids.has(b.id), b.id).toBe(false)
      ids.add(b.id)
      for (const text of [b.name, b.origin, b.lore]) {
        expect(text.ko, b.id).not.toBe('')
        expect(text.en, b.id).not.toBe('')
      }
      expect(b.power, b.id).toBeGreaterThanOrEqual(1)
      expect(b.power, b.id).toBeLessThanOrEqual(10)
      for (const c of b.calamities) expect(CALAMITIES[c], b.id).toBeDefined()
      expect(GROUP_NAME[b.group], b.id).toBeDefined()
      for (const r of b.rivals ?? []) expect(BEING_BY_ID[r], b.id).toBeDefined()
    }
    expect(BEINGS.length).toBeGreaterThanOrEqual(80)
  })

  it('요청한 진영과 신수가 모두 있다', () => {
    const factions = new Set(BEINGS.map((b) => b.faction))
    for (const f of [
      'outer',
      'old',
      'horror',
      'elder',
      'god',
      'angel',
      'demon',
      'beast',
      'monster',
      'machine',
    ])
      expect(factions.has(f as never), f).toBe(true)
    const names = BEINGS.map((b) => b.name.ko)
    for (const name of [
      '불사조',
      '해태',
      '기린',
      '청룡',
      '백호',
      '황룡',
      '현무',
      '주작',
      '봉황',
      '아자토스',
      '노덴스',
    ])
      expect(names, name).toContain(name)
    expect(BEINGS.filter((b) => b.faction === 'beast').length).toBe(40)
  })
})

describe('상성과 승산', () => {
  it('오행 상극·빛의 봉인·혼돈의 잠식을 따른다', () => {
    // 수극화: 현무가 주작보다 유리
    expect(affinity('water', 'fire')).toEqual({ factor: 1.5, kind: 'overcome' })
    expect(favoured(being('black-tortoise'), being('vermilion-bird'))).toEqual({
      being: being('black-tortoise'),
      kind: 'overcome',
    })
    expect(affinity('light', 'void').kind).toBe('seal')
    expect(affinity('void', 'metal').kind).toBe('corrupt')
    expect(affinity('light', 'fire').kind).toBe('even')
    expect(favoured(being('azure-dragon'), being('phoenix'))).toBeNull()
  })

  it('두 쪽의 승산을 더하면 1이고, 상성이 좋으면 권능이 낮아도 앞선다', () => {
    const a = being('nodens')
    const b = being('nyarlathotep')
    expect(winChance(a, b) + winChance(b, a)).toBeCloseTo(1, 10)
    expect(winChance(a, b)).toBeGreaterThan(0.8)
    // 해태(5, 물)는 불사조(7, 불)보다 권능이 낮아도 상극으로 거의 대등
    expect(winChance(being('haetae'), being('phoenix'))).toBeGreaterThan(0.45)
  })
})

describe('불러내기', () => {
  it('맞설 존재가 있으면 격돌, 없으면 홀로 강림하고 진행 중에는 저장을 막는다', () => {
    let s = call(fresh(), {
      being: 'azure-dragon',
      rival: 'white-tiger',
      site: 'earth',
    }).state
    expect(s.battles).toHaveLength(1)
    expect(s.battles[0].b).toBe('white-tiger')
    expect(hasPendingEvents(s)).toBe(true)
    s = call(s, { being: 'apep', rival: null, site: 'sun' }).state
    expect(s.battles[1].b).toBeNull()
    expect(texts(s)).toMatch(/아펩이 태양 곁에 강림했습니다/)
    expect(visibleBeings(s)).toEqual(['azure-dragon', 'white-tiger', 'apep'])
  })

  it('같은 존재끼리, 이미 싸우는 존재, 네 번째 격돌, 사라진 싸움터는 거절한다', () => {
    const base = fresh()
    expect(
      call(base, { being: 'ra', rival: 'ra', site: 'sun' }).result.ok,
    ).toBe(false)
    let s = call(base, { being: 'ra', rival: 'apep', site: 'sun' }).state
    expect(
      call(s, { being: 'zeus', rival: 'apep', site: 'earth' }).result.ok,
    ).toBe(false)
    s = call(s, { being: 'zeus', rival: 'typhon', site: 'earth' }).state
    s = call(s, { being: 'thor', rival: 'jormungandr', site: 'jupiter' }).state
    const fourth = call(s, { being: 'odin', rival: 'fenrir', site: 'mars' })
    expect(fourth.result.ok).toBe(false)
    expect(fourth.result.message.ko).toMatch(/3곳까지만/)
    const noMars = {
      ...fresh(),
      removed: { mars: { year: START, reason: 'devoured' as const } },
    }
    expect(
      call(noMars, { being: 'odin', rival: 'fenrir', site: 'mars' }).result
        .message.ko,
    ).toMatch(/싸움터가 사라졌습니다/)
  })

  it('강림한 존재에게 맞설 존재를 보내면 그 싸움터에서 격돌로 바뀐다', () => {
    let s = call(fresh(), { being: 'apep', rival: null, site: 'sun' }).state
    const descent = s.battles[0]
    s = run(s, 60 / 365.25)
    const omens = s.battles[0].pulses.filter((p) => p.done).length
    s = call(s, { being: 'apep', rival: 'ra', site: 'earth' }).state
    const battle = s.battles[0]
    expect(battle.id).toBe(descent.id)
    expect(battle.b).toBe('ra')
    expect(battle.site).toBe('sun')
    expect(battle.endYear).toBeGreaterThan(descent.endYear - 1e-9)
    // 지난 전조는 남기고 새 일정이 붙음
    expect(battle.pulses.filter((p) => p.done)).toHaveLength(omens)
    expect(battle.pulses.length).toBeGreaterThan(omens)
    expect(texts(s)).toMatch(/강림한 아펩에게 라가 맞섰습니다/)
  })
})

describe('격돌 진행', () => {
  it('정해진 때 여파가 터지고, 끝나면 승패와 마무리를 기록한다 (같은 조작이면 같은 결과)', () => {
    const go = () => {
      const s = call(fresh(), {
        being: 'azure-dragon',
        rival: 'white-tiger',
        site: 'earth',
      }).state
      // 끝난 격돌은 잠시 뒤 지워지므로 끝난 직후를 봄
      return advanceTo(s, s.battles[0].endYear + 1 / 365.25)
    }
    const s = go()
    const battle = s.battles[0]
    expect(battle.status).toBe('over')
    expect(battle.pulses.every((p) => p.done)).toBe(true)
    expect(['azure-dragon', 'white-tiger']).toContain(battle.winner)
    expect(texts(s)).toMatch(/청룡과 백호의 격돌이 끝났습니다/)
    expect(hasPendingEvents({ ...s, impacts: [], storms: [] })).toBe(false)
    expect(go().battles[0].winner).toBe(battle.winner)
  })

  it('아무도 막지 않은 혼돈의 강림은 싸움터의 천체를 삼킨다', () => {
    let s = call(fresh(), {
      being: 'kronos',
      rival: null,
      site: 'kuiper',
    }).state
    s = run(s, 1)
    // 권능 8은 행성(해왕성)을 삼키지 못해 그다음으로 큰 명왕성을
    expect(isRemoved(s, 'neptune')).toBe(false)
    expect(s.removed.pluto?.reason).toBe('devoured')
    expect(texts(s)).toMatch(/크로노스가 명왕성을 삼켰습니다/)
  })

  it('끝난 격돌은 3D에서 사라질 때까지만 남는다', () => {
    let s = call(fresh(), {
      being: 'qilin',
      rival: 'taotie',
      site: 'mars',
    }).state
    s = advanceTo(s, s.battles[0].endYear + 1 / 365.25)
    expect(s.battles[0].status).toBe('over')
    s = run(s, BATTLE_AFTERGLOW_YEARS * 2)
    expect(pruneFinished(s).battles).toHaveLength(0)
  })
})

describe('우주적 재해', () => {
  it('태양 잠식은 햇빛을 줄이고 몇 달에 걸쳐 돌아온다', () => {
    const base = fresh()
    const before = bodyInsolation(base, 'earth')
    const s = apply(base, 'starless-hunger', 'eclipse', 'sun')
    expect(s.solarDim).toBeGreaterThan(0.5)
    expect(bodyInsolation(s, 'earth')).toBeLessThan(before * 0.5)
    const later = run(s, 2)
    expect(later.solarDim).toBeLessThan(0.05)
  })

  it('혹한·작열은 지구 기온을, 광기·시듦은 인구와 생물을, 신성 방사는 오존을 줄인다', () => {
    const base = fresh()
    expect(
      earthTemperatureC(apply(base, 'black-tortoise', 'frost'))!,
    ).toBeLessThan(0)
    expect(earthTemperatureC(apply(base, 'surtr', 'heat'))!).toBeGreaterThan(30)
    const mad = apply(base, 'azathoth', 'madness')
    expect(earthPopulation(mad)).toBeLessThan(earthPopulation(base) * 0.98)
    expect(
      apply(base, 'colour-out-of-space', 'blight').earth.biosphere,
    ).toBeLessThan(90)
    expect(apply(base, 'nodens', 'radiation').earth.ozone).toBeLessThan(0.7)
  })

  it('중력 파동은 싸움터 행성의 궤도를 바꾸고, 궤도 이동 엔진이 넓힌 몫을 담는다', () => {
    const base = { ...fresh(), earth: { ...fresh().earth, shiftAu: 0.02 } }
    const a0 = bodyElements(base, 'earth')!.a
    const s = apply(base, 'yellow-dragon', 'quake')
    expect(s.overrides.earth).toBeDefined()
    expect(s.earth.shiftAu).toBe(0)
    expect(Math.abs(bodyElements(s, 'earth')!.a - a0)).toBeGreaterThan(0.01)
    expect(bodyElements(s, 'earth')!.e).toBeGreaterThan(0.03)
  })

  it('삼킴은 권능만큼만: 여파로는 달까지, 지구는 권능 10이 이겼을 때만', () => {
    const base = fresh()
    expect(isRemoved(apply(base, 'hati', 'devour'), 'apophis')).toBe(true)
    let s = apply(base, 'hati', 'devour')
    s = apply(s, 'hati', 'devour')
    expect(isRemoved(s, 'moon')).toBe(true)
    expect(isRemoved(s, 'earth')).toBe(false)
    expect(
      isRemoved(apply(base, 'fenrir', 'devour', 'earth', true), 'earth'),
    ).toBe(false)
    expect(
      isRemoved(apply(base, 'azathoth', 'devour', 'earth', true), 'earth'),
    ).toBe(true)
  })

  it('가호는 오존·생물을 되살리고, 해태는 오던 태양 폭풍을 끈다', () => {
    const hurt = apply(fresh(), 'nodens', 'radiation')
    expect(apply(hurt, 'qilin', 'blessing').earth.ozone).toBeGreaterThan(
      hurt.earth.ozone,
    )
    const storm = launchStorm(fresh(), 'carrington', 'earth').state
    const quenched = apply(storm, 'haetae', 'quench')
    expect(quenched.storms[0].hits.every((h) => h.done)).toBe(true)
    expect(run(quenched, 0.01).losses).toBe(0)
  })

  it('불가사리는 구조물을, 브리트라는 바다를, 침묵의 거신은 전력망을 앗아 간다', () => {
    const built = build(fresh(), 'defense-net', true).state
    expect(apply(built, 'bulgasari', 'scrap').structures).toHaveLength(0)
    expect(apply(fresh(), 'vritra', 'drought').earth.ocean).toBeLessThan(1)
    const silent = apply(fresh(), 'silent-colossus', 'emp')
    expect(silent.losses).toBeGreaterThan(1000)
    const shielded = apply(
      build(fresh(), 'grid-shield', true).state,
      'silent-colossus',
      'emp',
    )
    expect(shielded.losses).toBeCloseTo(silent.losses / 2, 5)
  })

  it('파편 비는 충돌체를 보내고, 요격망은 1년 넘게 남은 것을 맡는다', () => {
    const s = apply(fresh(), 'planet-breaker', 'rain')
    expect(s.impacts.length).toBe(2)
    expect(s.impacts[0].diameterM).toBeGreaterThan(5000)
    let netted = build(fresh(), 'defense-net', true).state
    netted = call(netted, {
      being: 'planet-breaker',
      rival: 'silent-colossus',
      site: 'kuiper',
    }).state
    netted = run(netted, 0.5)
    const comets = netted.impacts.filter((im) => im.target === 'earth')
    for (const im of comets) expect(im.missions.some((m) => m.auto)).toBe(true)
  })

  it('항성 플레어는 태양 폭풍을 일으킨다', () => {
    const s = apply(fresh(), 'surtr', 'flare', 'sun')
    expect(s.storms).toHaveLength(1)
    expect(s.storms[0].cls).toBe('superflare')
  })
})

describe('저장과 미션', () => {
  it('남은 태양 잠식과 삼켜진 천체를 저장 링크에 담는다', () => {
    let s = apply(fresh(), 'skoll', 'eclipse', 'sun')
    s = apply(s, 'hati', 'devour')
    const decoded = decodeSnapshot(encodeSnapshot(toSnapshot(s)))
    expect(decoded).not.toBeNull()
    const back = fromSnapshot(decoded!)
    expect(back.solarDim).toBeCloseTo(s.solarDim, 10)
    expect(back.removed.apophis?.reason).toBe('devoured')
  })

  it('아펩을 막아라: 아무도 맞서지 않으면 실패, 맞서면 격돌 결과를 따른다', () => {
    let lone = startMission(fresh(), 'stop-apep', START).state
    lone = { ...lone, running: true }
    lone = run(lone, 0.5)
    expect(lone.mission?.status).toBe('lost')
    expect(lone.solarDim).toBeGreaterThan(0.4)

    let fought = startMission(fresh(), 'stop-apep', START).state
    fought = call(fought, { being: 'apep', rival: 'nodens', site: 'sun' }).state
    expect(battleOf(fought, 'apep')?.b).toBe('nodens')
    fought = run(fought, 0.8)
    const battle = fought.battles.find((b) => b.tag === 'mission')!
    expect(fought.mission?.status).toBe(
      battle.winner === 'apep' ? 'lost' : 'won',
    )
  })
})
