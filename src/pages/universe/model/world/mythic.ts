import { compose } from '@/shared/i18n'
import type { Locale } from '@/shared/i18n'
import {
  clamp,
  formatMoney,
  formatPercent,
  formatSig,
  seededRandom,
  yearToJd,
} from '@/shared/lib'
import { BODIES } from '../solar/bodies'
import type { BodyId } from '../solar/bodies'
import { STORM_CLASSES } from '../hazards/storm'
import type { StormClass } from '../hazards/storm'
import type { ImpactorKind } from '../hazards/impact'
import { ozoneBiosphereLoss, ozoneFatality } from '../hazards/stellar'
import { PROJECT_BY_KIND } from '../projects/catalog'
import { BEING_BY_ID, CALAMITIES, SITE_BY_ID } from '../mythic/catalog'
import type { BattleSite, Being, Calamity, SiteId } from '../mythic/catalog'
import {
  battleDays,
  devourVictim,
  planPulses,
  winChance,
} from '../mythic/combat'
import { makeImpact, makeStorm } from './factory'
import { log } from './log'
import {
  COLONY_KINDS,
  bodyElements,
  earthPopulation,
  hasProject,
  isRemoved,
  sunState,
} from './selectors'
import { withoutBodies } from '../hazards/nbody'
import { formatDuration, formatKm, formatPeople, josa, nameOf } from './text'
import type { Battle, BattlePulse, Tone, WorldState } from './types'

/** 한 번에 벌어질 수 있는 격돌·강림 수 */
export const MAX_BATTLES = 3
/** 태양 잠식이 풀리는 시간 상수 (년) */
export const SOLAR_DIM_TAU = 0.5
/** 태양 잠식의 최대값 */
const MAX_DIM = 0.95
/** 끝난 격돌을 3D에 남겨 두는 시간 (년) */
export const BATTLE_AFTERGLOW_YEARS = 30 / 365.25

export const beingOf = (id: string): Being => BEING_BY_ID[id]

/** 지금 벌어지는 격돌·강림 */
export const ragingBattles = (state: WorldState) =>
  state.battles.filter((b) => b.status === 'raging')

/** 그 존재가 지금 싸우거나 강림해 있는 격돌 */
export const battleOf = (state: WorldState, beingId: string) =>
  state.battles.find(
    (b) => b.status === 'raging' && (b.a === beingId || b.b === beingId),
  )

/** 3D·정보 카드에 보일 존재: 싸우는 중이거나 막 끝난 격돌의 참가자 */
export function visibleBeings(state: WorldState): string[] {
  const ids: string[] = []
  for (const b of state.battles) {
    const recent =
      b.status === 'raging' || state.year - b.endYear < BATTLE_AFTERGLOW_YEARS
    if (!recent) continue
    for (const id of [b.a, b.b])
      if (id && !ids.includes(id) && (b.status === 'raging' || id === b.winner))
        ids.push(id)
  }
  return ids
}

/* ── 격돌 만들기 ──────────────────────────────────── */

const DAY = 1 / 365.25

function schedule(
  a: Being,
  b: Being | null,
  from: number,
  to: number,
  random: () => number,
): BattlePulse[] {
  return planPulses(a, b, random).map((p) => ({
    year: from + (to - from) * p.at,
    actor: p.actor,
    calamity: p.calamity,
    done: false,
  }))
}

export interface BattleInput {
  a: string
  b: string | null
  site: SiteId
  /** 홀로 강림의 재앙까지 남은 날 (미션에서 정함) */
  days?: number
  tag?: string
}

export function makeBattle(state: WorldState, input: BattleInput): Battle {
  const a = beingOf(input.a)
  const b = input.b ? beingOf(input.b) : null
  const seed = state.nextId * 2_654_435 + Math.round(state.year * 977)
  const random = seededRandom(seed)
  const days = input.days ?? battleDays(a, b)
  const endYear = state.year + days * DAY
  return {
    id: state.nextId,
    a: a.id,
    b: b?.id ?? null,
    site: input.site,
    startYear: state.year,
    endYear,
    pulses: schedule(a, b, state.year, endYear, random),
    status: 'raging',
    winner: null,
    seed,
    tag: input.tag,
  }
}

