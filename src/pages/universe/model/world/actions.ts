import { both, compose } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'
import { clamp, formatMoney, formatSig } from '@/shared/lib'
import { BODIES } from '../solar/bodies'
import type { BodyId } from '../solar/bodies'
import { MAX_YEAR } from '../solar/sun'
import { DEFLECT_METHODS, IMPACTOR_KINDS } from '../hazards/impact'
import type { DeflectMethod } from '../hazards/impact'
import { STORM_CLASSES } from '../hazards/storm'
import type { StormClass } from '../hazards/storm'
import {
  BLAST_KIND_NAME,
  BLAST_SOURCES,
  brightnessKey,
  ozoneBiosphereLoss,
  ozoneFatality,
} from '../hazards/stellar'
import { stellarEngineShiftAu } from '../hazards/flyby'
import { METEOR_SHOWERS, nextPeakYear } from '../hazards/meteors'
import { PROJECT_BY_KIND } from '../projects/catalog'
import type { ProjectKind } from '../projects/catalog'
import { advanceTo, autoIntercept, initialWorld, log } from './engine'
import {
  makeBlast,
  makeFlyby,
  makeImpact,
  makeMission,
  makeStorm,
} from './factory'
import type { FlybyInput, ImpactInput } from './factory'
import { MISSION_BY_ID } from './missions'
import { BEING_BY_ID, SITE_BY_ID, isBeingId, isSiteId } from '../mythic/catalog'
import type { SiteId } from '../mythic/catalog'
import {
  FLEET_SIZES,
  isFactionId,
  isFleetSize,
  isMegaweaponId,
} from '../war/catalog'
import type { FactionId, FleetSize, MegaweaponId } from '../war/catalog'
import {
  MAX_WARS,
  makeWar,
  ragingWars,
  superweaponTargets,
  warTitle,
} from './war'
import {
  MAX_BATTLES,
  battleOf,
  makeBattle,
  opposeBattle,
  ragingBattles,
} from './mythic'
import {
  earthPopulation,
  hasProject,
  isRemoved,
  projectCost,
} from './selectors'
import {
  formatDuration,
  formatKm,
  formatPeople,
  formatSimDate,
  josa,
  nameOf,
} from './text'
import type { MissionId, WorldState } from './types'

export interface ActionResult {
  ok: boolean
  message: Text
  /** 시간 건너뛰기가 목표 시각에 닿기 전에 멈춤 (근접 통과 시작) */
  interrupted?: boolean
}

export interface Outcome {
  state: WorldState
  result: ActionResult
}

const fail = (state: WorldState, ko: string, en: string): Outcome => ({
  state,
  result: { ok: false, message: both(ko, en) },
})

const noMoney = (state: WorldState, cost: number): Outcome => ({
  state,
  result: {
    ok: false,
    message: compose((l) =>
      l === 'ko'
        ? `예산이 모자랍니다. ${formatMoney(cost - state.budget, l)}가 더 필요합니다.`
        : `Not enough budget: ${formatMoney(cost - state.budget, l)} more needed.`,
    ),
  },
})

const done = (state: WorldState, message: Text): Outcome => ({
  state,
  result: { ok: true, message },
})

/* ── 시간 ─────────────────────────────────────────────── */

export function setSpeed(state: WorldState, speedIndex: number): WorldState {
  return { ...state, speedIndex, orbitYear: state.year }
}

