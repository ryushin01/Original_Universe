/**
 * 우주 대전의 전투 계산: 란체스터 제곱 법칙(서로 상대 전력에 비례해 깎임)으로 교전 차례를 미리 계산하고,
 * 차례마다 특수 작전(워프 기습·군체 재생·시간 되감기 등)과 대형 병기의 일격, 가세한 신적 존재의 일격·결투가
 * 끼어듭니다. 시드가 같으면 결과가 같습니다.
 */
import { clamp, seededRandom } from '@/shared/lib'
import { BEING_BY_ID } from '../mythic/catalog'
import type { Being } from '../mythic/catalog'
import { affinity, winChance } from '../mythic/combat'
import {
  FACTION_BY_ID,
  MEGAWEAPONS,
  SPECIALS,
  WEAPONS,
  fleetPower,
} from './catalog'
import type { FactionId, FleetSize, MegaweaponId, SpecialId } from './catalog'

/** 교전 차례 수 (전쟁 기간을 이만큼 나눔) */
export const ROUNDS = 6
/** 처음 전력의 이 비율 아래로 떨어지면 무너져 물러남 */
export const BREAK = 0.3
/** 한 차례에 상대 전력에 비례해 깎이는 정도 */
const ATTRITION = 0.14
/** 메가스트럭처 하나가 더하는 지원 사격 (최대 4개까지 셈) */
const MEGASTRUCTURE_STRIKE = 0.05
/** 증원으로 늘 수 있는 최대 전력 비율 */
const MAX_FRACTION = 1.3

export type Side = 'a' | 'b'

/** 싸움터 밖에서 끼어드는 조건 */
export interface WarSupport {
  /** 지어 둔 메가스트럭처 수 (지구 연방·식민지의 지원 사격) */
  megastructures: number
  /** 싸움터에 개척 기지가 있는지 (식민지 봉기) */
  colonies: boolean
}

export interface RoundPlan {
  /** 전쟁 기간 안의 시점 (0~1) */
  at: number
  /** 이 차례 뒤 남은 전력 (처음 전력에 대한 비율) */
  a: number
  b: number
  /** 이 차례에 터진 특수 작전 */
  specials: RoundEvent[]
  /** 이 차례에 무너진 쪽 */
  broke: Side | null
}

/** 한 편에 가세할 수 있는 신적 존재 수 */
export const MAX_BEINGS = 3

/** 두 세력에 가세하는 신적 존재들(우주적 존재 id, 내세운 순서)과 대형 병기 (없으면 null) */
export interface WarExtras {
  aBeings: string[]
  bBeings: string[]
  aWeapon: MegaweaponId | null
  bWeapon: MegaweaponId | null
}

export const NO_EXTRAS: WarExtras = {
  aBeings: [],
  bBeings: [],
  aWeapon: null,
  bWeapon: null,
}

/** 교전 차례에 터진 일 (신적 존재의 일격·결투면 그 존재와 맞선 존재) */
export interface RoundEvent {
  side: Side
  id: SpecialId
  being?: string
  rival?: string
}

/** 가세한 신적 존재가 상대 함대를 내리치는 차례 */
export const DIVINE_ROUNDS = [1, 4]
/** 두 존재가 모두 있으면 맞붙는 차례 (진 존재는 쓰러져 더는 돕지 못함) */
export const DUEL_ROUND = 2
/** 결투에서 이긴 쪽이 되찾는 기세와 진 쪽이 받는 충격 */
const DUEL_BOOST = 0.02
const DUEL_SHOCK = 0.02
/** 니콜-다이슨 광선이 다이슨 구조물을 지어 두었을 때 더하는 세기 */
const DYSON_BONUS = 0.04

/** 가세한 쪽 함대 전력비의 제곱근 (0.6~1.4배): 작은 함대를 도운 일격은 큰 함대를 덜 깎음 */
const fleetFactor = (ratio: number) => clamp(Math.sqrt(ratio), 0.6, 1.4)

/**
 * 신의 일격: 권능 1~10에 따라 상대 함대 전력의 2.6~8%를 깎음 (함대 전력비를 곱함).
 * 상대 편에도 존재가 버티고 있으면 그 존재와의 상성(오행 상극·빛의 봉인·혼돈의 잠식)을 곱함
 */