/**
 * 홀로 강림한 존재에게 맞설 존재를 보냄: 지난 전조는 그대로 두고,
 * 지금부터 새 격돌 일정으로 바꿉니다 (싸움터는 강림한 곳)
 */
export function opposeBattle(
  state: WorldState,
  battle: Battle,
  rivalId: string,
): Battle {
  const a = beingOf(battle.a)
  const b = beingOf(rivalId)
  const random = seededRandom(battle.seed + state.nextId)
  const endYear = state.year + battleDays(a, b) * DAY
  return {
    ...battle,
    b: b.id,
    endYear,
    pulses: [
      ...battle.pulses.filter((p) => p.done),
      ...schedule(a, b, state.year, endYear, random),
    ],
  }
}

/* ── 재해 ─────────────────────────────────────────── */

/** 플레어가 겨누는 천체 */
const FLARE_TARGET: Record<SiteId, BodyId | 'random'> = {
  sun: 'earth',
  earth: 'earth',
  mars: 'mars',
  jupiter: 'jupiter',
  kuiper: 'neptune',
  deep: 'random',
}

/** 지구에 미치는 정도 (아래 한계를 두어 먼 싸움터도 조금은 느껴짐) */
const reach = (site: BattleSite, floor = 0.15) => Math.max(site.reach, floor)

const said = (being: Being, l: Locale) => being.name[l]

function stormClassFor(being: Being): StormClass {
  if (being.power >= 9) return 'superflare'
  if (being.power >= 6) return 'carrington'
  return 'severe'
}

function flare(state: WorldState, being: Being, site: BattleSite): WorldState {
  const cls = stormClassFor(being)
  const storm = makeStorm(state, cls, FLARE_TARGET[site.id])
  const s: WorldState = {
    ...state,
    storms: [...state.storms, { ...storm, announced: true }],
    nextId: state.nextId + 1,
  }
  const spec = STORM_CLASSES[cls]
  return log(
    s,
    compose((l) => {
      const reachText = storm.hits.map((h) => nameOf(h.body, l)).join(', ')
      return l === 'ko'
        ? `${said(being, l)}의 권능으로 태양에서 ${spec.name.ko} 코로나 질량 방출이 터졌습니다. ${reachText ? `닿는 곳: ${reachText}` : '행성을 비껴 갑니다.'}`
        : `${said(being, l)} wrenches a ${spec.name.en} coronal mass ejection from the Sun. ${reachText ? `In its path: ${reachText}` : 'It misses every planet.'}`
    }),
    'warn',
  )
}

/** 파편이 향할 천체: 싸움터 천체와, 지구에 미치는 만큼 지구 */
function rainTarget(
  state: WorldState,
  site: BattleSite,
  random: () => number,
): BodyId | null {
  const local = site.bodies.filter((id) => !isRemoved(state, id))
  const earthOk = !isRemoved(state, 'earth')
  if (earthOk && (local.length === 0 || random() < site.reach * 0.6))
    return 'earth'
  if (local.length === 0) return earthOk ? 'earth' : null
  return local[Math.floor(random() * local.length)]
}