/** 미래로 건너뛰기 (가는 동안의 사건을 모두 처리) */
export function jumpTo(state: WorldState, year: number): Outcome {
  if (state.nbody)
    return fail(
      state,
      '근접 통과를 계산하는 동안에는 시간을 건너뛸 수 없습니다.',
      'You cannot skip ahead while a close encounter is being computed.',
    )
  if (state.mission?.status === 'running')
    return fail(
      state,
      '미션 중에는 시간을 건너뛸 수 없습니다.',
      'You cannot skip ahead during a mission.',
    )
  const target = clamp(year, state.year, MAX_YEAR)
  if (target <= state.year)
    return fail(
      state,
      '지난 시점으로는 돌아갈 수 없습니다.',
      'You cannot go back in time.',
    )
  const next = advanceTo(state, target)
  // 건너뛰는 도중 근접 통과가 시작되면 그 시점에서 멈춤 (부른 쪽이 도착으로 여기지 않게 표시)
  if (next.nbody && next.year < target)
    return {
      state: { ...next, orbitYear: next.year },
      result: {
        ok: true,
        interrupted: true,
        message: compose((l) =>
          l === 'ko'
            ? `${formatSimDate(next.year, l)}에 근접 통과가 시작되어 그 시점에서 멈췄습니다. N체 계산이 끝난 뒤 다시 건너뛰세요.`
            : `A close encounter began on ${formatSimDate(next.year, l)}, so the jump stopped there. Skip again once the N-body run ends.`,
        ),
      },
    }
  return done(
    { ...next, orbitYear: next.year },
    compose((l) =>
      l === 'ko'
        ? `${formatSimDate(next.year, l)}(으)로 이동했습니다.`
        : `Moved to ${formatSimDate(next.year, l)}.`,
    ),
  )
}

/* ── 충돌 ─────────────────────────────────────────────── */

export function launchImpact(state: WorldState, input: ImpactInput): Outcome {
  if (isRemoved(state, input.target))
    return fail(
      state,
      '그 천체는 더는 없습니다.',
      'That body no longer exists.',
    )
  const impact = makeImpact(state, input)
  let s: WorldState = {
    ...state,
    impacts: [...state.impacts, impact],
    nextId: state.nextId + 1,
  }
  s = log(
    s,
    compose((l) => {
      const kind = IMPACTOR_KINDS[input.kind].name[l]
      return l === 'ko'
        ? `${impact.designation}: 지름 ${formatKm(input.diameterM / 1000, l)} ${kind}이(가) ${formatDuration(input.warningYears, l)} 뒤 ${nameOf(input.target, l)}에 충돌하는 궤도에 있습니다.`
        : `${impact.designation}: a ${formatKm(input.diameterM / 1000, l)} ${kind.toLowerCase()} will hit ${nameOf(input.target, l)} in ${formatDuration(input.warningYears, l)}.`
    }),
    'warn',
  )
  s = autoIntercept(s)
  return done(
    s,
    compose((l) =>
      l === 'ko'
        ? `${impact.designation}을(를) 충돌 궤도에 올렸습니다.`
        : `${impact.designation} is now on a collision course.`,
    ),
  )
}

export function launchDeflection(
  state: WorldState,
  impactId: number,
  method: DeflectMethod,
  requested: number,
): Outcome {
  // 탐사선은 한 대 단위 (1~20대)
  const count = clamp(Math.round(requested), 1, 20)
  const impact = state.impacts.find((i) => i.id === impactId)
  if (!impact || impact.status !== 'incoming')
    return fail(state, '다가오는 천체가 없습니다.', 'No incoming object.')
  const spec = DEFLECT_METHODS[method]
  const cost = spec.costB * count
  if (state.budget < cost) return noMoney(state, cost)
  if (state.year + spec.travelYears >= impact.impactYear - 0.01)
    return fail(
      state,
      `${spec.name.ko}이(가) 닿기 전에 충돌합니다. 도착까지 ${spec.travelYears}년이 걸립니다.`,
      `It would hit before the ${spec.name.en.toLowerCase()} arrives (${spec.travelYears} years to get there).`,
    )
  const mission = makeMission(state, impact, method, count)
  const s: WorldState = {
    ...state,
    budget: state.budget - cost,
    spent: state.spent + cost,
    nextId: state.nextId + 1,
    impacts: state.impacts.map((i) =>
      i.id === impactId ? { ...i, missions: [...i.missions, mission] } : i,
    ),
  }
  return done(
    log(
      s,
      compose((l) =>
        l === 'ko'
          ? `${impact.designation}에 ${spec.name.ko} ${count}기를 보냈습니다 (${formatMoney(cost, l)}). ${formatSimDate(mission.arriveYear, l)}에 닿아 약 ${formatKm(mission.missKm, l)} 밀어냅니다.`
          : `Sent ${count} × ${spec.name.en.toLowerCase()} to ${impact.designation} (${formatMoney(cost, l)}). Arrives ${formatSimDate(mission.arriveYear, l)}, shifting it ~${formatKm(mission.missKm, l)}.`,
      ),
    ),
    compose((l) =>
      l === 'ko'
        ? `${spec.name.ko} ${count}기를 보냈습니다. 약 ${formatKm(mission.missKm, l)} 밀어냅니다.`
        : `Launched ${count} × ${spec.name.en.toLowerCase()}, worth ~${formatKm(mission.missKm, l)} of shift.`,
    ),
  )
}

