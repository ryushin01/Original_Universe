/**
 * 우주 대전 진행: 개전할 때 교전 차례를 미리 계산해 두고(model/war/combat.ts),
 * 시뮬레이션 시간이 그 차례에 닿으면 기록을 남기고 여파(약탈, 행성 파괴포, 봉인 해제, 잔해)를 일으킵니다.
 */
import { compose } from '@/shared/i18n'
import type { Locale, Text } from '@/shared/i18n'
import { formatMoney, seededRandom } from '@/shared/lib'
import type { BodyId } from '../solar/bodies'
import { BEINGS, BEING_BY_ID, SITE_BY_ID } from '../mythic/catalog'
import type { SiteId } from '../mythic/catalog'
import { PROJECT_BY_KIND } from '../projects/catalog'
import type { ProjectKind } from '../projects/catalog'
import {
  FACTION_BY_ID,
  FLEET_SIZES,
  MEGAWEAPONS,
  MOTIF_IDS,
  SPECIALS,
  factionMotifs,
} from '../war/catalog'
import type {
  Faction,
  FactionId,
  FleetSize,
  MegaweaponId,
  MotifId,
  SpecialId,
} from '../war/catalog'
import { BREAK, NO_EXTRAS, ROUNDS, planWar } from '../war/combat'
import type { RoundEvent, Side, WarExtras, WarSupport } from '../war/combat'
import { withoutBodies } from '../hazards/nbody'
import { makeImpact } from './factory'
import { log } from './log'
import { MAX_BATTLES, battleOf, makeBattle, ragingBattles } from './mythic'
import { hasProject, isRemoved } from './selectors'
import { formatDuration, formatKm, formatSimDate, josa, nameOf } from './text'
import type { Tone, War, WarRound, WorldState } from './types'

/** 한 번에 벌어질 수 있는 우주 대전 수 */
export const MAX_WARS = 2
const DAY = 1 / 365.25
/** 끝난 전쟁의 잔해와 여운을 3D에 남겨 두는 기간 (년) */
export const WAR_AFTERGLOW_YEARS = 20 / 365.25

/** 지원 사격을 하는 메가스트럭처 */
export const MEGASTRUCTURE_KINDS: ProjectKind[] = [
  'space-elevator',
  'dyson-swarm',
  'dyson-sphere',
  'ringworld',
  'stellar-engine',
]

/** 싸움터마다 봉기할 수 있는 개척 기지 */
const COLONY_KINDS: Partial<Record<SiteId, ProjectKind[]>> = {
  earth: ['moon-base', 'oneill'],
  mars: ['mars-city', 'mars-shield', 'terraform-mars'],
}

export const ragingWars = (state: WorldState) =>
  state.wars.filter((w) => w.status === 'raging')

export const warDone = (war: War, year: number) =>
  war.status === 'over' && year - war.endYear > WAR_AFTERGLOW_YEARS

export const factionOf = (id: FactionId): Faction => FACTION_BY_ID[id]

const sideOf = (war: War, side: Side) => factionOf(side === 'a' ? war.a : war.b)
const other = (side: Side): Side => (side === 'a' ? 'b' : 'a')

/** 싸움터 밖에서 끼어드는 조건 (지어 둔 메가스트럭처, 싸움터의 개척 기지) */
export function warSupport(state: WorldState, site: SiteId): WarSupport {
  return {
    megastructures: MEGASTRUCTURE_KINDS.filter((k) => hasProject(state, k))
      .length,
    colonies: (COLONY_KINDS[site] ?? []).some((k) => hasProject(state, k)),
  }
}

export const hasSpecial = (id: FactionId, special: SpecialId) =>
  FACTION_BY_ID[id].specials.includes(special)

/** 행성 파괴포로 쏠 수 있는 싸움터의 천체 (지구와 이미 사라진 천체는 뺌) */
export const superweaponTargets = (state: WorldState, site: SiteId): BodyId[] =>
  SITE_BY_ID[site].victims.filter(
    (id) => id !== 'earth' && !isRemoved(state, id),
  )