function rain(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
  random: () => number,
): WorldState {
  let s = state
  const count = being.power >= 7 ? 2 : 1
  const far = site.id === 'kuiper' || site.id === 'deep'
  const kind: ImpactorKind = far
    ? 'comet'
    : being.element === 'metal'
      ? 'iron'
      : 'stony'
  const diameterM = Math.round(
    clamp(40 * 10 ** (clamp(intensity, 0, 1) * 2.5), 30, 15_000),
  )
  const launched: Array<{ target: BodyId; years: number }> = []
  for (let k = 0; k < count; k++) {
    const target = rainTarget(s, site, random)
    if (!target) break
    // 가까운 싸움터의 파편은 빨리, 먼 곳의 혜성은 몇 해 뒤에 닿음
    const years = far
      ? 2 + random() * 2.5
      : site.id === 'earth'
        ? 0.5 + random()
        : 1 + random() * 1.5
    const impact = makeImpact(s, {
      target,
      kind,
      diameterM,
      warningYears: years,
    })
    s = { ...s, impacts: [...s.impacts, impact], nextId: s.nextId + 1 }
    launched.push({ target, years })
  }
  if (launched.length === 0) return state
  return log(
    s,
    compose((l) => {
      const list = launched
        .map(
          (x) =>
            `${nameOf(x.target, l)} (${formatDuration(x.years, l)}${l === 'ko' ? ' 뒤' : ''})`,
        )
        .join(', ')
      return l === 'ko'
        ? `${said(being, l)}의 싸움에서 부서진 지름 ${formatKm(diameterM / 1000, l)} 조각이 날아갑니다: ${list}`
        : `Fragments ${formatKm(diameterM / 1000, l)} wide fly from ${said(being, l)}’s battle: ${list}`
    }),
    launched.some((x) => x.target === 'earth') ? 'danger' : 'warn',
  )
}

function eclipse(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
): WorldState {
  if (state.sunBlackHole) return state
  const bite = clamp(0.65 * intensity * site.shade, 0, MAX_DIM)
  const dim = clamp(1 - (1 - state.solarDim) * (1 - bite), 0, MAX_DIM)
  return log(
    { ...state, solarDim: dim },
    compose((l) =>
      l === 'ko'
        ? `${josa(said(being, l), '이가')} 해를 물었습니다. 태양계에 닿는 햇빛이 ${formatPercent(dim, l)} 줄었다가 몇 달에 걸쳐 돌아옵니다.`
        : `${said(being, l)} bites the Sun. Sunlight across the system drops by ${formatPercent(dim, l)} and returns over months.`,
    ),
    dim >= 0.3 ? 'danger' : 'warn',
  )
}

function frost(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
): WorldState {
  if (isRemoved(state, 'earth')) return state
  const drop = (3 + 22 * intensity) * reach(site)
  return log(
    {
      ...state,
      earth: {
        ...state.earth,
        coolingC: Math.max(-50, Math.min(state.earth.coolingC, -drop)),
      },
    },
    compose((l) =>
      l === 'ko'
        ? `${said(being, l)}의 혹한이 지구를 덮쳤습니다. 평균 기온이 약 ${formatSig(drop, l, 2)}°C 내려가 몇 해에 걸쳐 풀립니다.`
        : `${said(being, l)}’s deep freeze grips Earth: about ${formatSig(drop, l, 2)}°C colder, easing over a few years.`,
    ),
    drop >= 8 ? 'danger' : 'warn',
  )
}

function heat(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
): WorldState {
  if (isRemoved(state, 'earth')) return state
  const rise = (2 + 18 * intensity) * reach(site)
  return log(
    {
      ...state,
      earth: { ...state.earth, tempC: state.earth.tempC + rise },
    },
    compose((l) =>
      l === 'ko'
        ? `${said(being, l)}의 열기가 지구를 달굽니다. 평균 기온이 약 ${formatSig(rise, l, 2)}°C 올랐다가 몇 해에 걸쳐 식습니다.`
        : `${said(being, l)}’s heat bakes Earth: about ${formatSig(rise, l, 2)}°C warmer, cooling over a few years.`,
    ),
    rise >= 8 ? 'danger' : 'warn',
  )
}

/**
 * 지은 기지 모두의 생존 비율을 줄임. 한 번도 피해를 입지 않은 기지는 기록이 없으므로
 * 기지 목록에서 찾아 1에서 시작함
 */