export const divineStrike = (being: Being, foe: Being | null, ratio = 1) =>
  Math.min(
    0.12,
    (0.02 + 0.006 * being.power) *
      (foe ? affinity(being.element, foe.element).factor : 1) *
      fleetFactor(ratio),
  )

/**
 * 대형 병기의 한 번 일격: 병기마다의 세기에 두 함대 전력비의 제곱근(0.6~1.4배)을 곱함
 * (작은 함대가 내세운 병기는 큰 함대를 덜 깎음). 니콜-다이슨 광선은 다이슨 구조물이 있으면 더 셈
 */
export const megaweaponStrike = (
  id: MegaweaponId,
  support: WarSupport,
  ratio = 1,
) =>
  (MEGAWEAPONS[id].strike +
    (id === 'nicoll-dyson' && support.megastructures > 0 ? DYSON_BONUS : 0)) *
  fleetFactor(ratio)

export interface WarPlan {
  days: number
  aPower: number
  bPower: number
  rounds: RoundPlan[]
  winner: Side
}

/** 전쟁 기간 (일): 함대가 클수록 길어짐 */
export const warDays = (totalPower: number) =>
  clamp(Math.round(12 + 6 * Math.log2(1 + totalPower / 50)), 10, 60)

/** 이 조건에서 특수 작전이 쓰이는지 */
export function specialApplies(id: SpecialId, support: WarSupport): boolean {
  if (id === 'megastructure') return support.megastructures > 0
  if (id === 'colony-uprising') return support.colonies
  return true
}