export interface WarInput {
  a: FactionId
  b: FactionId
  site: SiteId
  size: FleetSize
  /** 행성 파괴포 표적 (어느 쪽에도 행성 파괴포가 없으면 무시) */
  target: BodyId | null
  /** 가세할 신적 존재들·대형 병기 (빼면 없음) */
  aBeings?: string[]
  bBeings?: string[]
  aWeapon?: MegaweaponId | null
  bWeapon?: MegaweaponId | null
}

/** 전쟁의 신적 존재·대형 병기 묶음 */
export const extrasOf = (
  war: Partial<Pick<War, 'aBeings' | 'bBeings' | 'aWeapon' | 'bWeapon'>>,
): WarExtras => ({
  aBeings: war.aBeings ?? [],
  bBeings: war.bBeings ?? [],
  aWeapon: war.aWeapon ?? null,
  bWeapon: war.bWeapon ?? null,
})

export function makeWar(state: WorldState, input: WarInput): War {
  const seed = state.nextId * 7_368_787 + Math.round(state.year * 1291)
  const extras = extrasOf(input)
  const plan = planWar(
    input.a,
    input.b,
    input.size,
    warSupport(state, input.site),
    seed,
    extras,
  )
  const span = plan.days * DAY
  const rounds: WarRound[] = plan.rounds.map((r) => ({
    year: state.year + r.at * span,
    a: r.a,
    b: r.b,
    specials: r.specials,
    broke: r.broke,
    done: false,
  }))
  const last = rounds[rounds.length - 1]
  const killer =
    hasSpecial(input.a, 'planet-killer') || hasSpecial(input.b, 'planet-killer')
  return {
    id: state.nextId,
    a: input.a,
    b: input.b,
    site: input.site,
    size: input.size,
    target: killer ? input.target : null,
    ...extras,
    startYear: state.year,
    // 한쪽이 무너지면 그 차례 조금 뒤에 끝남
    endYear: last.broke
      ? last.year + (0.6 * span) / (ROUNDS + 1)
      : state.year + span,
    aPower: plan.aPower,
    bPower: plan.bPower,
    rounds,
    winner: plan.winner,
    status: 'raging',
    seed,
  }
}

/** 지금 남은 전력 (처음 전력에 대한 비율, 교전 차례 사이를 이어 줌) */
export function warStrength(war: War, year: number): { a: number; b: number } {
  let prev = { year: war.startYear, a: 1, b: 1 }
  for (const r of war.rounds) {
    if (year < r.year) {
      const t = Math.min(
        1,
        Math.max(0, (year - prev.year) / (r.year - prev.year || 1)),
      )
      return { a: prev.a + (r.a - prev.a) * t, b: prev.b + (r.b - prev.b) * t }
    }
    prev = r
  }
  return { a: prev.a, b: prev.b }
}

/** 그 시각까지 신들의 결투에서 져 쓰러진 존재들 */
export function fallenBeings(war: War, year: number): Set<string> {
  const out = new Set<string>()
  for (const r of war.rounds) {
    if (r.year > year) break
    for (const x of r.specials)
      if (x.id === 'divine-duel' && x.rival) out.add(x.rival)
  }
  return out
}

/** 다음에 처리할 우주 대전 사건 시각 */
export function nextWarYear(state: WorldState): number {
  let next = Infinity
  for (const war of ragingWars(state)) {
    for (const r of war.rounds) if (!r.done) next = Math.min(next, r.year)
    next = Math.min(next, war.endYear)
  }
  return next
}

/* ── 문장 ─────────────────────────────────────────── */

const fname = (id: FactionId, l: Locale) => FACTION_BY_ID[id].name[l]
const siteName = (site: SiteId, l: Locale) =>
  l === 'ko' ? SITE_BY_ID[site].name.ko : SITE_BY_ID[site].name.en.toLowerCase()

/** '지구 연방 우주군 대 아우렐리아 은하 제국' */
export const warTitle = (war: Pick<War, 'a' | 'b'>): Text =>
  compose((l) =>
    l === 'ko'
      ? `${fname(war.a, l)} 대 ${fname(war.b, l)}`
      : `${fname(war.a, l)} vs ${fname(war.b, l)}`,
  )