/* ── 태양 폭풍 ────────────────────────────────────────── */

export function launchStorm(
  state: WorldState,
  cls: StormClass,
  target: BodyId | 'random',
): Outcome {
  const storm = makeStorm(state, cls, target)
  const spec = STORM_CLASSES[cls]
  let s: WorldState = {
    ...state,
    storms: [...state.storms, { ...storm, announced: true }],
    nextId: state.nextId + 1,
  }
  const earthHit = storm.hits.find((h) => h.body === 'earth')
  s = log(
    s,
    compose((l) => {
      const reach = storm.hits.map((h) => nameOf(h.body, l)).join(', ')
      return l === 'ko'
        ? `태양에서 ${spec.name.ko} 코로나 질량 방출이 일어났습니다 (초속 ${formatSig(spec.speedKms, l)}km). ${reach ? `닿는 곳: ${reach}` : '행성을 비껴 갑니다.'}`
        : `A ${spec.name.en} CME erupts at ${formatSig(spec.speedKms, l)} km/s. ${reach ? `In its path: ${reach}` : 'It misses every planet.'}`
    }),
    'warn',
  )
  return done(
    s,
    compose((l) => {
      if (!earthHit)
        return l === 'ko'
          ? '폭풍이 퍼지기 시작했습니다.'
          : 'The storm is spreading outward.'
      const hours = (earthHit.year - state.year) * 365.25 * 24
      return l === 'ko'
        ? `약 ${formatSig(hours, l, 2)}시간 뒤 지구에 닿습니다.`
        : `It reaches Earth in about ${formatSig(hours, l, 2)} hours.`
    }),
  )
}

/* ── 별 폭발 ──────────────────────────────────────────── */

export function triggerBlast(state: WorldState, sourceId: string): Outcome {
  const source = BLAST_SOURCES.find((s) => s.id === sourceId)
  const blast = makeBlast(state, sourceId)
  if (!source || !blast)
    return fail(state, '알 수 없는 천체입니다.', 'Unknown source.')
  if (state.blasts.some((b) => b.sourceId === sourceId && source.real))
    return fail(state, '이미 폭발했습니다.', 'It has already exploded.')
  const loss = blast.ozoneLoss
  const fatality = ozoneFatality(loss)
  const deaths = earthPopulation(state) * fatality
  let s: WorldState = {
    ...state,
    blasts: [...state.blasts, blast],
    nextId: state.nextId + 1,
    earth: {
      ...state.earth,
      ozone: Math.max(0.05, state.earth.ozone * (1 - loss)),
      popFactor: state.earth.popFactor * (1 - fatality),
      biosphere: Math.max(0, state.earth.biosphere - ozoneBiosphereLoss(loss)),
    },
  }
  const sight = brightnessKey(blast.magnitude)
  s = log(
    s,
    compose((l) => {
      const kind = BLAST_KIND_NAME[source.kind][l]
      const view = {
        flash:
          l === 'ko'
            ? '감마선이 하늘 전체를 훑고 지나갔습니다'
            : 'gamma rays swept the whole sky',
        brighterThanMoon:
          l === 'ko'
            ? '보름달보다 밝게 빛납니다'
            : 'it outshines the full Moon',
        daylight: l === 'ko' ? '낮에도 보입니다' : 'it is visible in daylight',
        bright:
          l === 'ko'
            ? '밤하늘에서 가장 밝은 별들만큼 빛납니다'
            : 'it shines like the brightest stars',
        faint:
          l === 'ko'
            ? '맨눈으로는 겨우 보입니다'
            : 'it is barely visible to the eye',
      }[sight]
      const ozone =
        loss >= 0.01
          ? l === 'ko'
            ? ` 지구 오존층이 ${Math.round(loss * 100)}% 줄었습니다.`
            : ` Earth lost ${Math.round(loss * 100)}% of its ozone.`
          : l === 'ko'
            ? ' 지구에는 거의 영향이 없습니다.'
            : ' Earth is barely affected.'
      const toll =
        deaths >= 1
          ? l === 'ko'
            ? ` 자외선이 늘어 농작물이 줄고 약 ${formatPeople(deaths, l)}이 숨질 것으로 봅니다.`
            : ` Extra UV ruins crops; about ${formatPeople(deaths, l)} may die.`
          : ''
      return l === 'ko'
        ? `${source.name.ko} ${kind} (${formatSig(source.distanceLy, l)}광년): ${view}.${ozone}${toll}`
        : `${source.name.en} ${kind.toLowerCase()} (${formatSig(source.distanceLy, l)} ly): ${view}.${ozone}${toll}`
    }),
    loss >= 0.3 ? 'danger' : loss >= 0.05 ? 'warn' : 'info',
  )
  return done(
    s,
    compose((l) =>
      l === 'ko'
        ? `${josa(source.name.ko, '이가')} 폭발했습니다.`
        : `${source.name.en} has exploded.`,
    ),
  )
}