function hurtColonies(state: WorldState, fraction: number): WorldState {
  if (fraction <= 0) return state
  const colonyHealth = { ...state.colonyHealth }
  let changed = false
  for (const kind of COLONY_KINDS) {
    if (!hasProject(state, kind)) continue
    colonyHealth[kind] = (colonyHealth[kind] ?? 1) * (1 - fraction)
    changed = true
  }
  return changed ? { ...state, colonyHealth } : state
}

/** 지구와 기지의 사람이 줄어듦 (광기·시듦). 지구가 사라졌으면 기지만 */
function loseLives(state: WorldState, fraction: number, bio: number) {
  const s = hurtColonies(state, fraction)
  // 지구가 사라졌어도 기지는 남을 수 있음
  if (isRemoved(state, 'earth')) return { deaths: 0, state: s }
  return {
    deaths: earthPopulation(state) * fraction,
    state: {
      ...s,
      earth: {
        ...s.earth,
        popFactor: s.earth.popFactor * (1 - fraction),
        biosphere: clamp(s.earth.biosphere - bio, 0, 100),
      },
    },
  }
}

function madness(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
): WorldState {
  // 꿈으로 퍼지므로 먼 싸움터에서도 절반은 닿음
  const spread = Math.max(site.reach, 0.5)
  const fraction = clamp(0.03 * intensity ** 2 * spread, 0, 0.2)
  const { deaths, state: s } = loseLives(
    state,
    fraction,
    2 * intensity * spread,
  )
  return log(
    s,
    compose((l) =>
      l === 'ko'
        ? `${said(being, l)}의 광기가 꿈을 타고 퍼졌습니다. 약 ${formatPeople(deaths, l)}이 스러졌습니다.`
        : `${said(being, l)}’s madness spreads through dreams; about ${formatPeople(deaths, l)} are lost.`,
    ),
    'danger',
  )
}

function blight(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
): WorldState {
  const spread = Math.max(site.reach, 0.3)
  const bio = 25 * intensity * spread
  const fraction = clamp(0.01 * intensity ** 2 * spread, 0, 0.1)
  const { deaths, state: s } = loseLives(state, fraction, bio)
  return log(
    s,
    compose((l) =>
      l === 'ko'
        ? `${josa(said(being, l), '이가')} 닿은 곳마다 생명이 잿빛으로 시듭니다. 생물 다양성이 ${formatSig(bio, l, 2)} 줄고 약 ${formatPeople(deaths, l)}이 숨졌습니다.`
        : `Life turns grey and brittle wherever ${said(being, l)} touches: biodiversity −${formatSig(bio, l, 2)}, about ${formatPeople(deaths, l)} dead.`,
    ),
    'danger',
  )
}

function radiation(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
): WorldState {
  if (isRemoved(state, 'earth')) return state
  const loss = clamp(0.4 * intensity * Math.sqrt(site.reach), 0.02, 0.9)
  const fatality = ozoneFatality(loss)
  const deaths = earthPopulation(state) * fatality
  return log(
    {
      ...state,
      earth: {
        ...state.earth,
        ozone: Math.max(0.05, state.earth.ozone * (1 - loss)),
        popFactor: state.earth.popFactor * (1 - fatality),
        biosphere: Math.max(
          0,
          state.earth.biosphere - ozoneBiosphereLoss(loss),
        ),
      },
    },
    compose((l) => {
      const toll =
        deaths >= 1
          ? l === 'ko'
            ? ` 자외선이 늘어 약 ${formatPeople(deaths, l)}이 숨질 것으로 봅니다.`
            : ` Extra UV may kill about ${formatPeople(deaths, l)}.`
          : ''
      return l === 'ko'
        ? `${said(being, l)}의 포효가 감마선처럼 쏟아져 지구 오존층이 ${formatPercent(loss, l)} 깎였습니다.${toll}`
        : `${said(being, l)}’s roar pours down like gamma rays, stripping ${formatPercent(loss, l)} of Earth’s ozone.${toll}`
    }),
    loss >= 0.3 ? 'danger' : 'warn',
  )
}

