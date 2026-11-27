import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'

/** 국부 은하군·이웃 은하의 설명 (3D 워커와 첫 화면 묶음에 싣지 않고, 정보 카드가 처음 필요할 때 따로 받음) */
export interface LocalDetail {
  note: Text
  /** 중심 블랙홀 */
  blackHole?: Text
  /** 이 은하에서 터진 이름난 초신성 */
  supernova?: Text
  /** 신화·역사 기록 (직접 쓴 짧은 설명) */
  lore?: Text
}

export const LOCAL_DETAILS: Record<string, LocalDetail> = {
  'milky-way': {
    note: both(
      '별 1천억~4천억 개의 막대 나선 은하. 암흑 물질을 합친 질량은 태양의 약 1조 배입니다.',
      'A barred spiral of 100–400 billion stars; with dark matter it weighs about a trillion Suns.',
    ),
    blackHole: both(
      '궁수자리 A*: 태양의 약 430만 배 (2022년 EHT 영상)',
      'Sagittarius A*: ~4.3 million Suns (EHT image, 2022)',
    ),
    lore: both(
      '우리나라에서는 은하수를 미리내(용의 냇물)라 불렀고, 견우와 직녀를 갈라놓은 하늘의 강으로 여겼습니다.',
      'Koreans called it Mirinae, the dragon’s stream — the river of sky that parts the Cowherd from the Weaver Girl.',
    ),
  },
  andromeda: {
    note: both(
      '초속 약 110km로 다가오는 가장 가까운 큰 은하. 약 45억 년 뒤 가까이 스칠 수 있고, 100억 년 안에 합쳐질 확률은 약 50%로 봅니다(2025년 연구).',
      'The nearest large galaxy, approaching at ~110 km/s. A close pass may come in ~4.5 billion years; a merger within 10 billion years has roughly even odds (2025 study).',
    ),
    lore: both(
      '964년 페르시아 천문학자 알수피가 ‘작은 구름’으로 처음 기록했습니다. 1920년대 허블이 이 안의 세페이드 변광성으로 거리를 재어, 우리 은하 밖의 다른 은하임을 밝혔습니다.',
      'First recorded as a “little cloud” by the Persian astronomer al-Sufi in 964; in the 1920s Hubble used its Cepheid variables to show it is a separate galaxy.',
    ),
  },
  triangulum: {
    note: both(
      '국부 은하군에서 세 번째로 큰 나선 은하입니다.',
      'The third-largest spiral in the Local Group.',
    ),
  },
  lmc: {
    note: both(
      '우리 은하의 가장 큰 위성 은하로, 약 20억 년 뒤 우리 은하와 충돌할 수 있습니다.',
      'Our largest satellite; it may collide with the Milky Way in ~2 billion years.',
    ),
  },
  smc: {
    note: both(
      '대마젤란 은하와 함께 우리 은하를 돕니다.',
      'Orbits the Galaxy together with the Large Cloud.',
    ),
  },
  m32: {
    note: both(
      '안드로메다의 작고 빽빽한 타원 위성 은하입니다.',
      'A compact elliptical satellite of Andromeda.',
    ),
  },
  m110: {
    note: both(
      '안드로메다의 왜소 타원 은하입니다.',
      'A dwarf elliptical companion of Andromeda.',
    ),
  },
  ngc185: {
    note: both(
      '안드로메다의 왜소 구형 은하입니다.',
      'A dwarf spheroidal satellite of Andromeda.',
    ),
  },
  ngc147: {
    note: both(
      '안드로메다 둘레의 왜소 은하입니다.',
      'A dwarf galaxy around Andromeda.',
    ),
  },
  ngc6822: {
    note: both(
      '별 탄생이 활발한 불규칙 은하입니다.',
      'A star-forming irregular galaxy.',
    ),
  },
  ic1613: {
    note: both(
      '먼지가 거의 없어 별을 또렷이 볼 수 있는 왜소 불규칙 은하입니다.',
      'A nearly dust-free dwarf irregular galaxy.',
    ),
  },
  ic10: {
    note: both(
      '국부 은하군에서 별이 가장 활발히 태어나는 폭발적 항성 생성 은하입니다.',
      'The Local Group’s only starburst galaxy.',
    ),
  },
  wlm: {
    note: both(
      '국부 은하군 가장자리의 외딴 왜소 은하입니다.',
      'An isolated dwarf at the Local Group’s edge.',
    ),
  },
  'leo-a': {
    note: both(
      '늦게 별을 만들기 시작한 젊은 왜소 은하입니다.',
      'A dwarf that began forming stars late.',
    ),
  },
  'sagittarius-dsph': {
    note: both(
      '우리 은하의 조석력에 길게 찢겨 흡수되는 중입니다.',
      'Being shredded and absorbed by the Milky Way’s tides.',
    ),
  },
  fornax: {
    note: both(
      '구상 성단 여섯 개를 거느린 왜소 구형 은하입니다.',
      'A dwarf spheroidal with six globular clusters.',
    ),
  },
  sculptor: {
    note: both(
      '처음 발견된 왜소 구형 은하입니다 (1937).',
      'The first dwarf spheroidal discovered (1937).',
    ),
  },
  'leo-i': {
    note: both(
      '밝은 별 레굴루스 바로 옆에 있어 찾기 어렵습니다.',
      'Hidden in the glare of nearby Regulus.',
    ),
  },
  draco: {
    note: both(
      '암흑 물질이 아주 많은 은하로 꼽힙니다.',
      'One of the most dark-matter-dominated galaxies known.',
    ),
  },
  phoenix: {
    note: both(
      '구형 은하와 불규칙 은하의 중간 모습입니다.',
      'A transition between spheroidal and irregular dwarfs.',
    ),
  },
  'centaurus-a': {
    note: both(
      '가장 가까운 전파 은하. 먼지 띠를 두른 거대 타원 은하로, 중심 블랙홀이 뿜은 제트가 만든 전파 돌출부가 100만 광년 가까이 뻗어 있습니다.',
      'The nearest radio galaxy: a dust-lane giant elliptical whose black-hole jets inflate radio lobes reaching nearly a million light-years.',
    ),
    blackHole: both('태양의 약 5,500만 배', '~55 million Suns'),
  },
  pinwheel: {
    note: both(
      '우리 은하보다 큰 앞면 나선 은하. 2011년 Ia형 초신성 SN 2011fe가 터졌습니다.',
      'A face-on spiral larger than the Milky Way, host of the 2011 type Ia supernova SN 2011fe.',
    ),
    supernova: both(
      'SN 2011fe (Ia형): 2011년 8월 24일 발견, 가장 밝을 때 약 10등급으로 쌍안경에도 보였습니다. 터진 지 하루도 안 되어 찾아 Ia형 초신성 연구의 기준이 되었습니다.',
      'SN 2011fe (type Ia): found on 24 August 2011, peaking near magnitude 10 — within binocular reach. Caught less than a day after it exploded, it became a benchmark for type Ia studies.',
    ),
  },
  whirlpool: {
    note: both(
      '동반 은하 NGC 5195와 끌어당기며 또렷한 나선팔을 그린 은하. 나선 구조가 처음 그려진 은하입니다(1845년).',
      'A grand-design spiral tugged by its companion NGC 5195 — the first galaxy whose spiral shape was drawn (1845).',
    ),
  },
  sombrero: {
    note: both(
      '밝은 팽대부와 옆에서 본 먼지 띠가 챙 넓은 모자처럼 보입니다. 중심 블랙홀은 태양의 약 10억 배입니다.',
      'A bright bulge and edge-on dust lane make it look like a broad-brimmed hat; its central black hole weighs ~1 billion Suns.',
    ),
    blackHole: both('태양의 약 10억 배', '~1 billion Suns'),
  },
  m87: {
    note: both(
      '처녀자리 은하단 한가운데의 거대 타원 은하. 별 수조 개와 구상 성단 1만여 개를 거느립니다.',
      'The giant elliptical at the heart of the Virgo Cluster, with trillions of stars and some 10,000 globular clusters.',
    ),
    blackHole: both(
      'M87*: 태양의 약 65억 배. 2019년 사건의 지평선 망원경(EHT)이 인류 최초로 블랙홀의 그림자를 찍었습니다.',
      'M87*: ~6.5 billion Suns. In 2019 the Event Horizon Telescope captured the first image of a black hole’s shadow.',
    ),
    lore: both(
      '중심 블랙홀에서 뿜는 제트는 약 5,000광년 길이로, 1918년 허버 커티스가 ‘이상한 곧은 빛줄기’로 처음 기록했습니다.',
      'Its black hole’s jet stretches ~5,000 light-years; Heber Curtis first noted this “curious straight ray” in 1918.',
    ),
  },
}