/* ── 근접 통과 ────────────────────────────────────────── */

export function launchFlyby(state: WorldState, input: FlybyInput): Outcome {
  if (state.flybys.some((f) => f.phase === 'approach' || f.phase === 'nbody'))
    return fail(
      state,
      '이미 다가오는 천체가 있습니다. 지나간 뒤에 다시 시도하세요.',
      'Another body is already approaching. Try again after it passes.',
    )
  const flyby = makeFlyby(state, input)
  const shift = hasProject(state, 'stellar-engine')
    ? Math.min(stellarEngineShiftAu(flyby.closestYear - state.year), 1e6)
    : 0
  const next: WorldState = {
    ...state,
    flybys: [
      ...state.flybys.filter((f) => f.phase !== 'done'),
      { ...flyby, shiftAu: shift },
    ],
    nextId: state.nextId + 1,
  }
  const s = log(
    next,
    compose((l) => {
      const when = formatDuration(flyby.closestYear - state.year, l)
      const closest = formatSig(flyby.closestAu + shift, l, 3)
      const engine =
        shift > 0.01
          ? l === 'ko'
            ? ` 항성 엔진이 태양계를 옮겨 근접 거리를 ${formatSig(shift, l, 2)} AU 늘립니다.`
            : ` The stellar engine moves the Solar System, adding ${formatSig(shift, l, 2)} AU.`
          : ''
      return l === 'ko'
        ? `${flyby.name.ko}: ${when} 뒤 태양에서 ${closest} AU까지 다가옵니다.${engine}`
        : `${flyby.name.en}: closest approach of ${closest} AU in ${when}.${engine}`
    }),
    'warn',
  )
  return done(
    s,
    compose((l) =>
      l === 'ko'
        ? `${josa(flyby.name.ko, '이가')} 태양계로 다가오기 시작했습니다.`
        : `${flyby.name.en} is now heading for the Solar System.`,
    ),
  )
}

/** 사고 실험: 태양을 같은 질량의 블랙홀로 */
export function setSunBlackHole(state: WorldState, on: boolean): Outcome {
  if (state.sunBlackHole === on) return done(state, both('', ''))
  const s = log(
    { ...state, sunBlackHole: on },
    on
      ? both(
          '사고 실험: 태양이 같은 질량의 블랙홀(지름 약 6km)이 되었습니다. 중력은 그대로라 행성 궤도는 변하지 않지만, 빛이 사라져 지구가 얼어 갑니다.',
          'Thought experiment: the Sun is now a black hole of equal mass (~6 km across). Gravity — and every orbit — is unchanged, but without light Earth begins to freeze.',
        )
      : both('태양이 다시 빛납니다.', 'The Sun shines again.'),
    on ? 'danger' : 'good',
  )
  return done(
    s,
    on
      ? both('태양을 블랙홀로 바꿨습니다.', 'The Sun is now a black hole.')
      : both('태양을 되돌렸습니다.', 'The Sun has been restored.'),
  )
}

/* ── 유성우 ───────────────────────────────────────────── */