function arrivalText(id: FactionId, site: SiteId): Text {
  const faction = FACTION_BY_ID[id]
  return compose((l) => {
    const a = fname(id, l)
    const at = siteName(site, l)
    if (l === 'en')
      switch (faction.arrival) {
        case 'cruise':
          return `${a} moves in ${at}.`
        case 'warp':
          return `${a} tears open a warp lane and appears ${at}.`
        case 'swarm':
          return `${a}’s swarm darkens the sky ${at}.`
        case 'awaken':
          return `${a}, dormant ${at} for ages, awakens.`
        case 'rift':
          return `A rift opens ${at} and ${a} crosses over from a parallel universe.`
        case 'time':
          return `A crack in time opens ${at}; ${a} arrives from the future.`
      }
    switch (faction.arrival) {
      case 'cruise':
        return `${a} 함대가 ${at}에 들어섰습니다.`
      case 'warp':
        return `${a} 함대가 워프 항로를 열고 ${at}에 나타났습니다.`
      case 'swarm':
        return `${a}의 벌레떼가 ${at} 하늘을 뒤덮었습니다.`
      case 'awaken':
        return `${at}에 잠들어 있던 ${josa(a, '이가')} 깨어났습니다.`
      case 'rift':
        return `${at}에 차원 균열이 열리고 평행우주의 ${josa(a, '이가')} 넘어왔습니다.`
      case 'time':
        return `${at}에 시간의 틈이 열리며 미래의 ${josa(a, '이가')} 도착했습니다.`
    }
  })
}

const beingName = (id: string | undefined, l: Locale) =>
  id && BEING_BY_ID[id] ? BEING_BY_ID[id].name[l] : ''

/** 한 편의 신적 존재 이름들 ('수르트·오딘') */
const beingNames = (war: War, side: Side, l: Locale) =>
  (side === 'a' ? war.aBeings : war.bBeings)
    .map((id) => beingName(id, l))
    .join(l === 'ko' ? '·' : ', ')

const weaponName = (war: War, side: Side, l: Locale) => {
  const id = side === 'a' ? war.aWeapon : war.bWeapon
  return id ? MEGAWEAPONS[id].name[l] : ''
}

/** 가세한 신적 존재의 강림과 대형 병기의 등장 (첫 교전 차례) */
function championsText(war: War, side: Side): Text | null {
  const faction = side === 'a' ? war.a : war.b
  const count = (side === 'a' ? war.aBeings : war.bBeings).length
  const hasBeing = count > 0
  const hasWeapon = Boolean(side === 'a' ? war.aWeapon : war.bWeapon)
  if (!hasBeing && !hasWeapon) return null
  return compose((l) => {
    const f = fname(faction, l)
    const being = beingNames(war, side, l)
    const weapon = weaponName(war, side, l)
    if (l === 'en') {
      const parts = [
        hasBeing
          ? `${being} ${count > 1 ? 'descend' : 'descends'} to fight for ${f}`
          : '',
        hasWeapon ? `${f}’s ${weapon} rises over the battlefield` : '',
      ].filter(Boolean)
      return `${parts.join('; ')}.`
    }
    const parts = [
      hasBeing ? `${josa(being, '이가')} ${f} 편에 강림했습니다.` : '',
      hasWeapon ? `${f}의 ${josa(weapon, '이가')} 전장에 떠올랐습니다.` : '',
    ].filter(Boolean)
    return parts.join(' ')
  })
}

