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

/** 성운의 빛: 발광(수소 붉은빛), 행성상(산소 청록빛), 반사(별빛 푸른빛), 암흑(뒤의 빛을 가림), 초신성 잔해(실 같은 껍질) */
export type NebulaLook =
  'emission' | 'planetary' | 'reflection' | 'dark' | 'remnant'

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
  facts: Text
  note: Text
}

/** 우리 은하의 이름난 천체 (거리는 대략값) */
export const GALAXY_OBJECTS: GalaxyObject[] = [
  {
    id: 'sun',
    name: both('태양', 'Sun'),
    kind: 'sun',
    ra: null,
    dec: null,
    distanceLy: 0,
    facts: both(
      '은하 중심에서 약 2만 6천 광년, 은하 1년 약 2억 3천만 년',
      'About 26,000 ly from the centre; one galactic year ≈ 230 million years',
    ),
    note: both(
      '오리온자리 팔(오리온 돌출부)에 있는 평범한 별. 초속 약 230km로 은하 중심을 돌며, 은하면 위아래로도 오르내립니다.',
      'An ordinary star in the Orion Spur, circling the centre at ~230 km/s while bobbing above and below the disc.',
    ),
  },
  {
    id: 'sgr-a',
    name: both('궁수자리 A*', 'Sagittarius A*'),
    kind: 'blackHole',
    ra: 266.41683,
    dec: -29.00781,
    distanceLy: 26_670,
    facts: both('질량 태양의 약 430만 배', 'About 4.3 million solar masses'),
    note: both(
      '은하 중심의 초대질량 블랙홀. 2022년 사건의 지평선 망원경(EHT)이 그림자를 찍었고, 주변 별의 궤도를 밝힌 연구가 2020년 노벨 물리학상을 받았습니다.',
      'The Galaxy’s central supermassive black hole, imaged by the Event Horizon Telescope in 2022; tracking stars around it won the 2020 Nobel Prize.',
    ),
  },
  {
    id: 'orion-nebula',
    name: both('오리온 대성운 (M42)', 'Orion Nebula (M42)'),
    kind: 'nebula',
    look: 'emission',
    ra: 83.822,
    dec: -5.391,
    distanceLy: 1344,
    facts: both(
      '지름 약 24광년, 별 2,000여 개가 태어나는 중',
      '~24 ly across, ~2,000 stars forming',
    ),
    note: both(
      '맨눈으로 보이는 가장 가까운 큰 별 탄생 지역입니다.',
      'The nearest large star-forming region visible to the naked eye.',
    ),
  },
  {
    id: 'pleiades',
    name: both('플레이아데스 (좀생이별)', 'Pleiades'),
    kind: 'cluster',
    ra: 56.75,
    dec: 24.117,
    distanceLy: 444,
    facts: both(
      '나이 약 1억 년의 산개 성단',
      'An open cluster about 100 million years old',
    ),
    note: both(
      '일곱 자매라고도 부르는 파란 별 무리입니다.',
      'The blue “Seven Sisters.”',
    ),
  },
  {
    id: 'crab',
    name: both('게 성운 (M1)', 'Crab Nebula (M1)'),
    kind: 'remnant',
    look: 'remnant',
    ra: 83.633,
    dec: 22.0145,
    distanceLy: 6500,
    facts: both(
      '1054년 초신성의 잔해, 가운데에 초당 30번 도는 펄서',
      'Remnant of the 1054 supernova with a 30-times-a-second pulsar',
    ),
    note: both(
      '1054년 동아시아 천문 기록에 남은 객성(손님별)의 잔해입니다.',
      'The remains of a “guest star” recorded by East Asian astronomers in 1054.',
    ),
  },
  {
    id: 'eta-carinae',
    name: both('용골자리 에타', 'Eta Carinae'),
    kind: 'star',
    ra: 161.265,
    dec: -59.685,
    distanceLy: 7500,
    facts: both(
      '태양의 약 100배가 넘는 질량의 쌍성',
      'A binary weighing over ~100 Suns',
    ),
    note: both(
      '1843년 대폭발로 하늘에서 두 번째로 밝아졌던 별. 초신성(극초신성) 후보입니다.',
      'Its 1843 Great Eruption made it the sky’s second-brightest star; a hypernova candidate.',
    ),
  },
  {
    id: 'cygnus-x1',
    name: both('백조자리 X-1', 'Cygnus X-1'),
    kind: 'blackHole',
    ra: 299.59,
    dec: 35.202,
    distanceLy: 7200,
    facts: both('태양 질량의 약 21배인 블랙홀', 'A ~21-solar-mass black hole'),
    note: both(
      '처음으로 널리 인정된 블랙홀. 동반성의 가스를 빨아들이며 X선을 냅니다.',
      'The first widely accepted black hole, glowing in X-rays as it feeds on its companion.',
    ),
  },
  {
    id: 'gaia-bh3',
    name: both('가이아 BH3', 'Gaia BH3'),
    kind: 'blackHole',
    ra: 294.83,
    dec: 14.93,
    distanceLy: 1926,
    facts: both(
      '태양 질량의 약 33배, 2024년 발견',
      '~33 solar masses, found in 2024',
    ),
    note: both(
      '우리 은하에서 찾은 가장 무거운 항성 블랙홀. 빛을 내지 않고 동반성의 흔들림으로 찾았습니다.',
      'The heaviest stellar black hole known in the Galaxy, found from its companion’s wobble.',
    ),
  },
  {
    id: 'sgr1806',
    name: both('SGR 1806−20', 'SGR 1806−20'),
    kind: 'magnetar',
    ra: 272.164,
    dec: -20.411,
    distanceLy: 28_000,
    facts: both(
      '자기장이 지구의 1천조 배인 중성자별',
      'A neutron star with a field a quadrillion times Earth’s',
    ),
    note: both(
      '2004년 거대 플레어가 지구 전리층을 흔들었습니다.',
      'Its 2004 giant flare jolted Earth’s ionosphere.',
    ),
  },
  {
    id: 'wr104',
    name: both('울프-레이에 104', 'WR 104'),
    kind: 'star',
    ra: 270.517,
    dec: -23.628,
    distanceLy: 8000,
    facts: both(
      '먼지가 바람개비처럼 감기는 쌍성',
      'A binary wrapped in a pinwheel of dust',
    ),
    note: both(
      '감마선 폭발 후보로 거론되지만 제트 방향은 불확실합니다.',
      'Discussed as a gamma-ray-burst candidate; its jet direction is uncertain.',
    ),
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
    facts: both('높이 약 4광년의 가스 기둥', 'Gas pillars about 4 ly tall'),
    note: both(
      '허블과 제임스 웹 사진으로 유명한 별 탄생 지역입니다.',
      'A stellar nursery made famous by Hubble and JWST.',
    ),
  },
  {
    id: 'lagoon',
    name: both('석호 성운 (M8)', 'Lagoon Nebula (M8)'),
    kind: 'nebula',
    look: 'emission',
    ra: 270.92,
    dec: -24.38,
    distanceLy: 4_100,
    facts: both(
      '가로 약 110광년, 모래시계 모양 별 탄생 지역',
      '~110 ly wide, with an hourglass-shaped stellar nursery',
    ),
    note: both(
      '궁수자리에서 맨눈으로도 희미하게 보이는 큰 발광 성운입니다.',
      'A large emission nebula in Sagittarius, faintly visible to the naked eye.',
    ),
  },
  {
    id: 'trifid',
    name: both('삼렬 성운 (M20)', 'Trifid Nebula (M20)'),
    kind: 'nebula',
    look: 'emission',
    ra: 270.62,
    dec: -23.03,
    distanceLy: 5_200,
    facts: both(
      '발광·반사·암흑 성운이 한자리에',
      'Emission, reflection and dark nebulae in one place',
    ),
    note: both(
      '어두운 띠가 붉은 구름을 셋으로 가르고, 옆에는 푸른 반사 성운이 붙어 있습니다.',
      'Dark lanes split its red glow into three lobes, with a blue reflection nebula beside it.',
    ),
  },
  {
    id: 'carina-nebula',
    name: both('용골자리 성운 (NGC 3372)', 'Carina Nebula (NGC 3372)'),
    kind: 'nebula',
    look: 'emission',
    ra: 161.27,
    dec: -59.87,
    distanceLy: 8_500,
    facts: both(
      '지름 약 300광년, 에타 용골자리를 품음',
      '~300 ly across, home of Eta Carinae',
    ),
    note: both(
      '오리온 대성운보다 네 배쯤 큰 남반구 하늘의 별 탄생 지역입니다.',
      'A southern-sky stellar nursery about four times larger than the Orion Nebula.',
    ),
  },
  {
    id: 'rosette',
    name: both('장미 성운 (NGC 2237)', 'Rosette Nebula (NGC 2237)'),
    kind: 'nebula',
    look: 'emission',
    ra: 97.98,
    dec: 4.98,
    distanceLy: 5_200,
    facts: both(
      '지름 약 130광년, 가운데가 빈 꽃 모양',
      '~130 ly across, a flower with a hollow centre',
    ),
    note: both(
      '가운데 젊은 별무리의 바람이 가스를 밀어내 장미꽃처럼 보입니다.',
      'Winds from the young cluster at its heart have blown out the centre, leaving a rose.',
    ),
  },
  {
    id: 'north-america',
    name: both('북아메리카 성운 (NGC 7000)', 'North America Nebula (NGC 7000)'),
    kind: 'nebula',
    look: 'emission',
    ra: 314.75,
    dec: 44.52,
    distanceLy: 2_590,
    facts: both(
      '북아메리카 대륙을 닮은 붉은 구름',
      'A red cloud shaped like North America',
    ),
    note: both(
      '백조자리 데네브 곁에 있고, 어두운 먼지 띠가 멕시코만처럼 보입니다.',
      'Near Deneb in Cygnus; a dark dust lane plays the Gulf of Mexico.',
    ),
  },
  {
    id: 'horsehead',
    name: both('말머리 성운 (B33)', 'Horsehead Nebula (B33)'),
    kind: 'nebula',
    look: 'dark',
    ra: 85.25,
    dec: -2.46,
    distanceLy: 1_375,
    facts: both(
      '높이 약 3.5광년의 암흑 성운',
      'A dark nebula about 3.5 ly tall',
    ),
    note: both(
      '붉게 빛나는 수소 구름 앞에 차가운 먼지가 말머리 그림자를 드리웁니다.',
      'Cold dust casts a horse-head silhouette against glowing red hydrogen.',
    ),
  },
  {
    id: 'ring',
    name: both('고리 성운 (M57)', 'Ring Nebula (M57)'),
    kind: 'nebula',
    look: 'planetary',
    ra: 283.4,
    dec: 33.03,
    distanceLy: 2_570,
    facts: both(
      '지름 약 1광년의 행성상 성운',
      'A planetary nebula about 1 ly across',
    ),
    note: both(
      '태양 같은 별이 마지막에 벗어 던진 가스 껍질이 고리처럼 보입니다.',
      'The cast-off gas shell of a dying Sun-like star, seen as a ring.',
    ),
  },
  {
    id: 'helix',
    name: both('나선 성운 (NGC 7293)', 'Helix Nebula (NGC 7293)'),
    kind: 'nebula',
    look: 'planetary',
    ra: 337.41,
    dec: -20.84,
    distanceLy: 650,
    facts: both(
      '가장 가까운 큰 행성상 성운',
      'The nearest large planetary nebula',
    ),
    note: both(
      '물병자리에 있으며, 수십억 년 뒤 태양도 이렇게 껍질을 벗습니다.',
      'In Aquarius; billions of years from now the Sun will shed its layers like this.',
    ),
  },
  {
    id: 'cats-eye',
    name: both('고양이 눈 성운 (NGC 6543)', 'Cat’s Eye Nebula (NGC 6543)'),
    kind: 'nebula',
    look: 'planetary',
    ra: 269.64,
    dec: 66.63,
    distanceLy: 3_300,
    facts: both(
      '여러 겹 껍질이 겹친 행성상 성운',
      'A planetary nebula of nested shells',
    ),
    note: both(
      '죽어 가는 별이 수천 년마다 껍질을 벗어 고양이 눈 같은 무늬를 남겼습니다.',
      'A dying star puffed off shells every few thousand years, leaving a cat’s-eye pattern.',
    ),
  },
  {
    id: 'dumbbell',
    name: both('아령 성운 (M27)', 'Dumbbell Nebula (M27)'),
    kind: 'nebula',
    look: 'planetary',
    ra: 299.9,
    dec: 22.72,
    distanceLy: 1_360,
    facts: both(
      '처음 발견된 행성상 성운 (1764년)',
      'The first planetary nebula discovered (1764)',
    ),
    note: both(
      '작은여우자리에 있는 모래시계 모양의 가스 껍질입니다.',
      'An hourglass-shaped shell of gas in Vulpecula.',
    ),
  },
  {
    id: 'veil',
    name: both('베일 성운 (백조자리 고리)', 'Veil Nebula (Cygnus Loop)'),
    kind: 'nebula',
    look: 'remnant',
    ra: 312.75,
    dec: 30.72,
    distanceLy: 2_400,
    facts: both(
      '약 1만~2만 년 전 터진 초신성의 잔해',
      'Remnant of a supernova 10,000–20,000 years ago',
    ),
    note: both(
      '폭발 충격파가 성간 가스를 달구어 실처럼 가는 빛의 띠를 남겼습니다.',
      'The blast wave heated interstellar gas into thin, threadlike filaments.',
    ),
  },
  {
    id: 'tarantula',
    name: both('타란툴라 성운 (30 Doradus)', 'Tarantula Nebula (30 Doradus)'),
    kind: 'nebula',
    look: 'emission',
    ra: 84.68,
    dec: -69.1,
    distanceLy: 160_000,
    facts: both(
      '국부 은하군에서 가장 활발한 별 탄생 지역',
      'The most active star-forming region in the Local Group',
    ),
    note: both(
      '대마젤란 은하 안에 있으며, 우리 은하에 있었다면 그림자가 질 만큼 밝았을 것입니다.',
      'Inside the Large Magellanic Cloud; were it in our Galaxy it would cast shadows.',
    ),
  },
  {
    id: 'omega-centauri',
    name: both('오메가 센타우리', 'Omega Centauri'),
    kind: 'cluster',
    ra: 201.697,
    dec: -47.4795,
    distanceLy: 17_090,
    facts: both(
      '별 약 1천만 개의 구상 성단',
      'A globular cluster of ~10 million stars',
    ),
    note: both(
      '우리 은하가 삼킨 작은 은하의 중심일 수 있으며, 2024년 중간 질량 블랙홀의 증거가 나왔습니다.',
      'Possibly the core of a swallowed dwarf galaxy; evidence for an intermediate-mass black hole emerged in 2024.',
    ),
  },
  {
    id: 'kepler452',
    name: both('케플러-452', 'Kepler-452'),
    kind: 'planetarySystem',
    ra: 296.004,
    dec: 44.278,
    distanceLy: 1800,
    facts: both(
      '지구의 사촌이라 불린 행성 452b',
      'Home of “Earth’s cousin,” planet 452b',
    ),
    note: both(
      '태양형 별의 거주 가능 영역을 도는 지구보다 큰 행성입니다.',
      'A larger-than-Earth planet in a Sun-like star’s habitable zone.',
    ),
  },
  {
    id: 'lmc',
    name: both('대마젤란 은하', 'Large Magellanic Cloud'),
    kind: 'satellite',
    ra: 80.894,
    dec: -69.756,
    distanceLy: 160_000,
    facts: both(
      '우리 은하의 가장 큰 위성 은하',
      'The Galaxy’s largest satellite',
    ),
    note: both(
      '1987년 초신성 SN 1987A가 터진 곳입니다.',
      'Where supernova SN 1987A exploded.',
    ),
  },
  {
    id: 'smc',
    name: both('소마젤란 은하', 'Small Magellanic Cloud'),
    kind: 'satellite',
    ra: 13.187,
    dec: -72.829,
    distanceLy: 200_000,
    facts: both(
      '남반구 하늘에서 맨눈으로 보이는 위성 은하',
      'A satellite galaxy visible from the southern hemisphere',
    ),
    note: both(
      '대마젤란 은하와 기체 다리로 이어져 있습니다.',
      'Linked to the Large Cloud by a bridge of gas.',
    ),
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