export function startMeteorStorm(state: WorldState, showerId: string): Outcome {
  const shower = METEOR_SHOWERS.find((s) => s.id === showerId)
  if (!shower) return fail(state, '알 수 없는 유성우입니다.', 'Unknown shower.')
  const peak = nextPeakYear(shower, state.year)
  const s = log(
    {
      ...state,
      meteorStorm: {
        showerId,
        fromYear: peak - 1 / 365.25,
        untilYear: peak + 1.5 / 365.25,
      },
    },
    compose((l) =>
      l === 'ko'
        ? `${shower.parent.ko}이(가) 남긴 촘촘한 먼지 줄기를 지구가 지나갑니다. ${formatSimDate(peak, l)} ${shower.name.ko}가 유성 폭풍이 됩니다.`
        : `Earth will cross a dense dust trail from ${shower.parent.en}: the ${shower.name.en} become a meteor storm on ${formatSimDate(peak, l)}.`,
    ),
    'warn',
  )
  return done(
    s,
    compose((l) =>
      l === 'ko'
        ? `${formatSimDate(peak, l)} 극대에 유성 폭풍이 옵니다.`
        : `A meteor storm will arrive at the ${formatSimDate(peak, l)} peak.`,
    ),
  )
}

/* ── 우주적 존재 ───────────────────────────────────── */

export interface SummonInput {
  being: string
  site: SiteId
  /** 맞설 존재 (없으면 홀로 강림) */
  rival: string | null
}

/** 맞설 존재가 빈 문자열이면 없음(홀로 강림)으로 */
const normalize = (input: SummonInput): SummonInput => ({
  ...input,
  rival: input.rival || null,
})

/** 불러낼 수 있는지 (미리보기와 실행이 같은 판정을 씀) */
export function canSummon(state: WorldState, raw: SummonInput): ActionResult {
  const input = normalize(raw)
  const no = (ko: string, en: string): ActionResult => ({
    ok: false,
    message: both(ko, en),
  })
  if (
    !isBeingId(input.being) ||
    (input.rival !== null && !isBeingId(input.rival))
  )
    return no('알 수 없는 존재입니다.', 'Unknown being.')
  if (!isSiteId(input.site))
    return no('알 수 없는 싸움터입니다.', 'Unknown battlefield.')
  if (input.rival === input.being)
    return no(
      '같은 존재끼리는 싸울 수 없습니다.',
      'A being cannot fight itself.',
    )
  const own = battleOf(state, input.being)
  // 홀로 강림한 존재에게 맞설 존재를 보내는 것만 허용
  const opposing = own && own.b === null && input.rival !== null
  if (own && !opposing)
    return {
      ok: false,
      message: compose((l) =>
        l === 'ko'
          ? `${josa(BEING_BY_ID[input.being].name.ko, '은는')} 이미 싸움터에 나와 있습니다.`
          : `${BEING_BY_ID[input.being].name.en} is already on a battlefield.`,
      ),
    }
  if (input.rival && battleOf(state, input.rival))
    return {
      ok: false,
      message: compose((l) =>
        l === 'ko'
          ? `${josa(BEING_BY_ID[input.rival!].name.ko, '은는')} 이미 다른 곳에서 싸우고 있습니다.`
          : `${BEING_BY_ID[input.rival!].name.en} is already fighting elsewhere.`,
      ),
    }
  if (!opposing && ragingBattles(state).length >= MAX_BATTLES)
    return no(
      `격돌·강림은 한 번에 ${MAX_BATTLES}곳까지만 벌어집니다. 하나가 끝난 뒤에 다시 시도하세요.`,
      `At most ${MAX_BATTLES} clashes or descents can rage at once. Try again when one ends.`,
    )
  const site = SITE_BY_ID[opposing ? own!.site : input.site]
  if (site.anchor && isRemoved(state, site.anchor))
    return no('싸움터가 사라졌습니다.', 'That battlefield no longer exists.')
  return { ok: true, message: both('', '') }
}