/** 전쟁 전체를 미리 계산 (차례별 남은 전력, 특수 작전, 무너진 쪽, 승자) */
export function planWar(
  aId: FactionId,
  bId: FactionId,
  size: FleetSize,
  support: WarSupport,
  seed: number,
  extras: WarExtras = NO_EXTRAS,
): WarPlan {
  const random = seededRandom(seed)
  const factions = { a: FACTION_BY_ID[aId], b: FACTION_BY_ID[bId] }
  const roster = (ids: string[]) =>
    ids.map((id) => BEING_BY_ID[id]).filter((b): b is Being => Boolean(b))
  const beings = { a: roster(extras.aBeings), b: roster(extras.bBeings) }
  const weapons = { a: extras.aWeapon, b: extras.bWeapon }
  /** 결투에 져서 쓰러진 존재 */
  const fallen = new Set<string>()
  const standing = (side: Side) => beings[side].filter((b) => !fallen.has(b.id))
  const power = {
    a: fleetPower(factions.a, size),
    b: fleetPower(factions.b, size),
  }
  const quality = {
    a: WEAPONS[factions.a.weapon].quality,
    b: WEAPONS[factions.b.weapon].quality,
  }
  // 전쟁마다의 운 (지휘·기세): 화력에 ±15%
  const fortune = { a: 0.85 + random() * 0.3, b: 0.85 + random() * 0.3 }
  const left = { a: 1, b: 1 }
  const other = (side: Side): Side => (side === 'a' ? 'b' : 'a')
  const rounds: RoundPlan[] = []
  let broke: Side | null = null
  for (let r = 0; r < ROUNDS && !broke; r++) {
    const specials: RoundPlan['specials'] = []
    for (const side of ['a', 'b'] as const)
      for (const id of factions[side].specials) {
        const special = SPECIALS[id]
        if (!special.rounds.includes(r) || !specialApplies(id, support))
          continue
        specials.push({ side, id })
        const foe = other(side)
        const strike =
          id === 'megastructure'
            ? MEGASTRUCTURE_STRIKE * Math.min(support.megastructures, 4)
            : (special.strike ?? 0)
        left[foe] *= 1 - strike
        if (special.boost)
          left[side] = Math.min(MAX_FRACTION, left[side] + special.boost)
        // 시간 되감기: 지금까지 잃은 전력의 절반을 되돌림
        if (id === 'rewind') left[side] += (1 - left[side]) * 0.5
      }
    // 대형 병기: 정해진 차례에 큰 일격 (방벽·시간 정지포는 제 전력도 되찾음)
    for (const side of ['a', 'b'] as const) {
      const id = weapons[side]
      if (!id || !MEGAWEAPONS[id].rounds.includes(r)) continue
      specials.push({ side, id: 'megaweapon' })
      left[other(side)] *=
        1 - megaweaponStrike(id, support, power[side] / power[other(side)])
      const boost = MEGAWEAPONS[id].boost
      if (boost) left[side] = Math.min(MAX_FRACTION, left[side] + boost)
    }
    // 신적 존재: 일격의 차례에 버티는 존재마다 상대 함대를 내리침
    // (상성은 같은 순번의 상대 존재, 없으면 상대 편의 마지막 존재와 따짐)
    if (DIVINE_ROUNDS.includes(r))
      for (const side of ['a', 'b'] as const) {
        const foes = standing(other(side))
        standing(side).forEach((me, i) => {
          const foe = foes.length ? foes[Math.min(i, foes.length - 1)] : null
          specials.push({ side, id: 'divine-strike', being: me.id })
          left[other(side)] *=
            1 - divineStrike(me, foe, power[side] / power[other(side)])
        })
      }
    // 신들의 결투: 내세운 순서대로 짝지어 1대1 (짝이 없는 존재는 결투 없이 계속 싸움)
    if (r === DUEL_ROUND)
      for (let i = 0; i < Math.min(beings.a.length, beings.b.length); i++) {
        const pair = { a: beings.a[i], b: beings.b[i] }
        const winner: Side = random() < winChance(pair.a, pair.b) ? 'a' : 'b'
        const loser = other(winner)
        fallen.add(pair[loser].id)
        specials.push({
          side: winner,
          id: 'divine-duel',
          being: pair[winner].id,
          rival: pair[loser].id,
        })
        left[winner] = Math.min(MAX_FRACTION, left[winner] + DUEL_BOOST)
        left[loser] *= 1 - DUEL_SHOCK
      }
    // 서로 상대 전력에 비례해 깎임 (같은 전력이면 한 차례에 약 14%)
    // 차례마다의 운: ±30%
    const lossA =
      ATTRITION *
      quality.b *
      fortune.b *
      left.b *
      (power.b / power.a) *
      (0.7 + random() * 0.6)
    const lossB =
      ATTRITION *
      quality.a *
      fortune.a *
      left.a *
      (power.a / power.b) *
      (0.7 + random() * 0.6)
    left.a = Math.max(0, left.a - lossA)
    left.b = Math.max(0, left.b - lossB)
    if (left.a < BREAK || left.b < BREAK)
      broke = left.a / BREAK <= left.b / BREAK ? 'a' : 'b'
    rounds.push({
      at: (r + 1) / (ROUNDS + 1),
      a: left.a,
      b: left.b,
      specials,
      broke,
    })
  }
  const winner: Side = broke
    ? other(broke)
    : left.a * power.a >= left.b * power.b
      ? 'a'
      : 'b'
  return {
    days: warDays(power.a + power.b),
    aPower: power.a,
    bPower: power.b,
    rounds,
    winner,
  }
}

/** 미리보기: 몇 번의 시드로 계산해 a가 이기는 비율 (0~1) */
export function warOdds(
  a: FactionId,
  b: FactionId,
  size: FleetSize,
  support: WarSupport,
  extras: WarExtras = NO_EXTRAS,
  trials = 24,
): number {
  let wins = 0
  for (let k = 0; k < trials; k++)
    if (planWar(a, b, size, support, 9_973 * (k + 1), extras).winner === 'a')
      wins++
  return wins / trials
}

/** 신들의 결투 짝(내세운 순서대로)과 a 쪽 존재가 이길 확률 */
export function duelOdds(
  extras: WarExtras,
): Array<{ a: string; b: string; chance: number }> {
  const out: Array<{ a: string; b: string; chance: number }> = []
  const n = Math.min(extras.aBeings.length, extras.bBeings.length)
  for (let i = 0; i < n; i++) {
    const a = BEING_BY_ID[extras.aBeings[i]]
    const b = BEING_BY_ID[extras.bBeings[i]]
    if (a && b) out.push({ a: a.id, b: b.id, chance: winChance(a, b) })
  }
  return out
}