function specialText(event: RoundEvent, war: War): Text {
  const { id, side } = event
  const me = side === 'a' ? war.a : war.b
  const foe = side === 'a' ? war.b : war.a
  return compose((l) => {
    const a = fname(me, l)
    const b = fname(foe, l)
    const being = beingName(event.being, l)
    const rival = beingName(event.rival, l)
    const weapon = weaponName(war, side, l)
    if (l === 'en')
      switch (id) {
        case 'divine-strike':
          return `${being} smites ${b}’s fleet.`
        case 'divine-duel':
          return `Duel of the gods: ${being} strikes down ${rival}, and ${a} surges forward.`
        case 'megaweapon':
          return `${a}’s ${weapon} fires and tears through ${b}’s line.`
        case 'warp-strike':
          return `${a} drops out of warp on ${b}’s flank and fires a full broadside.`
        case 'carrier-wing':
          return `Fighter wings launch from ${a}’s space carriers.`
        case 'boarding':
          return `${a}’s powered-armour troopers board a ${b} warship and seize its bridge.`
        case 'mech-drop':
          return `${a}’s walking mechs drop onto a ${b} orbital base.`
        case 'hive-regrowth':
          return `${a}’s hive mind grows new swarms to replace its dead.`
        case 'self-repair':
          return `${a}’s cyborg and posthuman ships knit their hulls back together with nanites.`
        case 'psionic':
          return `${a}’s psychic knights shake the minds of ${b}’s captains.`
        case 'arcane-ward':
          return `${a} raises a magitech ward against the barrage.`
        case 'rewind':
          return `${a} rewinds time and brings back part of its lost fleet.`
        case 'rift':
          return `A rift reopens and ${a}’s reinforcements pour in from a parallel universe.`
        case 'lost-tech':
          return `${a}’s ancient citadel wakes a lost weapon and cuts through ${b}’s line.`
        case 'colony-uprising':
          return `Settlers of the local colonies rise up and join ${a}.`
        case 'crimson-barrage':
          return `${a}’s battle line opens a crimson laser barrage on ${b}.`
        case 'shield-wall':
          return `${a} locks its sapphire shields into a wall and holds the line.`
        default:
          return `${a}: ${SPECIALS[id].name.en}.`
      }
    switch (id) {
      case 'divine-strike':
        return `${josa(being, '이가')} ${b} 함대를 내리쳤습니다.`
      case 'divine-duel':
        return `신들의 결투: ${josa(being, '이가')} ${josa(rival, '을를')} 쓰러뜨렸고, ${a}의 기세가 오릅니다.`
      case 'megaweapon':
        return `${a}의 ${josa(weapon, '이가')} 불을 뿜어 ${b}의 전열을 갈랐습니다.`
      case 'warp-strike':
        return `${josa(a, '이가')} 초광속 워프로 ${b}의 측면에 뛰어들어 일제 사격을 퍼부었습니다.`
      case 'carrier-wing':
        return `${a}의 우주항공모함에서 함재기 편대가 출격했습니다.`
      case 'boarding':
        return `${a}의 강화복 강습대가 ${b}의 전함에 뛰어들어 함교를 장악했습니다.`
      case 'mech-drop':
        return `${a}의 보행 기갑 부대가 ${b}의 궤도 기지에 강하했습니다.`
      case 'hive-regrowth':
        return `${a}의 하이브 마인드가 쓰러진 개체만큼 새 떼를 길러 냈습니다.`
      case 'self-repair':
        return `${a}의 사이보그·포스트휴먼 함선들이 나노 기계로 부서진 곳을 메웠습니다.`
      case 'psionic':
        return `${a}의 초능력 기사들이 ${b} 함장들의 정신을 흔들었습니다.`
      case 'arcane-ward':
        return `${josa(a, '이가')} 마도 결계를 펼쳐 포격을 막아 냈습니다.`
      case 'rewind':
        return `${josa(a, '이가')} 시간을 되감아 잃었던 함선 일부를 되돌렸습니다.`
      case 'rift':
        return `차원 균열이 다시 열려 ${a}의 증원 함대가 평행우주에서 넘어왔습니다.`
      case 'lost-tech':
        return `${a}의 고대 요새가 로스트 테크놀러지 병기를 깨워 ${b}의 전열을 갈랐습니다.`
      case 'colony-uprising':
        return `개척 기지 주민들이 봉기해 ${a}에 합류했습니다.`
      case 'crimson-barrage':
        return `${a} 전열이 ${b}에게 붉은 레이저 일제 사격을 퍼부었습니다.`
      case 'shield-wall':
        return `${josa(a, '이가')} 푸른 방어막을 이어 진형을 지켜 냈습니다.`
      default:
        return `${a}: ${SPECIALS[id].name.ko}`
    }
  })
}

