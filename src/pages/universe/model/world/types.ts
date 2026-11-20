import type { Text } from '@/shared/i18n'
import type { Vec3 } from '@/shared/lib'
import type { BodyId } from '../solar/bodies'
import type { OrbitOverride } from '../solar/ephemeris'
import type {
  DeflectMethod,
  ImpactOutcome,
  ImpactorKind,
} from '../hazards/impact'
import type { StormClass } from '../hazards/storm'
import type { BlastKind } from '../hazards/stellar'
import type { IntruderKind } from '../hazards/flyby'
import type { NBody } from '../hazards/nbody'
import type { ProjectKind } from '../projects/catalog'
import type { Calamity, SiteId } from '../mythic/catalog'
import type {
  FactionId,
  FleetSize,
  MegaweaponId,
  SpecialId,
} from '../war/catalog'

export interface Structure {
  id: number
  kind: ProjectKind
  startYear: number
  completeYear: number
  /** 완공을 알렸는지 */
  done: boolean
}

export interface DeflectionMission {
  id: number
  method: DeflectMethod
  count: number
  launchYear: number
  arriveYear: number
  /** 닿은 뒤 만드는 빗나감 거리 (km) */
  missKm: number
  applied: boolean
  /** 행성 방위 요격망이 자동으로 보냄 */
  auto: boolean
}

export interface Impact {
  id: number
  designation: string
  target: BodyId
  kind: ImpactorKind
  diameterM: number
  createdYear: number
  impactYear: number
  /** 다가오는 방향 (단위 벡터, 황도) */
  approach: Vec3
  /** 맞는 곳 (천체 고정 좌표의 단위 벡터) */
  site: Vec3
  requiredKm: number
  missions: DeflectionMission[]
  status: 'incoming' | 'hit' | 'missed'
  outcome?: ImpactOutcome
  deaths?: number
}

export interface StormHit {
  body: BodyId
  year: number
  done: boolean
}

export interface Storm {
  id: number
  cls: StormClass
  launchYear: number
  /** 퍼지는 방향의 황경 (도) */
  longitude: number
  hits: StormHit[]
  /** 분출을 알렸는지 (미션은 미래 분출을 미리 예약함) */
  announced: boolean
}

export interface Blast {
  id: number
  sourceId: string
  kind: BlastKind
  year: number
  distanceLy: number
  ra: number
  dec: number
  ozoneLoss: number
  magnitude: number | null
  /** 잔해가 태양계에 닿는 해 (가까운 경우) */
  debrisYear: number | null
  debrisDone: boolean
}

export interface Flyby {
  id: number
  presetId: string | null
  kind: IntruderKind
  massSun: number
  closestAu: number
  speedKms: number
  inclination: number
  longitude: number
  closestYear: number
  name: Text
  phase: 'approach' | 'nbody' | 'leaving' | 'done'
  /** 항성 엔진으로 늘린 근접 거리 (AU) */
  shiftAu: number
  /** 혜성 소나기가 끝나는 해 */
  showerUntil: number | null
}

export interface Aurora {
  body: BodyId
  untilYear: number
  strength: number
}

export type RemovalReason =
  | 'engulfed'
  | 'ejected'
  | 'captured'
  | 'disrupted'
  | 'collided'
  /** 우주적 존재에게 삼켜짐 */
  | 'devoured'
  /** 우주 대전의 행성 파괴포에 부서짐 */
  | 'destroyed'

export interface EarthState {
  /** 기후 평형을 따라가는 평균 기온 (°C, 충돌 겨울 제외) */
  tempC: number
  /** 충돌 겨울로 잠시 내려간 기온 (°C, 음수) */
  coolingC: number
  /** 남은 바다 (0~1) */
  ocean: number
  /** 오존층 (0~1) */
  ozone: number
  /** 생물 다양성 지수 (0~100) */
  biosphere: number
  /** 재해 뒤 인구가 회복 중인 비율 (0~1) */
  popFactor: number
  /** 궤도 이동으로 넓힌 긴반지름 (AU) */
  shiftAu: number
}