function quake(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
  random: () => number,
): WorldState {
  // 근접 통과를 N체로 계산하는 동안에는 궤도를 덮어쓰지 않음
  const targets = state.nbody
    ? []
    : site.bodies.filter((id) => !BODIES[id].parent && !isRemoved(state, id))
  if (targets.length === 0) return rain(state, being, site, intensity, random)
  const sun = sunState(state)
  const overrides = { ...state.overrides }
  const changes: Array<{
    id: BodyId
    a0: number
    a1: number
    e0: number
    e1: number
  }> = []
  for (const id of targets) {
    const el = bodyElements(state, id)
    if (!el) continue
    const da = (random() < 0.5 ? -1 : 1) * (0.004 + 0.04 * intensity ** 2)
    const de = 0.005 + 0.05 * intensity ** 2
    const next = {
      ...el,
      a: el.a * (1 + da),
      e: clamp(el.e + de, 0, 0.9),
    }
    // 지금 위치의 궤도 요소를 지금 시각·지금 태양 질량 기준으로 다시 정함
    overrides[id] = {
      elements: next,
      epochJd: yearToJd(state.orbitYear),
      sunMass: sun.mass,
    }
    changes.push({ id, a0: el.a, a1: next.a, e0: el.e, e1: next.e })
  }
  if (changes.length === 0) return state
  // 궤도 이동 엔진이 넓힌 만큼은 새 궤도에 들어 있음
  const earthMoved = changes.some((c) => c.id === 'earth')
  return log(
    {
      ...state,
      overrides,
      earth: earthMoved ? { ...state.earth, shiftAu: 0 } : state.earth,
    },
    compose((l) => {
      const list = changes
        .map(
          (c) =>
            `${nameOf(c.id, l)} a ${formatSig(c.a0, l, 4)}→${formatSig(c.a1, l, 4)} AU, e ${formatSig(c.e0, l, 2)}→${formatSig(c.e1, l, 2)}`,
        )
        .join(' · ')
      return l === 'ko'
        ? `${said(being, l)}의 중력 파동에 궤도가 흔들렸습니다: ${list}`
        : `${said(being, l)}’s gravity quake knocks orbits askew: ${list}`
    }),
    earthMoved ? 'danger' : 'warn',
  )
}

function devour(
  state: WorldState,
  being: Being,
  site: BattleSite,
  finale: boolean,
  intensity: number,
  random: () => number,
): WorldState {
  const victim = devourVictim(site, being.power, finale, (id) =>
    isRemoved(state, id),
  )
  if (!victim) return rain(state, being, site, intensity, random)
  return log(
    {
      ...state,
      removed: {
        ...state.removed,
        [victim]: { year: state.year, reason: 'devoured' as const },
      },
      // 근접 통과를 N체로 계산하는 중이면 삼킨 천체가 계속 끌어당기지 않게 뺌
      nbody: state.nbody ? withoutBodies(state.nbody, new Set([victim])) : null,
    },
    compose((l) =>
      l === 'ko'
        ? `${josa(said(being, l), '이가')} ${josa(nameOf(victim, l), '을를')} 삼켰습니다.`
        : `${said(being, l)} has devoured ${nameOf(victim, l)}.`,
    ),
    'danger',
  )
}

function blessing(
  state: WorldState,
  being: Being,
  intensity: number,
): WorldState {
  const k = clamp(intensity, 0, 1)
  const colonyHealth = { ...state.colonyHealth }
  for (const kind of Object.keys(colonyHealth) as Array<
    keyof typeof colonyHealth
  >)
    colonyHealth[kind] = 1 - (1 - (colonyHealth[kind] ?? 1)) * (1 - 0.5 * k)
  const e = state.earth
  return log(
    {
      ...state,
      solarDim: state.solarDim * (1 - k),
      colonyHealth,
      earth: {
        ...e,
        ozone: e.ozone + (1 - e.ozone) * 0.6 * k,
        biosphere: e.biosphere + (100 - e.biosphere) * 0.4 * k,
        popFactor: e.popFactor + (1 - e.popFactor) * 0.3 * k,
        coolingC: e.coolingC * (1 - k),
      },
    },
    compose((l) =>
      l === 'ko'
        ? `${said(being, l)}의 가호가 내립니다. 오존층과 생물이 되살아나고 냉각과 잠식이 풀립니다.`
        : `${said(being, l)} grants a blessing: ozone and life recover, and chills and dimming lift.`,
    ),
    'good',
  )
}

