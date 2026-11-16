import { clamp } from '@/shared/lib'
import { BODIES } from '../solar/bodies'
import type { BodyId } from '../solar/bodies'
import type { BattleSite, Being, Calamity, Element } from './catalog'

/** 오행 상극: 앞이 뒤를 이김 (목극토, 토극수, 수극화, 화극금, 금극목) */
const OVERCOMES: Partial<Record<Element, Element>> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
}
const FIVE_PHASES: Element[] = ['wood', 'fire', 'earth', 'metal', 'water']

/** 상성: 오행 상극, 빛의 봉인, 혼돈의 잠식, 대등 */
export type AffinityKind = 'overcome' | 'seal' | 'corrupt' | 'even'

/** 공격하는 쪽이 받는 상성 배율 */
export function affinity(
  attacker: Element,
  defender: Element,
): { factor: number; kind: AffinityKind } {
  if (OVERCOMES[attacker] === defender) return { factor: 1.5, kind: 'overcome' }
  if (attacker === 'light' && defender === 'void')
    return { factor: 1.8, kind: 'seal' }
  if (attacker === 'void' && FIVE_PHASES.includes(defender))
    return { factor: 1.3, kind: 'corrupt' }
  return { factor: 1, kind: 'even' }
}

/** 상성까지 더한 힘 */
const strength = (self: Being, other: Being) =>
  self.power * affinity(self.element, other.element).factor

/** a가 이길 확률: (권능 × 상성)²의 비 */
export function winChance(a: Being, b: Being): number {
  const sa = strength(a, b) ** 2
  const sb = strength(b, a) ** 2
  return sa / (sa + sb)
}

/** 두 존재 중 상성으로 유리한 쪽과 그 이유 (대등하면 null) */
export function favoured(
  a: Being,
  b: Being,
): { being: Being; kind: AffinityKind } | null {
  const ab = affinity(a.element, b.element)
  const ba = affinity(b.element, a.element)
  if (ab.factor === ba.factor) return null
  return ab.factor > ba.factor
    ? { being: a, kind: ab.kind }
    : { being: b, kind: ba.kind }
}

/** 전승에서 맞서는 사이 */
export const areRivals = (a: Being, b: Being) =>
  Boolean(a.rivals?.includes(b.id) || b.rivals?.includes(a.id))

/** 격돌이 이어지는 날 (홀로 강림이면 재앙까지 남은 날) */
export const battleDays = (a: Being, b: Being | null) =>
  b ? 15 + 7 * (a.power + b.power) : 20 + 12 * a.power

/** 여파가 터지는 횟수 (홀로 강림은 전조 두 번) */
export const pulseCount = (a: Being, b: Being | null) =>
  b ? clamp(Math.round((a.power + b.power) / 3), 2, 6) : 2

export interface PulsePlan {
  /** 시작부터 끝까지 중 어디쯤 (0~1) */
  at: number
  actor: 'a' | 'b'
  calamity: Calamity
}

/**
 * 여파 일정: 고르게 퍼뜨리되 조금씩 어긋나게 하고, 두 존재가 번갈아 권능을 씁니다
 * (각자 대표 재해 → 둘째 재해 순서). 홀로 강림은 같은 존재가 두 번 전조를 보입니다.
 */
export function planPulses(
  a: Being,
  b: Being | null,
  random: () => number,
): PulsePlan[] {
  const count = pulseCount(a, b)
  const turns = { a: 0, b: 0 }
  let actor: 'a' | 'b' = b && random() < 0.5 ? 'b' : 'a'
  const plans: PulsePlan[] = []
  for (let k = 0; k < count; k++) {
    const at = clamp((k + 0.5 + (random() - 0.5) * 0.6) / count, 0.05, 0.95)
    const being = actor === 'a' ? a : b!
    plans.push({ at, actor, calamity: being.calamities[turns[actor] % 2] })
    turns[actor] += 1
    if (b) actor = actor === 'a' ? 'b' : 'a'
  }
  return plans
}

/**
 * 삼킬 수 있는 천체의 크기: 소행성·혜성은 권능 3, 왜소 행성 5, 위성 6, 행성 9 이상.
 * 지구와 목성은 권능 10이 격돌을 이겼을 때만.
 */
export function canDevour(id: BodyId, power: number, finale: boolean): boolean {
  const body = BODIES[id]
  if (id === 'earth' || id === 'jupiter') return finale && power >= 10
  switch (body.kind) {
    case 'comet':
    case 'asteroid':
      return power >= 3
    case 'dwarf':
      return power >= 5
    case 'moon':
      return power >= 6
    case 'planet':
      return finale && power >= 9
    default:
      return false
  }
}

/**
 * 싸움터에서 삼킬 천체. 격돌 도중(여파)에는 가장 작은 것부터,
 * 이겼을 때(마무리)는 삼킬 수 있는 가장 큰 것을 고릅니다.
 */
export function devourVictim(
  site: BattleSite,
  power: number,
  finale: boolean,
  gone: (id: BodyId) => boolean,
): BodyId | null {
  const order = finale ? [...site.victims].reverse() : site.victims
  return order.find((id) => !gone(id) && canDevour(id, power, finale)) ?? null
}