/** 우주적 존재를 불러냄: 맞설 존재가 있으면 격돌, 없으면 홀로 강림 (강림한 존재에게 보내면 맞서기) */
export function summon(state: WorldState, raw: SummonInput): Outcome {
  const input = normalize(raw)
  const check = canSummon(state, input)
  if (!check.ok) return { state, result: check }
  const a = BEING_BY_ID[input.being]
  const own = battleOf(state, input.being)
  if (own && input.rival) {
    const rival = BEING_BY_ID[input.rival]
    const battle = opposeBattle(state, own, rival.id)
    const site = SITE_BY_ID[battle.site]
    const s = log(
      {
        ...state,
        battles: state.battles.map((b) => (b.id === own.id ? battle : b)),
      },
      compose((l) =>
        l === 'ko'
          ? `${site.name.ko}에 강림한 ${a.name.ko}에게 ${josa(rival.name.ko, '이가')} 맞섰습니다. 격돌은 ${formatSimDate(battle.endYear, l)}까지 이어집니다.`
          : `${rival.name.en} rises against ${a.name.en} ${site.name.en.toLowerCase()}; the clash lasts until ${formatSimDate(battle.endYear, l)}.`,
      ),
      'warn',
    )
    return done(
      s,
      compose((l) =>
        l === 'ko'
          ? `${josa(rival.name.ko, '이가')} ${a.name.ko}에게 맞섭니다.`
          : `${rival.name.en} now stands against ${a.name.en}.`,
      ),
    )
  }
  const battle = makeBattle(state, {
    a: a.id,
    b: input.rival,
    site: input.site,
  })
  const site = SITE_BY_ID[input.site]
  const rival = input.rival ? BEING_BY_ID[input.rival] : null
  const s = log(
    {
      ...state,
      battles: [...state.battles, battle],
      nextId: state.nextId + 1,
    },
    compose((l) => {
      if (!rival)
        return l === 'ko'
          ? `${josa(a.name.ko, '이가')} ${site.name.ko}에 강림했습니다. ${formatSimDate(battle.endYear, l)}에 재앙을 내립니다. 그 전에 맞설 존재를 보낼 수 있습니다.`
          : `${a.name.en} has descended (${site.name.en}). It will unleash its calamity on ${formatSimDate(battle.endYear, l)} unless something stands against it.`
      return l === 'ko'
        ? `${site.name.ko}에서 ${josa(a.name.ko, '과와')} ${josa(rival.name.ko, '이가')} 맞붙었습니다. 격돌은 ${formatSimDate(battle.endYear, l)}까지 이어집니다.`
        : `${a.name.en} and ${rival.name.en} clash (${site.name.en}) until ${formatSimDate(battle.endYear, l)}.`
    }),
    rival ? 'warn' : 'danger',
  )
  return done(
    s,
    compose((l) =>
      rival
        ? l === 'ko'
          ? `${josa(a.name.ko, '과와')} ${josa(rival.name.ko, '이가')} 격돌을 시작했습니다.`
          : `${a.name.en} and ${rival.name.en} have begun to clash.`
        : l === 'ko'
          ? `${josa(a.name.ko, '이가')} 강림했습니다.`
          : `${a.name.en} has descended.`,
    ),
  )
}

/* ── 건설 ─────────────────────────────────────────────── */

export function canBuild(state: WorldState, kind: ProjectKind): ActionResult {
  const spec = PROJECT_BY_KIND[kind]
  if (state.structures.some((s) => s.kind === kind))
    return {
      ok: false,
      message: both(
        '이미 지었거나 짓고 있습니다.',
        'Already built or under construction.',
      ),
    }
  if (isRemoved(state, spec.anchor))
    return {
      ok: false,
      message: both('지을 곳이 사라졌습니다.', 'Its site no longer exists.'),
    }
  if (
    state.sunBlackHole &&
    (kind === 'dyson-swarm' ||
      kind === 'dyson-sphere' ||
      kind === 'stellar-engine')
  )
    return {
      ok: false,
      message: both('빛나는 태양이 있어야 합니다.', 'Needs a shining Sun.'),
    }
  const missing = spec.requires?.filter((r) => !hasProject(state, r)) ?? []
  if (missing.length > 0)
    return {
      ok: false,
      message: compose((l) =>
        l === 'ko'
          ? `먼저 ${missing.map((m) => PROJECT_BY_KIND[m].name.ko).join(', ')}을(를) 완공해야 합니다.`
          : `Complete ${missing.map((m) => PROJECT_BY_KIND[m].name.en).join(', ')} first.`,
      ),
    }
  const cost = projectCost(state, kind)
  if (state.budget < cost)
    return {
      ok: false,
      message: compose((l) =>
        l === 'ko'
          ? `예산이 모자랍니다 (${formatMoney(cost - state.budget, l)} 더 필요).`
          : `Not enough budget (${formatMoney(cost - state.budget, l)} short).`,
      ),
    }
  return { ok: true, message: both('', '') }
}