function quench(
  state: WorldState,
  being: Being,
  intensity: number,
): WorldState {
  const burning = state.storms.filter(
    (st) => st.announced && st.hits.some((h) => !h.done),
  )
  const hot = state.earth.tempC > 20
  if (burning.length === 0 && !hot) return blessing(state, being, intensity / 2)
  return log(
    {
      ...state,
      storms: state.storms.map((st) =>
        burning.includes(st)
          ? { ...st, hits: st.hits.map((h) => ({ ...h, done: true })) }
          : st,
      ),
      earth: hot
        ? { ...state.earth, tempC: 15 + (state.earth.tempC - 15) * 0.5 }
        : state.earth,
    },
    compose((l) => {
      const storms =
        burning.length > 0
          ? l === 'ko'
            ? ` 오던 태양 폭풍 ${burning.length}개가 꺼졌습니다.`
            : ` ${burning.length} incoming solar storm${burning.length > 1 ? 's' : ''} snuffed out.`
          : ''
      return l === 'ko'
        ? `${josa(said(being, l), '이가')} 불을 삼켰습니다.${storms}`
        : `${said(being, l)} swallows the fire.${storms}`
    }),
    'good',
  )
}

function scrap(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
  random: () => number,
): WorldState {
  const built = state.structures.filter((st) => state.year >= st.completeYear)
  if (built.length === 0) return rain(state, being, site, intensity, random)
  const meal = built.reduce((a, b) => (b.completeYear > a.completeYear ? b : a))
  const spec = PROJECT_BY_KIND[meal.kind]
  const colonyHealth = { ...state.colonyHealth }
  delete colonyHealth[meal.kind]
  return log(
    {
      ...state,
      structures: state.structures.filter((st) => st.id !== meal.id),
      colonyHealth,
    },
    compose((l) =>
      l === 'ko'
        ? `${josa(said(being, l), '이가')} ${spec.site.ko}의 ${josa(spec.name.ko, '을를')} 먹어 치웠습니다.`
        : `${said(being, l)} has eaten the ${spec.name.en} at ${spec.site.en}.`,
    ),
    'danger',
  )
}

function drought(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
): WorldState {
  if (isRemoved(state, 'earth')) return state
  const loss = Math.min(
    state.earth.ocean,
    (0.01 + 0.05 * intensity) * reach(site, 0.2),
  )
  return log(
    {
      ...state,
      earth: { ...state.earth, ocean: state.earth.ocean - loss },
    },
    compose((l) =>
      l === 'ko'
        ? `${josa(said(being, l), '이가')} 바닷물을 가뒀습니다. 지구 바다의 ${formatPercent(loss, l, 1)}가 사라졌습니다.`
        : `${said(being, l)} hoards the waters: ${formatPercent(loss, l, 1)} of Earth’s oceans are gone.`,
    ),
    'danger',
  )
}

