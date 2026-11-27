import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'

export type GalaxyObjectKind =
  | 'sun'
  | 'blackHole'
  | 'nebula'
  | 'remnant'
  | 'star'
  | 'cluster'
  | 'satellite'
  | 'magnetar'
  | 'planetarySystem'
  | 'nova'

/** 성운의 빛: 발광(수소 붉은빛), 행성상(산소 청록빛), 반사(별빛 푸른빛), 암흑(뒤의 빛을 가림), 초신성 잔해(실 같은 껍질) */
export type NebulaLook =
  'emission' | 'planetary' | 'reflection' | 'dark' | 'remnant'

/** 폭발 유형: Ia형(백색 왜성 폭발), II·IIb형(무거운 별의 중력 붕괴), 중력 붕괴(세부 유형 모름), 고전·반복 신성 */
export type OutburstType =
  'snIa' | 'snII' | 'snIIb' | 'snCore' | 'classicalNova' | 'recurrentNova'

/** 지구에서 본 폭발 (신성·초신성) */
export interface Outburst {
  /** 빛이 지구에 닿은 해 (반복 신성은 여러 해) */
  years: number[]
  /** 해가 추정값이면 true (기록 없이 잔해의 팽창으로 거슬러 셈) */
  yearApprox?: boolean
  /** 가장 밝을 때의 겉보기 등급 (기록에서 추정한 값 포함, 모르면 없음) */
  peakMag?: number
  type: OutburstType
}

export interface GalaxyObject {
  id: string
  name: Text
  kind: GalaxyObjectKind
  /** 성운이면 3D 구름의 빛깔 */
  look?: NebulaLook
  /** 적경·적위 (도). 태양은 null */
  ra: number | null
  dec: number | null
  distanceLy: number
  /** 신성·초신성이면 폭발 기록 */
  outburst?: Outburst
}

/**
 * 우리 은하의 이름난 천체 (거리는 대략값).
 * 요약·설명·전승은 따로 받는 `details.ts`에 있습니다(3D 워커에 싣지 않음).
 */