export function build(
  state: WorldState,
  kind: ProjectKind,
  instant = false,
): Outcome {
  const check = canBuild(state, kind)
  if (!check.ok) return { state, result: check }
  if (instant && state.mission?.status === 'running')
    return fail(
      state,
      '미션 중에는 바로 완공할 수 없습니다.',
      'Instant build is off during missions.',
    )
  const spec = PROJECT_BY_KIND[kind]
  const cost = projectCost(state, kind)
  const structure = {
    id: state.nextId,
    kind,
    startYear: state.year,
    completeYear: state.year + (instant ? 0 : spec.buildYears),
    done: false,
  }
  let s: WorldState = {
    ...state,
    budget: state.budget - cost,
    spent: state.spent + cost,
    structures: [...state.structures, structure],
    nextId: state.nextId + 1,
  }
  if (instant) {
    s = {
      ...s,
      structures: s.structures.map((x) =>
        x.id === structure.id ? { ...x, done: true } : x,
      ),
    }
    s = log(
      s,
      compose((l) =>
        l === 'ko'
          ? `${spec.site.ko}에 ${josa(spec.name.ko, '을를')} 완공했습니다 (${formatMoney(cost, l)}).`
          : `${spec.name.en} completed at ${spec.site.en} (${formatMoney(cost, l)}).`,
      ),
      'good',
    )
    if (kind === 'defense-net') s = autoIntercept(s)
    return done(
      s,
      compose((l) =>
        l === 'ko'
          ? `${spec.site.ko}에 ${josa(spec.name.ko, '을를')} 완공했습니다.`
          : `${spec.name.en} completed at ${spec.site.en}.`,
      ),
    )
  }
  s = log(
    s,
    compose((l) =>
      l === 'ko'
        ? `${spec.site.ko}에 ${josa(spec.name.ko, '을를')} 짓기 시작했습니다 (${formatMoney(cost, l)}, ${formatSimDate(structure.completeYear, l)} 완공 예정).`
        : `Started ${spec.name.en} at ${spec.site.en} (${formatMoney(cost, l)}, due ${formatSimDate(structure.completeYear, l)}).`,
    ),
  )
  return done(
    s,
    compose((l) =>
      l === 'ko'
        ? `${josa(spec.name.ko, '을를')} 짓기 시작했습니다. ${formatSimDate(structure.completeYear, l)}에 완공합니다.`
        : `${spec.name.en} is under construction until ${formatSimDate(structure.completeYear, l)}.`,
    ),
  )
}

/* ── 미션 ─────────────────────────────────────────────── */

export function startMission(
  _state: WorldState,
  id: MissionId,
  year: number,
): Outcome {
  const spec = MISSION_BY_ID[id]
  const base = initialWorld(year)
  let s: WorldState = {
    ...base,
    budget: spec.budget,
    speedIndex: spec.speedIndex,
    mission: {
      id,
      startYear: year,
      endYear: year + spec.years,
      status: 'running',
      result: null,
      startLosses: 0,
      startBudget: spec.budget,
    },
  }
  s = spec.setup(s)
  s = log(s, spec.brief, 'warn')
  return done(
    s,
    compose((l) =>
      l === 'ko'
        ? `미션 시작: ${spec.name.ko}. 재생을 누르면 시간이 흐릅니다.`
        : `Mission started: ${spec.name.en}. Press play to start the clock.`,
    ),
  )
}

export function quitMission(state: WorldState): Outcome {
  if (!state.mission) return done(state, both('', ''))
  return done(
    { ...state, mission: null, running: false },
    both(
      '미션을 마쳤습니다. 자유 모드로 돌아갑니다.',
      'Mission closed. Back to sandbox mode.',
    ),
  )
}

export const bodyNameText = (id: BodyId): Text => BODIES[id].name

/* ── 우주 대전 ────────────────────────────────────────── */