/** 격돌 도중 정해진 시각에 터지는 재해 */
export interface BattlePulse {
  year: number
  actor: 'a' | 'b'
  calamity: Calamity
  done: boolean
}

/** 우주적 존재의 격돌 (b가 없으면 홀로 강림해 정해진 날 재앙을 내림) */
export interface Battle {
  id: number
  a: string
  b: string | null
  site: SiteId
  startYear: number
  endYear: number
  pulses: BattlePulse[]
  status: 'raging' | 'over'
  /** 이긴 존재 (끝난 뒤) */
  winner: string | null
  /** 승패를 정하는 시드 */
  seed: number
  /** 미션이 만든 격돌 */
  tag?: string
}

/** 우주 대전의 교전 차례 (개전할 때 미리 계산, 때가 되면 기록·여파) */
export interface WarRound {
  year: number
  /** 이 차례 뒤 남은 전력 (처음 전력에 대한 비율) */
  a: number
  b: number
  specials: Array<{ side: 'a' | 'b'; id: SpecialId }>
  broke: 'a' | 'b' | null
  done: boolean
}

/** 두 세력 함대의 우주 대전 (스페이스 오페라 모드) */
export interface War {
  id: number
  a: FactionId
  b: FactionId
  site: SiteId
  size: FleetSize
  /** 행성 파괴포의 표적 (없으면 쏘지 않음) */
  target: BodyId | null
  /** 가세한 신적 존재 (우주적 존재 id, 없으면 null) */
  aBeing: string | null
  bBeing: string | null
  /** 내세운 대형 병기 (없으면 null) */
  aWeapon: MegaweaponId | null
  bWeapon: MegaweaponId | null
  startYear: number
  endYear: number
  aPower: number
  bPower: number
  rounds: WarRound[]
  winner: 'a' | 'b'
  status: 'raging' | 'over'
  seed: number
}

export type Tone = 'info' | 'warn' | 'danger' | 'good'

export interface LogEvent {
  id: number
  year: number
  text: Text
  tone: Tone
}

export type MissionId =
  'deflect' | 'solar-max' | 'mars-spring' | 'move-earth' | 'stop-apep'

export interface MissionState {
  id: MissionId
  startYear: number
  endYear: number
  status: 'running' | 'won' | 'lost'
  result: Text | null
  /** 시작할 때의 누적 피해 ($B) */
  startLosses: number
  startBudget: number
}

export interface WorldState {
  year: number
  /** 행성 위치를 계산하는 시각 (빠른 속도에서는 멈춤) */
  orbitYear: number
  running: boolean
  speedIndex: number
  budget: number
  spent: number
  /** 태양 폭풍 등 누적 피해 ($B) */
  losses: number
  structures: Structure[]
  impacts: Impact[]
  storms: Storm[]
  blasts: Blast[]
  flybys: Flyby[]
  auroras: Aurora[]
  /** 근접 통과 중인 N체 계산 (계산용 버퍼라 저장하지 않음) */
  nbody: NBody | null
  overrides: Partial<Record<BodyId, OrbitOverride>>
  removed: Partial<Record<BodyId, { year: number; reason: RemovalReason }>>
  /** 사고 실험: 태양을 같은 질량의 블랙홀로 바꿈 */
  sunBlackHole: boolean
  earth: EarthState
  /** 기지별 생존 비율 (0~1) */
  colonyHealth: Partial<Record<ProjectKind, number>>
  /** 우주적 존재의 격돌과 강림 */
  battles: Battle[]
  /** 세력 함대의 우주 대전 */
  wars: War[]
  /** 태양 잠식: 우주적 존재가 해를 물어 줄어든 햇빛 비율 (0~0.95, 몇 달에 걸쳐 회복) */
  solarDim: number
  /** 유성 폭풍: 극대 앞뒤의 정해진 기간에만 활동도를 키움 */
  meteorStorm: { showerId: string; fromYear: number; untilYear: number } | null
  /** 한 번만 알릴 이정표 */
  milestones: string[]
  events: LogEvent[]
  mission: MissionState | null
  nextId: number
}