export const GALAXY_OBJECTS: GalaxyObject[] = [
  {
    id: 'sun',
    name: both('태양', 'Sun'),
    kind: 'sun',
    ra: null,
    dec: null,
    distanceLy: 0,
  },
  {
    id: 'sgr-a',
    name: both('궁수자리 A*', 'Sagittarius A*'),
    kind: 'blackHole',
    ra: 266.41683,
    dec: -29.00781,
    distanceLy: 26_670,
  },
  {
    id: 'orion-nebula',
    name: both('오리온 대성운 (M42)', 'Orion Nebula (M42)'),
    kind: 'nebula',
    look: 'emission',
    ra: 83.822,
    dec: -5.391,
    distanceLy: 1344,
  },
  {
    id: 'pleiades',
    name: both('플레이아데스 (좀생이별)', 'Pleiades'),
    kind: 'cluster',
    ra: 56.75,
    dec: 24.117,
    distanceLy: 444,
  },
  {
    id: 'crab',
    name: both('게 성운 (M1)', 'Crab Nebula (M1)'),
    kind: 'remnant',
    look: 'remnant',
    ra: 83.633,
    dec: 22.0145,
    distanceLy: 6500,
    outburst: { years: [1054], peakMag: -6, type: 'snCore' },
  },
  {
    id: 'eta-carinae',
    name: both('용골자리 에타', 'Eta Carinae'),
    kind: 'star',
    ra: 161.265,
    dec: -59.685,
    distanceLy: 7500,
  },
  {
    id: 'cygnus-x1',
    name: both('백조자리 X-1', 'Cygnus X-1'),
    kind: 'blackHole',
    ra: 299.59,
    dec: 35.202,
    distanceLy: 7200,
  },
  {
    id: 'gaia-bh3',
    name: both('가이아 BH3', 'Gaia BH3'),
    kind: 'blackHole',
    ra: 294.83,
    dec: 14.93,
    distanceLy: 1926,
  },
  {
    id: 'sgr1806',
    name: both('SGR 1806−20', 'SGR 1806−20'),
    kind: 'magnetar',
    ra: 272.164,
    dec: -20.411,
    distanceLy: 28_000,
  },
  {
    id: 'wr104',
    name: both('울프-레이에 104', 'WR 104'),
    kind: 'star',
    ra: 270.517,
    dec: -23.628,
    distanceLy: 8000,
  },
  {
    id: 'eagle',
    name: both(
      '독수리 성운 (창조의 기둥)',
      'Eagle Nebula (Pillars of Creation)',
    ),
    kind: 'nebula',
    look: 'emission',
    ra: 274.7,
    dec: -13.807,
    distanceLy: 5700,
  },
  {
    id: 'lagoon',
    name: both('석호 성운 (M8)', 'Lagoon Nebula (M8)'),
    kind: 'nebula',
    look: 'emission',
    ra: 270.92,
    dec: -24.38,
    distanceLy: 4_100,
  },
  {
    id: 'trifid',
    name: both('삼렬 성운 (M20)', 'Trifid Nebula (M20)'),
    kind: 'nebula',
    look: 'emission',
    ra: 270.62,
    dec: -23.03,
    distanceLy: 5_200,
  },
  {
    id: 'carina-nebula',
    name: both('용골자리 성운 (NGC 3372)', 'Carina Nebula (NGC 3372)'),
    kind: 'nebula',
    look: 'emission',
    ra: 161.27,
    dec: -59.87,
    distanceLy: 8_500,
  },
  {
    id: 'rosette',
    name: both('장미 성운 (NGC 2237)', 'Rosette Nebula (NGC 2237)'),
    kind: 'nebula',
    look: 'emission',
    ra: 97.98,
    dec: 4.98,
    distanceLy: 5_200,
  },
  {
    id: 'north-america',
    name: both('북아메리카 성운 (NGC 7000)', 'North America Nebula (NGC 7000)'),
    kind: 'nebula',
    look: 'emission',
    ra: 314.75,
    dec: 44.52,
    distanceLy: 2_590,
  },
  {
    id: 'horsehead',
    name: both('말머리 성운 (B33)', 'Horsehead Nebula (B33)'),
    kind: 'nebula',
    look: 'dark',
    ra: 85.25,
    dec: -2.46,
    distanceLy: 1_375,
  },
  {
    id: 'ring',
    name: both('고리 성운 (M57)', 'Ring Nebula (M57)'),
    kind: 'nebula',
    look: 'planetary',
    ra: 283.4,
    dec: 33.03,
    distanceLy: 2_570,
  },
  {
    id: 'helix',
    name: both('나선 성운 (NGC 7293)', 'Helix Nebula (NGC 7293)'),
    kind: 'nebula',
    look: 'planetary',
    ra: 337.41,
    dec: -20.84,
    distanceLy: 650,
  },
  {
    id: 'cats-eye',
    name: both('고양이 눈 성운 (NGC 6543)', 'Cat’s Eye Nebula (NGC 6543)'),
    kind: 'nebula',
    look: 'planetary',
    ra: 269.64,
    dec: 66.63,
    distanceLy: 3_300,
  },
  {
    id: 'dumbbell',
    name: both('아령 성운 (M27)', 'Dumbbell Nebula (M27)'),
    kind: 'nebula',
    look: 'planetary',
    ra: 299.9,
    dec: 22.72,
    distanceLy: 1_360,
  },
  {
    id: 'veil',
    name: both('베일 성운 (백조자리 고리)', 'Veil Nebula (Cygnus Loop)'),
    kind: 'nebula',
    look: 'remnant',
    ra: 312.75,
    dec: 30.72,
    distanceLy: 2_400,
  },
  {
    id: 'tarantula',
    name: both('타란툴라 성운 (30 Doradus)', 'Tarantula Nebula (30 Doradus)'),
    kind: 'nebula',
    look: 'emission',
    ra: 84.68,
    dec: -69.1,
    distanceLy: 160_000,
  },
  {
    id: 'omega-centauri',
    name: both('오메가 센타우리', 'Omega Centauri'),
    kind: 'cluster',
    ra: 201.697,
    dec: -47.4795,
    distanceLy: 17_090,
  },
  {
    id: 'sn1006',
    name: both('SN 1006 잔해', 'SN 1006 remnant'),
    kind: 'remnant',
    look: 'remnant',
    ra: 225.592,
    dec: -42.097,
    distanceLy: 7_200,
    outburst: { years: [1006], peakMag: -7.5, type: 'snIa' },
  },
  {
    id: 'tycho',
    name: both(
      '티코 초신성 잔해 (SN 1572)',
      'Tycho’s supernova remnant (SN 1572)',
    ),
    kind: 'remnant',
    look: 'remnant',
    ra: 6.34,
    dec: 64.141,
    distanceLy: 9_000,
    outburst: { years: [1572], peakMag: -4, type: 'snIa' },
  },
  {
    id: 'kepler',
    name: both(
      '케플러 초신성 잔해 (SN 1604)',
      'Kepler’s supernova remnant (SN 1604)',
    ),
    kind: 'remnant',
    look: 'remnant',
    ra: 262.669,
    dec: -21.487,
    distanceLy: 17_000,
    outburst: { years: [1604], peakMag: -2.5, type: 'snIa' },
  },
  {
    id: 'cas-a',
    name: both('카시오페이아 A', 'Cassiopeia A'),
    kind: 'remnant',
    look: 'remnant',
    ra: 350.858,
    dec: 58.811,
    distanceLy: 11_000,
    outburst: { years: [1680], yearApprox: true, type: 'snIIb' },
  },
  {
    id: 'sn1987a',
    name: both('초신성 SN 1987A', 'Supernova SN 1987A'),
    kind: 'remnant',
    look: 'remnant',
    ra: 83.867,
    dec: -69.27,
    distanceLy: 168_000,
    outburst: { years: [1987], peakMag: 2.9, type: 'snII' },
  },
  {
    id: 't-crb',
    name: both('북쪽왕관자리 T', 'T Coronae Borealis'),
    kind: 'nova',
    ra: 239.876,
    dec: 25.92,
    distanceLy: 3_000,
    outburst: { years: [1866, 1946], peakMag: 2, type: 'recurrentNova' },
  },
  {
    id: 'rs-oph',
    name: both('뱀주인자리 RS', 'RS Ophiuchi'),
    kind: 'nova',
    ra: 267.555,
    dec: -6.708,
    distanceLy: 8_700,
    outburst: {
      years: [1898, 1933, 1958, 1967, 1985, 2006, 2021],
      peakMag: 4.5,
      type: 'recurrentNova',
    },
  },
  {
    id: 'v1500-cyg',
    name: both('백조자리 신성 1975 (V1500 Cyg)', 'Nova Cygni 1975 (V1500 Cyg)'),
    kind: 'nova',
    ra: 317.902,
    dec: 48.151,
    distanceLy: 5_100,
    outburst: { years: [1975], peakMag: 1.7, type: 'classicalNova' },
  },
  {
    id: 'gk-per',
    name: both(
      '페르세우스자리 신성 1901 (GK Per)',
      'Nova Persei 1901 (GK Per)',
    ),
    kind: 'nova',
    ra: 52.8,
    dec: 43.904,
    distanceLy: 1_410,
    outburst: { years: [1901], peakMag: 0.2, type: 'classicalNova' },
  },
  {
    id: 'v603-aql',
    name: both(
      '독수리자리 신성 1918 (V603 Aql)',
      'Nova Aquilae 1918 (V603 Aql)',
    ),
    kind: 'nova',
    ra: 282.228,
    dec: 0.584,
    distanceLy: 1_050,
    outburst: { years: [1918], peakMag: -0.5, type: 'classicalNova' },
  },
  {
    id: 'kepler452',
    name: both('케플러-452', 'Kepler-452'),
    kind: 'planetarySystem',
    ra: 296.004,
    dec: 44.278,
    distanceLy: 1800,
  },
  {
    id: 'lmc',
    name: both('대마젤란 은하', 'Large Magellanic Cloud'),
    kind: 'satellite',
    ra: 80.894,
    dec: -69.756,
    distanceLy: 160_000,
  },
  {
    id: 'smc',
    name: both('소마젤란 은하', 'Small Magellanic Cloud'),
    kind: 'satellite',
    ra: 13.187,
    dec: -72.829,
    distanceLy: 200_000,
  },
]

export const GALAXY_OBJECT_BY_ID = Object.fromEntries(
  GALAXY_OBJECTS.map((o) => [o.id, o]),
) as Record<string, GalaxyObject>

/** 은하 중심에서 태양까지 (광년) */
export const SUN_GALACTOCENTRIC_LY = 26_670
/** 은하 1년 (년) */
export const GALACTIC_YEAR = 2.3e8

/** 드레이크 방정식: N = R* · fp · ne · fl · fi · fc · L */
export interface DrakeInput {
  starFormation: number
  planetFraction: number
  habitablePerSystem: number
  lifeFraction: number
  intelligenceFraction: number
  communicationFraction: number
  lifetimeYears: number
}

export const drake = (d: DrakeInput) =>
  d.starFormation *
  d.planetFraction *
  d.habitablePerSystem *
  d.lifeFraction *
  d.intelligenceFraction *
  d.communicationFraction *
  d.lifetimeYears