function emp(
  state: WorldState,
  being: Being,
  site: BattleSite,
  intensity: number,
): WorldState {
  // 생명은 해치지 않음: 지구의 전력망·위성 피해와, 지은 기지의 기계를 고치는 비용만 (지구가 사라져도 기지는 멈춤)
  const earthOk = !isRemoved(state, 'earth')
  const shield = hasProject(state, 'grid-shield') ? 0.5 : 0
  const earthLoss = earthOk
    ? (300 + 4000 * intensity ** 2) * reach(site, 0.1) * (1 - shield)
    : 0
  const colonies = COLONY_KINDS.filter((kind) => hasProject(state, kind))
  const colonyLoss = colonies.length * 120 * intensity * reach(site, 0.3)
  const loss = earthLoss + colonyLoss
  return log(
    { ...state, losses: state.losses + loss },
    compose((l) => {
      const guard =
        shield > 0 && earthOk
          ? l === 'ko'
            ? ' (전력망 보호 장치로 절반을 막음)'
            : ' (grid hardening absorbed half)'
          : ''
      const damage =
        loss > 0
          ? l === 'ko'
            ? ` 피해 ${formatMoney(loss, l)}${guard}.`
            : ` Damage ${formatMoney(loss, l)}${guard}.`
          : ''
      return l === 'ko'
        ? `${said(being, l)}의 전자기 침묵: 생명은 그대로지만 전력망과 위성, 기지의 기계가 멈췄습니다.${damage}`
        : `${said(being, l)}’s electromagnetic silence spares life but stops grids, satellites and colony machinery.${damage}`
    }),
    'danger',
  )
}

/**
 * 재해 하나를 일으킴. intensity는 권능/10에 여파·마무리 배율을 곱한 값(0~1.5)
 */
export function applyCalamity(
  state: WorldState,
  being: Being,
  calamity: Calamity,
  site: BattleSite,
  intensity: number,
  random: () => number,
  finale = false,
): WorldState {
  switch (calamity) {
    case 'flare':
      return flare(state, being, site)
    case 'rain':
      return rain(state, being, site, intensity, random)
    case 'eclipse':
      return eclipse(state, being, site, intensity)
    case 'frost':
      return frost(state, being, site, intensity)
    case 'heat':
      return heat(state, being, site, intensity)
    case 'madness':
      return madness(state, being, site, intensity)
    case 'radiation':
      return radiation(state, being, site, intensity)
    case 'quake':
      return quake(state, being, site, intensity, random)
    case 'devour':
      return devour(state, being, site, finale, intensity, random)
    case 'blessing':
      return blessing(state, being, intensity)
    case 'quench':
      return quench(state, being, intensity)
    case 'scrap':
      return scrap(state, being, site, intensity, random)
    case 'drought':
      return drought(state, being, site, intensity)
    case 'emp':
      return emp(state, being, site, intensity)
    case 'blight':
      return blight(state, being, site, intensity)
  }
}

/* ── 격돌 진행 ────────────────────────────────────── */

/** 다음에 처리할 격돌 사건 시각 (여파·끝) */
export function nextBattleYear(state: WorldState): number {
  let t = Infinity
  for (const b of state.battles) {
    if (b.status !== 'raging') continue
    for (const p of b.pulses) if (!p.done && p.year < t) t = p.year
    if (b.endYear < t) t = b.endYear
  }
  return t
}

const replaceBattle = (state: WorldState, battle: Battle): WorldState => ({
  ...state,
  battles: state.battles.map((b) => (b.id === battle.id ? battle : b)),
})

/** 홀로 강림의 전조는 절반 세기 */
const OMEN_SCALE = 0.5
/** 이긴 쪽의 마무리 배율 */
const FINALE_SCALE = 1.2

/** 이긴 존재가 남기는 것: 혼돈은 삼킴, 질서는 가호, 자연은 대표 권능 */
function aftermath(
  state: WorldState,
  winner: Being,
  site: BattleSite,
  random: () => number,
): WorldState {
  const intensity = (winner.power / 10) * FINALE_SCALE
  if (winner.alignment === 'order')
    return applyCalamity(state, winner, 'blessing', site, intensity, random)
  if (winner.alignment === 'chaos') {
    const victim = devourVictim(site, winner.power, true, (id) =>
      isRemoved(state, id),
    )
    if (victim)
      return applyCalamity(
        state,
        winner,
        'devour',
        site,
        intensity,
        random,
        true,
      )
    const other = winner.calamities.find((c) => c !== 'devour') ?? 'madness'
    return applyCalamity(state, winner, other, site, intensity, random)
  }
  return applyCalamity(
    state,
    winner,
    winner.calamities[0],
    site,
    intensity,
    random,
  )
}

