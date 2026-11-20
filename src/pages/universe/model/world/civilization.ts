/**
 * 문명 단계 정하기 (카르다쇼프 척도): 지구 문명의 단계를 올리거나 내리면 그 단계 문명이 쓰는 에너지와
 * 가진 구조물·함대로 바뀝니다. 올리면 그 단계의 구조물을 바로 완공하고, 내리면 단계가 지은 것만 허뭅니다
 * (직접 지은 구조물은 그대로).
 * 지구에서 쓰는 에너지는 결국 열이 되어 지구에 남으므로(지구가 흡수하는 햇빛 약 1.22×10¹⁷ W에 더해짐)
 * 폐열만큼 지구가 더워집니다. 다이슨 구조물처럼 우주에서 쓰는 에너지는 지구를 데우지 않습니다.
 * '지금'은 자연 성장(해마다 1.5%)으로 돌아가며, 지구에 사는 사람들이 쓰는 에너지의 폐열도 더합니다
 * (더워져 살 수 있는 사람이 줄면 폐열도 줄어 균형을 이룸: selectors의 naturalWasteHeatC).
 */
import { both, compose } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'
import { PROJECT_BY_KIND } from '../projects/catalog'
import type { ProjectKind } from '../projects/catalog'
import type { WorldState } from './types'

export type CivLevelId =
  'ancient' | 'industrial' | 'today' | 'type1' | 'type2' | 'type3'

/** 지구(와 태양) 곁을 도는 함대 규모 */
export type CivFleet = 'none' | 'patrol' | 'armada' | 'grand'

export interface CivLevel {
  id: CivLevelId
  /** 이 단계의 카르다쇼프 척도 */
  k: number
  name: Text
  /** 지구에서 쓰는 에너지 (W). null이면 자연 성장 */
  earthPower: number | null
  /** 태양계 밖에서 더 쓰는 에너지 (W, Ⅲ단계의 은하 에너지) */
  galacticPower?: number
  /** 이 단계 문명이 가진 구조물 (먼저 있어야 하는 구조물은 저절로 더함) */
  structures: ProjectKind[]
  fleet: CivFleet
  summary: Text
}

/** 지구가 흡수하는 햇빛 (W): 폐열이 이만큼에 더해짐 */
export const EARTH_ABSORBED_W = 1.22e17
/** 지구 평균 기온 (K) */
const EARTH_KELVIN = 288.15

const TYPE1: ProjectKind[] = [
  'sentinel',
  'defense-net',
  'grid-shield',
  'space-elevator',
  'moon-base',
  'mars-city',
  'oneill',
]

const TYPE2: ProjectKind[] = [
  ...TYPE1,
  'mars-shield',
  'terraform-mars',
  'titan-base',
  'dyson-swarm',
  'dyson-sphere',
  'ringworld',
  'stellar-engine',
]