/** 이긴 세력이 남기는 결말 한 줄 */
const OUTCOMES: Record<FactionId, Text> = {
  axis: {
    ko: '이 궤도에 악시스의 붉은 깃발이 올랐습니다.',
    en: 'The crimson banner of the Axis rises over this orbit.',
  },
  alliance: {
    ko: '얼라이언스가 전선을 지켜 내고 동맹 행성들을 지켰습니다.',
    en: 'The Alliance holds the line and shields its member worlds.',
  },
  federation: {
    ko: '연방이 궤도의 질서를 되찾았습니다.',
    en: 'The Federation restores order in orbit.',
  },
  colonies: {
    ko: '식민지들이 지구에서의 독립을 선언했습니다.',
    en: 'The colonies declare independence from Earth.',
  },
  empire: {
    ko: '이 궤도에 은하 제국의 깃발이 꽂혔습니다.',
    en: 'The banner of the galactic empire now flies over this orbit.',
  },
  swarm: {
    ko: '군체가 잔해를 먹고 더 불어납니다.',
    en: 'The hive feeds on the wreckage and grows.',
  },
  pirates: {
    ko: '해적들이 노획물을 싣고 성운 속으로 사라졌습니다.',
    en: 'The corsairs vanish into the nebula with their loot.',
  },
  ascendancy: {
    ko: '승천자들이 패배한 승무원들에게 의식 업로드를 권합니다.',
    en: 'The Ascendants offer the defeated crews a mind upload.',
  },
  precursors: {
    ko: '고대 방위 체계가 침입자를 몰아내고 다시 잠듭니다.',
    en: 'The ancient grid drives off the intruders and goes back to sleep.',
  },
  rift: {
    ko: '균열 너머의 지구가 이 우주에 발판을 마련했습니다.',
    en: 'The other Earth gains a foothold in this universe.',
  },
  arcane: {
    ko: '기사단이 결계를 다시 봉인합니다.',
    en: 'The Order seals its wards once more.',
  },
  chrono: {
    ko: '순찰대가 시간선을 바로잡고 미래로 돌아갑니다.',
    en: 'The Wardens mend the timeline and return to the future.',
  },
}

/* ── 여파 ─────────────────────────────────────────── */

/** 해적의 약탈: 남은 예산에서 빼고 피해로 셈 */
function raid(s: WorldState, war: War, side: Side): WorldState {
  const amount = Math.min(
    Math.max(0, s.budget),
    6 * FLEET_SIZES[war.size].scale,
  )
  const name = sideOf(war, side).name
  return log(
    { ...s, budget: s.budget - amount, losses: s.losses + amount },
    compose((l) =>
      l === 'ko'
        ? `${josa(name.ko, '이가')} 보급선을 털어 우주 관리 예산 ${formatMoney(amount, l)}을 빼앗았습니다.`
        : `${name.en} raids the supply lines and steals ${formatMoney(amount, l)} of the space budget.`,
    ),
    'warn',
  )
}

/** 행성 파괴포: 기함이 버티고 있으면 표적 천체를 부숨 */
function planetKiller(
  s: WorldState,
  war: War,
  side: Side,
  round: WarRound,
): WorldState {
  const name = sideOf(war, side).name
  const target = war.target
  const alive = round[side] >= BREAK
  if (!target || !alive || isRemoved(s, target))
    return log(
      s,
      compose((l) =>
        l === 'ko'
          ? `${name.ko}의 행성 파괴포가 ${sideOf(war, other(side)).name.ko}의 함대를 쓸었습니다.`
          : `${name.en}’s planet-killer sweeps ${sideOf(war, other(side)).name.en}’s fleet.`,
      ),
      'warn',
    )
  return log(
    {
      ...s,
      removed: {
        ...s.removed,
        [target]: { year: s.year, reason: 'destroyed' as const },
      },
      nbody: s.nbody ? withoutBodies(s.nbody, new Set([target])) : null,
    },
    compose((l) =>
      l === 'ko'
        ? `${name.ko}의 드레드노트가 행성 파괴포로 ${josa(nameOf(target, l), '을를')} 부쉈습니다.`
        : `${name.en}’s dreadnought fires its planet-killer and shatters ${nameOf(target, l)}.`,
    ),
    'danger',
  )
}

