/**
 * 우주 대전의 전투 계산: 란체스터 제곱 법칙(서로 상대 전력에 비례해 깎임)으로 교전 차례를 미리 계산하고,
 * 차례마다 특수 작전(워프 기습·군체 재생·시간 되감기 등)이 끼어듭니다. 시드가 같으면 결과가 같습니다.
 */
import { clamp, seededRandom } from '@/shared/lib'
import { FACTION_BY_ID, SPECIALS, WEAPONS, fleetPower } from './catalog'
import type { FactionId, FleetSize, SpecialId } from './catalog'

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
  specials: Array<{ side: Side; id: SpecialId }>
  /** 이 차례에 무너진 쪽 */
  broke: Side | null
}

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
): WarPlan {
  const random = seededRandom(seed)
  const factions = { a: FACTION_BY_ID[aId], b: FACTION_BY_ID[bId] }
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
  trials = 24,
): number {
  let wins = 0
  for (let k = 0; k < trials; k++)
    if (planWar(a, b, size, support, 9_973 * (k + 1)).winner === 'a') wins++
  return wins / trials
}