export interface WarDeclaration {
  a: string
  b: string
  site: string
  size: string
  /** 행성 파괴포 표적 (없으면 쏘지 않음) */
  target: string | null
  /** 가세할 신적 존재·대형 병기 (빼면 없음) */
  aBeing?: string | null
  bBeing?: string | null
  aWeapon?: string | null
  bWeapon?: string | null
}

/** 개전할 수 있는지 (같은 세력끼리·싸움터·표적·동시에 벌어지는 전쟁 수) */
export function canDeclareWar(
  state: WorldState,
  input: WarDeclaration,
): ActionResult {
  const no = (ko: string, en: string): ActionResult => ({
    ok: false,
    message: both(ko, en),
  })
  if (!isFactionId(input.a) || !isFactionId(input.b))
    return no('세력을 고르세요.', 'Choose two factions.')
  if (input.a === input.b)
    return no('서로 다른 두 세력을 고르세요.', 'Choose two different factions.')
  if (!isSiteId(input.site) || !isFleetSize(input.size))
    return no(
      '싸움터와 함대 규모를 고르세요.',
      'Choose a battlefield and fleet size.',
    )
  if (ragingWars(state).length >= MAX_WARS)
    return no(
      `우주 대전은 한 번에 ${MAX_WARS}곳까지만 벌어집니다. 하나가 끝난 뒤에 다시 시도하세요.`,
      `At most ${MAX_WARS} space wars can rage at once. Try again when one ends.`,
    )
  const site = SITE_BY_ID[input.site]
  if (site.anchor && isRemoved(state, site.anchor))
    return no('싸움터가 사라졌습니다.', 'That battlefield no longer exists.')
  if (
    input.target !== null &&
    !superweaponTargets(state, input.site).includes(input.target as BodyId)
  )
    return no(
      '행성 파괴포로 쏠 수 없는 천체입니다.',
      'The planet-killer cannot target that body.',
    )
  for (const id of [input.aBeing, input.bBeing])
    if (id && !isBeingId(id))
      return no('신적 존재를 다시 고르세요.', 'Choose the divine beings again.')
  if (input.aBeing && input.aBeing === input.bBeing)
    return no(
      '한 신적 존재가 두 편에 함께 설 수는 없습니다.',
      'One divine being cannot fight for both sides.',
    )
  for (const id of [input.aWeapon, input.bWeapon])
    if (id && !isMegaweaponId(id))
      return no('대형 병기를 다시 고르세요.', 'Choose the megaweapons again.')
  return { ok: true, message: both('', '') }
}

/** 두 세력의 우주 대전을 일으킴 */
export function declareWar(state: WorldState, input: WarDeclaration): Outcome {
  const check = canDeclareWar(state, input)
  if (!check.ok) return { state, result: check }
  const war = makeWar(state, {
    a: input.a as FactionId,
    b: input.b as FactionId,
    site: input.site as SiteId,
    size: input.size as FleetSize,
    target: input.target as BodyId | null,
    aBeing: input.aBeing || null,
    bBeing: input.bBeing || null,
    aWeapon: (input.aWeapon || null) as MegaweaponId | null,
    bWeapon: (input.bWeapon || null) as MegaweaponId | null,
  })
  const title = warTitle(war)
  const site = SITE_BY_ID[war.site]
  const s = log(
    { ...state, wars: [...state.wars, war], nextId: state.nextId + 1 },
    compose((l) =>
      l === 'ko'
        ? `${site.name.ko}에서 우주 대전이 시작됩니다: ${title.ko} (${FLEET_SIZES[war.size].name.ko}, 전력 ${Math.round(war.aPower)} 대 ${Math.round(war.bPower)}). ${formatSimDate(war.endYear, l)}쯤 끝납니다.`
        : `A space war breaks out ${site.name.en.toLowerCase()}: ${title.en} (${FLEET_SIZES[war.size].name.en.toLowerCase()}, strength ${Math.round(war.aPower)} vs ${Math.round(war.bPower)}). It should end around ${formatSimDate(war.endYear, l)}.`,
    ),
    'danger',
  )
  return done(
    s,
    compose((l) =>
      l === 'ko' ? `개전했습니다: ${title.ko}` : `War declared: ${title.en}`,
    ),
  )
}