/** 봉인 해제: 싸움터에 혼돈의 우주적 존재가 홀로 강림 (우주적 존재 격돌 체계로 이어짐) */
function summon(s: WorldState, war: War, side: Side): WorldState {
  const name = sideOf(war, side).name
  const free = BEINGS.filter(
    (b) => b.alignment === 'chaos' && !battleOf(s, b.id),
  )
  if (ragingBattles(s).length >= MAX_BATTLES || free.length === 0)
    return log(
      s,
      compose((l) =>
        l === 'ko'
          ? `${josa(name.ko, '이가')} 봉인을 흔들었지만 아무것도 깨어나지 않았습니다.`
          : `${name.en} shakes an ancient seal, but nothing answers.`,
      ),
    )
  const being = free[Math.floor(seededRandom(war.seed + 31)() * free.length)]
  const battle = makeBattle(s, { a: being.id, b: null, site: war.site })
  return log(
    { ...s, battles: [...s.battles, battle], nextId: s.nextId + 1 },
    compose((l) =>
      l === 'ko'
        ? `${josa(name.ko, '이가')} 봉인을 풀어 ${josa(being.name.ko, '을를')} 깨웠습니다. ${formatSimDate(battle.endYear, l)}에 재앙을 내립니다.`
        : `${name.en} breaks a seal and wakes ${being.name.en}; its calamity falls on ${formatSimDate(battle.endYear, l)}.`,
    ),
    'danger',
  )
}

function megastructureSupport(s: WorldState, war: War, side: Side): WorldState {
  const name = sideOf(war, side).name
  const built = MEGASTRUCTURE_KINDS.filter((k) => hasProject(s, k))
  return log(
    s,
    compose((l) => {
      const list = built.map((k) => PROJECT_BY_KIND[k].name[l]).join(', ')
      return l === 'ko'
        ? `지어 둔 메가스트럭처(${list})가 ${name.ko}을(를) 도와 지원 사격을 했습니다.`
        : `Your megastructures (${list}) fire in support of ${name.en}.`
    }),
    'good',
  )
}

/** 부서진 함선 잔해가 싸움터의 천체로 떨어짐 (지구 곁이면 지구로도) */
function wreckage(s: WorldState, war: War): WorldState {
  const site = SITE_BY_ID[war.site]
  if (war.site === 'deep') return s
  const random = seededRandom(war.seed + 101)
  const scale = FLEET_SIZES[war.size].scale
  const local = site.bodies.filter((id) => !isRemoved(s, id))
  const pool: BodyId[] =
    war.site === 'earth' && !isRemoved(s, 'earth') && random() < 0.5
      ? ['earth']
      : local.filter((id) => id !== 'earth')
  if (pool.length === 0) return s
  const target = pool[Math.floor(random() * pool.length)]
  const diameterM = Math.round(30 * Math.sqrt(scale) * (1 + random() * 2))
  const years = 0.05 + random() * 0.3
  const impact = makeImpact(s, {
    target,
    kind: 'iron',
    diameterM,
    warningYears: years,
  })
  return log(
    { ...s, impacts: [...s.impacts, impact], nextId: s.nextId + 1 },
    compose((l) =>
      l === 'ko'
        ? `부서진 함선 잔해(지름 ${formatKm(diameterM / 1000, l)})가 ${nameOf(target, l)}(으)로 떨어집니다 (${formatDuration(years, l)} 뒤).`
        : `A shattered hull ${formatKm(diameterM / 1000, l)} across falls toward ${nameOf(target, l)} (in ${formatDuration(years, l)}).`,
    ),
    target === 'earth' ? 'danger' : 'warn',
  )
}

/* ── 진행 ─────────────────────────────────────────── */

