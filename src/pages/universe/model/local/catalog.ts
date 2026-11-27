import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'

export type GalaxyType = 'spiral' | 'elliptical' | 'irregular' | 'dwarf'

export interface LocalGalaxy {
  id: string
  name: Text
  type: GalaxyType
  ra: number
  dec: number
  distanceLy: number
  /** 지름 (광년) */
  diameterLy: number
  /** 국부 은하군 밖의 이웃 은하 (실제 거리에 두고, 멀리서는 크게 빛나는 표지로 보임) */
  outside?: boolean
}

/**
 * 국부 은하군의 주요 은하와 이웃 은하 (거리·크기는 대략값).
 * 설명은 따로 받는 `details.ts`에 있습니다(3D 워커에 싣지 않음).
 */
export const LOCAL_GALAXIES: LocalGalaxy[] = [
  {
    id: 'milky-way',
    name: both('우리 은하', 'Milky Way'),
    type: 'spiral',
    ra: 266.41683,
    dec: -29.00781,
    distanceLy: 26_670,
    diameterLy: 100_000,
  },
  {
    id: 'andromeda',
    name: both('안드로메다 은하 (M31)', 'Andromeda Galaxy (M31)'),
    type: 'spiral',
    ra: 10.685,
    dec: 41.269,
    distanceLy: 2_537_000,
    diameterLy: 152_000,
  },
  {
    id: 'triangulum',
    name: both('삼각형자리 은하 (M33)', 'Triangulum Galaxy (M33)'),
    type: 'spiral',
    ra: 23.462,
    dec: 30.66,
    distanceLy: 2_730_000,
    diameterLy: 61_000,
  },
  {
    id: 'lmc',
    name: both('대마젤란 은하', 'Large Magellanic Cloud'),
    type: 'irregular',
    ra: 80.894,
    dec: -69.756,
    distanceLy: 160_000,
    diameterLy: 32_000,
  },
  {
    id: 'smc',
    name: both('소마젤란 은하', 'Small Magellanic Cloud'),
    type: 'irregular',
    ra: 13.187,
    dec: -72.829,
    distanceLy: 200_000,
    diameterLy: 19_000,
  },
  {
    id: 'm32',
    name: both('M32', 'M32'),
    type: 'elliptical',
    ra: 10.674,
    dec: 40.865,
    distanceLy: 2_490_000,
    diameterLy: 6500,
  },
  {
    id: 'm110',
    name: both('M110', 'M110'),
    type: 'elliptical',
    ra: 10.092,
    dec: 41.685,
    distanceLy: 2_690_000,
    diameterLy: 17_000,
  },
  {
    id: 'ngc185',
    name: both('NGC 185', 'NGC 185'),
    type: 'dwarf',
    ra: 9.742,
    dec: 48.337,
    distanceLy: 2_050_000,
    diameterLy: 8000,
  },
  {
    id: 'ngc147',
    name: both('NGC 147', 'NGC 147'),
    type: 'dwarf',
    ra: 8.3,
    dec: 48.509,
    distanceLy: 2_530_000,
    diameterLy: 10_000,
  },
  {
    id: 'ngc6822',
    name: both('바너드 은하 (NGC 6822)', 'Barnard’s Galaxy (NGC 6822)'),
    type: 'irregular',
    ra: 296.24,
    dec: -14.803,
    distanceLy: 1_630_000,
    diameterLy: 7000,
  },
  {
    id: 'ic1613',
    name: both('IC 1613', 'IC 1613'),
    type: 'irregular',
    ra: 16.199,
    dec: 2.118,
    distanceLy: 2_380_000,
    diameterLy: 10_000,
  },
  {
    id: 'ic10',
    name: both('IC 10', 'IC 10'),
    type: 'irregular',
    ra: 5.072,
    dec: 59.304,
    distanceLy: 2_200_000,
    diameterLy: 5000,
  },
  {
    id: 'wlm',
    name: both('WLM', 'WLM'),
    type: 'irregular',
    ra: 0.492,
    dec: -15.461,
    distanceLy: 3_040_000,
    diameterLy: 8000,
  },
  {
    id: 'leo-a',
    name: both('사자자리 A', 'Leo A'),
    type: 'irregular',
    ra: 149.86,
    dec: 30.746,
    distanceLy: 2_600_000,
    diameterLy: 4000,
  },
  {
    id: 'sagittarius-dsph',
    name: both('궁수자리 왜소 은하', 'Sagittarius Dwarf'),
    type: 'dwarf',
    ra: 283.764,
    dec: -30.48,
    distanceLy: 70_000,
    diameterLy: 10_000,
  },
  {
    id: 'fornax',
    name: both('화로자리 왜소 은하', 'Fornax Dwarf'),
    type: 'dwarf',
    ra: 39.997,
    dec: -34.449,
    distanceLy: 460_000,
    diameterLy: 6000,
  },
  {
    id: 'sculptor',
    name: both('조각가자리 왜소 은하', 'Sculptor Dwarf'),
    type: 'dwarf',
    ra: 15.039,
    dec: -33.709,
    distanceLy: 290_000,
    diameterLy: 3000,
  },
  {
    id: 'leo-i',
    name: both('사자자리 I', 'Leo I'),
    type: 'dwarf',
    ra: 152.117,
    dec: 12.307,
    distanceLy: 820_000,
    diameterLy: 2000,
  },
  {
    id: 'draco',
    name: both('용자리 왜소 은하', 'Draco Dwarf'),
    type: 'dwarf',
    ra: 260.052,
    dec: 57.915,
    distanceLy: 260_000,
    diameterLy: 2700,
  },
  {
    id: 'phoenix',
    name: both('불사조자리 왜소 은하', 'Phoenix Dwarf'),
    type: 'dwarf',
    ra: 27.776,
    dec: -44.445,
    distanceLy: 1_440_000,
    diameterLy: 2000,
  },
  {
    id: 'centaurus-a',
    name: both('센타우루스 A (NGC 5128)', 'Centaurus A (NGC 5128)'),
    type: 'elliptical',
    ra: 201.365,
    dec: -43.019,
    distanceLy: 12_400_000,
    diameterLy: 60_000,
    outside: true,
  },
  {
    id: 'pinwheel',
    name: both('바람개비 은하 (M101)', 'Pinwheel Galaxy (M101)'),
    type: 'spiral',
    ra: 210.802,
    dec: 54.349,
    distanceLy: 20_900_000,
    diameterLy: 170_000,
    outside: true,
  },
  {
    id: 'whirlpool',
    name: both('소용돌이 은하 (M51)', 'Whirlpool Galaxy (M51)'),
    type: 'spiral',
    ra: 202.47,
    dec: 47.195,
    distanceLy: 28_000_000,
    diameterLy: 76_000,
    outside: true,
  },
  {
    id: 'sombrero',
    name: both('솜브레로 은하 (M104)', 'Sombrero Galaxy (M104)'),
    type: 'spiral',
    ra: 189.998,
    dec: -11.623,
    distanceLy: 31_100_000,
    diameterLy: 49_000,
    outside: true,
  },
  {
    id: 'm87',
    name: both('M87 (처녀자리 A)', 'M87 (Virgo A)'),
    type: 'elliptical',
    ra: 187.706,
    dec: 12.391,
    distanceLy: 53_500_000,
    diameterLy: 132_000,
    outside: true,
  },
]

export const LOCAL_GALAXY_BY_ID = Object.fromEntries(
  LOCAL_GALAXIES.map((g) => [g.id, g]),
) as Record<string, LocalGalaxy>

export const GALAXY_TYPE_NAME: Record<GalaxyType, Text> = {
  spiral: both('나선 은하', 'Spiral galaxy'),
  elliptical: both('타원 은하', 'Elliptical galaxy'),
  irregular: both('불규칙 은하', 'Irregular galaxy'),
  dwarf: both('왜소 은하', 'Dwarf galaxy'),
}