export const CIV_LEVELS: CivLevel[] = [
  {
    id: 'ancient',
    k: 0.5,
    name: both('고대 문명', 'Ancient civilisation'),
    earthPower: 1e11,
    structures: [],
    fleet: 'none',
    summary: both(
      '인류 전체가 약 100 GW를 씁니다(고대 로마 무렵). 밤의 지구에 도시 불빛이 거의 없고 우주 관리 예산도 크게 줄어듭니다.',
      'All of humanity uses about 100 GW (around Roman times). The night side shows almost no city lights and the space budget shrinks.',
    ),
  },
  {
    id: 'industrial',
    k: 0.58,
    name: both('산업 혁명기', 'Industrial Revolution'),
    earthPower: 7e11,
    structures: [],
    fleet: 'none',
    summary: both(
      '석탄과 증기의 시대(약 700 GW). 도시 불빛이 드문드문 켜집니다.',
      'The age of coal and steam (about 700 GW); city lights are sparse.',
    ),
  },
  {
    id: 'today',
    k: 0.73,
    name: both('지금', 'Today'),
    earthPower: null,
    structures: [],
    fleet: 'none',
    summary: both(
      '2025년 인류(약 20 TW)에서 해마다 1.5%씩 늘어납니다(자연 성장). 쓰는 에너지는 모두 열이 되어 지구에 남아 2430년 무렵 Ⅰ단계의 폐열(약 6°C)을 넘고, 2600년 무렵에는 더위로 사람이 줄어 쓰는 에너지도 줄면서 지구가 약 47°C에서 멈춥니다. 단계가 지은 구조물은 허뭅니다.',
      'Humanity in 2025 (about 20 TW), growing 1.5% a year on its own. All that energy stays on Earth as heat: around 2430 it passes the Type I waste heat (about 6°C), and by about 2600 the heat thins out the population, and with it the energy use, until Earth settles near 47°C. Anything the higher levels built is taken down.',
    ),
  },
  {
    id: 'type1',
    k: 1,
    name: both('Ⅰ단계 행성 문명', 'Type I · planetary'),
    earthPower: 1e16,
    structures: TYPE1,
    fleet: 'patrol',
    summary: both(
      '행성 하나의 에너지(10¹⁶ W)를 씁니다. 감시 망원경·궤도 방위망·전력망 보호막·우주 엘리베이터·달 기지·화성 도시·오닐 실린더가 서고, 지구 곁을 순찰 함대가 돕니다. 그 에너지가 모두 열이 되어 지구에 남아 폐열로 약 6°C 더워집니다(태양 가림막으로 식힐 수 있음).',
      'Uses a planet’s worth of energy (10¹⁶ W). Survey telescopes, a defence grid, grid shielding, a space elevator, a Moon base, a Mars city and O’Neill cylinders appear, with a patrol fleet circling Earth. All that energy ends up as heat on Earth, warming it by about 6°C (a sunshade can cool it).',
    ),
  },
  {
    id: 'type2',
    k: 2,
    name: both('Ⅱ단계 항성 문명', 'Type II · stellar'),
    earthPower: 1e16,
    structures: TYPE2,
    fleet: 'armada',
    summary: both(
      '태양의 빛을 다 씁니다(약 2.0). 다이슨 스웜과 다이슨 구가 태양을 감싸고 링월드·항성 엔진·타이탄 기지가 서며 화성이 푸르게 바뀌고, 우주전함·우주항공모함·드레드노트 함대가 지구와 태양 곁을 돕니다. 다이슨 구 바깥의 세레스·목성부터는 햇빛이 닿지 않습니다.',
      'Uses all of the Sun’s light (about 2.0). A Dyson swarm and sphere enclose the Sun, a ringworld, stellar engine and Titan base rise, Mars turns green, and battleships, carriers and dreadnoughts circle Earth and the Sun. Beyond the sphere, from Ceres and Jupiter outward, sunlight no longer arrives.',
    ),
  },
  {
    id: 'type3',
    k: 3,
    name: both('Ⅲ단계 은하 문명', 'Type III · galactic'),
    earthPower: 1e16,
    galacticPower: 1e36,
    structures: TYPE2,
    fleet: 'grand',
    summary: both(
      '은하의 에너지(10³⁶ W)를 씁니다. 태양계는 Ⅱ단계와 같고, 이웃 별들도 다이슨 구로 감싸이며 더 큰 함대가 지킵니다.',
      'Uses a galaxy’s energy (10³⁶ W). The Solar System looks as in Type II, nearby stars are wrapped in Dyson spheres too, and a grand fleet stands guard.',
    ),
  },
]

export const CIV_LEVEL_BY_ID = Object.fromEntries(
  CIV_LEVELS.map((c) => [c.id, c]),
) as Record<CivLevelId, CivLevel>

export const isCivLevelId = (id: string): id is CivLevelId =>
  Object.hasOwn(CIV_LEVEL_BY_ID, id)

/** 지금 정한 문명 단계 (자연 성장이면 null) */
export const civLevel = (state: WorldState): CivLevel | null =>
  state.civ.level ? CIV_LEVEL_BY_ID[state.civ.level] : null

/** 먼저 있어야 하는 구조물까지 더해 짓는 순서대로 */
export function withRequirements(kinds: ProjectKind[]): ProjectKind[] {
  const out: ProjectKind[] = []
  const visit = (kind: ProjectKind) => {
    if (out.includes(kind)) return
    for (const need of PROJECT_BY_KIND[kind].requires ?? []) visit(need)
    out.push(kind)
  }
  for (const kind of kinds) visit(kind)
  return out
}

/** 지구에서 쓰는 에너지 power(W)의 폐열로 오르는 지구 기온 (°C, 복사 평형) */
export const wasteHeatC = (power: number) =>
  EARTH_KELVIN * ((1 + power / EARTH_ABSORBED_W) ** 0.25 - 1)

/** 정한 단계의 폐열 (자연 성장이면 0: 자연 성장의 폐열은 selectors의 naturalWasteHeatC) */
export function civWasteHeatC(state: WorldState): number {
  const power = civLevel(state)?.earthPower
  return power ? wasteHeatC(power) : 0
}

/** 문명 단계 이름 한 줄 ('Ⅱ단계 항성 문명 (2.0)') */
export const civTitle = (level: CivLevel): Text =>
  compose((l) => `${level.name[l]} (${level.k.toFixed(level.k < 1 ? 2 : 1)})`)