function replaceWar(state: WorldState, war: War): WorldState {
  return {
    ...state,
    wars: state.wars.map((w) => (w.id === war.id ? war : w)),
  }
}

function applyRound(
  state: WorldState,
  war: War,
  round: WarRound,
  index: number,
): WorldState {
  let s = state
  if (index === 0) {
    s = log(s, arrivalText(war.a, war.site), 'warn')
    s = log(s, arrivalText(war.b, war.site), 'warn')
    for (const side of ['a', 'b'] as const) {
      const text = championsText(war, side)
      if (text) s = log(s, text, 'warn')
    }
  }
  for (const event of round.specials) {
    const { side, id } = event
    switch (id) {
      case 'raid':
        s = raid(s, war, side)
        break
      case 'planet-killer':
        s = planetKiller(s, war, side, round)
        break
      case 'summon':
        s = summon(s, war, side)
        break
      case 'megastructure':
        s = megastructureSupport(s, war, side)
        break
      case 'divine-duel':
        s = log(s, specialText(event, war), 'warn')
        break
      default:
        s = log(s, specialText(event, war))
    }
  }
  if (round.broke) {
    const loser = sideOf(war, round.broke).name
    s = log(
      s,
      compose((l) =>
        l === 'ko'
          ? `${loser.ko} 함대가 버티지 못하고 무너져 물러납니다.`
          : `${loser.en}’s fleet breaks and falls back.`,
      ),
      'warn',
    )
  }
  return s
}

function finishWar(state: WorldState, war: War): WorldState {
  let s = replaceWar(state, { ...war, status: 'over' })
  const winner = sideOf(war, war.winner)
  const scale = FLEET_SIZES[war.size].scale
  const reach = SITE_BY_ID[war.site].reach
  const damage = reach > 0.2 ? 4 * scale * reach : 0
  const tone: Tone = damage > 0 ? 'warn' : 'info'
  s = log(
    { ...s, losses: s.losses + damage },
    compose((l) => {
      const cost =
        damage > 0
          ? l === 'ko'
            ? ` 궤도 시설 피해 ${formatMoney(damage, l)}.`
            : ` Orbital damage: ${formatMoney(damage, l)}.`
          : ''
      return l === 'ko'
        ? `우주 대전이 끝났습니다: ${winner.name.ko}의 승리. ${OUTCOMES[winner.id].ko}${cost}`
        : `The space war is over: ${winner.name.en} wins. ${OUTCOMES[winner.id].en}${cost}`
    }),
    tone,
  )
  return wreckage(s, war)
}

/** 때가 된 교전 차례와 끝난 전쟁을 처리 */
export function resolveWars(state: WorldState): WorldState {
  let s = state
  for (const original of ragingWars(state)) {
    let war = s.wars.find((w) => w.id === original.id)!
    war.rounds.forEach((round, index) => {
      if (round.done || round.year > s.year) return
      war = {
        ...war,
        rounds: war.rounds.map((r, k) =>
          k === index ? { ...r, done: true } : r,
        ),
      }
      s = replaceWar(s, war)
      s = applyRound(s, war, round, index)
    })
    if (war.endYear <= s.year) s = finishWar(s, war)
  }
  return s
}

/* ── 미리보기 ─────────────────────────────────────── */

/** 두 세력(과 가세한 신적 존재·대형 병기)이 함께 보여 주는 스페이스 오페라 소재 (목록 순서, 중복 없이) */
export function warMotifs(
  a: FactionId,
  b: FactionId,
  extras: WarExtras = NO_EXTRAS,
): MotifId[] {
  const all = new Set<MotifId>([
    ...factionMotifs(FACTION_BY_ID[a]),
    ...factionMotifs(FACTION_BY_ID[b]),
  ])
  if (extras.aBeings.length || extras.bBeings.length) all.add('cosmic-being')
  for (const id of [extras.aWeapon, extras.bWeapon])
    if (id) for (const motif of MEGAWEAPONS[id].motifs) all.add(motif)
  return MOTIF_IDS.filter((id) => all.has(id))
}