/** 진 쪽의 끝: 질서가 혼돈을 이기면 봉인 */
const fateKey = (winner: Being, loser: Being) =>
  winner.alignment === 'order' && loser.alignment === 'chaos'
    ? 'sealed'
    : 'fallen'

function finish(state: WorldState, battle: Battle): WorldState {
  const a = beingOf(battle.a)
  const b = battle.b ? beingOf(battle.b) : null
  const site = SITE_BY_ID[battle.site]
  const random = seededRandom(battle.seed ^ 0x5bd1e995)
  const winner = b ? (random() < winChance(a, b) ? a : b) : a
  const loser = b ? (winner === a ? b : a) : null
  let s = replaceBattle(state, {
    ...battle,
    status: 'over',
    winner: winner.id,
  })
  const tone: Tone = winner.alignment === 'chaos' ? 'danger' : 'warn'
  s = log(
    s,
    compose((l) => {
      if (!loser)
        return l === 'ko'
          ? `아무도 막지 않아 ${josa(said(a, l), '이가')} ${site.name.ko}에 재앙을 내립니다.`
          : `Unopposed, ${said(a, l)} unleashes its calamity (${site.name.en}).`
      const fate = fateKey(winner, loser)
      const ko = fate === 'sealed' ? '봉인되었습니다' : '쓰러져 물러났습니다'
      const en = fate === 'sealed' ? 'is sealed away' : 'falls and withdraws'
      return l === 'ko'
        ? `${josa(said(a, l), '과와')} ${said(b!, l)}의 격돌이 끝났습니다. ${josa(said(winner, l), '이가')} 이겨 ${josa(said(loser, l), '은는')} ${ko}.`
        : `The clash of ${said(a, l)} and ${said(b!, l)} is over: ${said(winner, l)} wins and ${said(loser, l)} ${en}.`
    }),
    tone,
  )
  return aftermath(s, winner, site, random)
}

/** 때가 된 여파와 끝난 격돌을 처리 */
export function resolveBattles(state: WorldState): WorldState {
  let s = state
  for (const original of state.battles) {
    if (original.status !== 'raging') continue
    let battle = s.battles.find((b) => b.id === original.id)!
    const due = battle.pulses
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.done && p.year <= s.year)
      .sort((x, y) => x.p.year - y.p.year)
    for (const { p, i } of due) {
      battle = {
        ...battle,
        pulses: battle.pulses.map((x, k) =>
          k === i ? { ...x, done: true } : x,
        ),
      }
      s = replaceBattle(s, battle)
      const actor = beingOf(p.actor === 'a' ? battle.a : battle.b!)
      const site = SITE_BY_ID[battle.site]
      const scale = battle.b ? 1 : OMEN_SCALE
      const random = seededRandom(battle.seed + i * 7919)
      s = applyCalamity(
        s,
        actor,
        p.calamity,
        site,
        (actor.power / 10) * scale,
        random,
      )
    }
    if (battle.endYear <= s.year) s = finish(s, battle)
  }
  return s
}

/* ── 미리보기 ─────────────────────────────────────── */

/** 끝나면 남을 일: 이긴 쪽 성향에 따라 (미리보기용) */
export function aftermathPreview(
  state: WorldState,
  winner: Being,
  siteId: SiteId,
): { calamity: Calamity; victim: BodyId | null } {
  const site = SITE_BY_ID[siteId]
  if (winner.alignment === 'order')
    return { calamity: 'blessing', victim: null }
  if (winner.alignment === 'chaos') {
    const victim = devourVictim(site, winner.power, true, (id) =>
      isRemoved(state, id),
    )
    if (victim) return { calamity: 'devour', victim }
    return {
      calamity: winner.calamities.find((c) => c !== 'devour') ?? 'madness',
      victim: null,
    }
  }
  return { calamity: winner.calamities[0], victim: null }
}

export const calamityName = (c: Calamity) => CALAMITIES[c].name
