import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'

/** 우리 은하 천체의 설명 (3D 워커와 첫 화면 묶음에 싣지 않고, 정보 카드가 처음 필요할 때 따로 받음) */
export interface GalaxyDetail {
  /** 한 줄 요약 (정보 카드 부제) */
  facts: Text
  note: Text
  /** 폭발한 뒤 밝기가 어떻게 바뀌었는지 */
  lightCurve?: Text
  /** 신화·역사 기록 (직접 쓴 짧은 설명) */
  lore?: Text
}

const IA_CURVE = both(
  '며칠~몇 주 만에 가장 밝아진 뒤, 방사성 니켈·코발트가 붕괴하는 빠르기로 몇 달에 걸쳐 고르게 어두워집니다.',
  'Peaks within days to weeks, then fades steadily over months at the pace of radioactive nickel and cobalt decay.',
)

export const GALAXY_DETAILS: Record<string, GalaxyDetail> = {
  sun: {
    facts: both(
      '은하 중심에서 약 2만 6천 광년, 은하 1년 약 2억 3천만 년',
      'About 26,000 ly from the centre; one galactic year ≈ 230 million years',
    ),
    note: both(
      '오리온자리 팔(오리온 돌출부)에 있는 평범한 별. 초속 약 230km로 은하 중심을 돌며, 은하면 위아래로도 오르내립니다.',
      'An ordinary star in the Orion Spur, circling the centre at ~230 km/s while bobbing above and below the disc.',
    ),
  },
  'sgr-a': {
    facts: both('질량 태양의 약 430만 배', 'About 4.3 million solar masses'),
    note: both(
      '은하 중심의 초대질량 블랙홀. 2022년 사건의 지평선 망원경(EHT)이 그림자를 찍었고, 주변 별의 궤도를 밝힌 연구가 2020년 노벨 물리학상을 받았습니다.',
      'The Galaxy’s central supermassive black hole, imaged by the Event Horizon Telescope in 2022; tracking stars around it won the 2020 Nobel Prize.',
    ),
  },
  'orion-nebula': {
    facts: both(
      '지름 약 24광년, 별 2,000여 개가 태어나는 중',
      '~24 ly across, ~2,000 stars forming',
    ),
    note: both(
      '맨눈으로 보이는 가장 가까운 큰 별 탄생 지역입니다.',
      'The nearest large star-forming region visible to the naked eye.',
    ),
    lore: both(
      '사냥꾼 오리온이 허리에 찬 칼자루 자리에 있어, 맨눈으로도 뿌옇게 번진 별처럼 보입니다.',
      'It sits in the sword hanging from Orion’s belt, visible to the naked eye as a fuzzy star.',
    ),
  },
  pleiades: {
    facts: both(
      '나이 약 1억 년의 산개 성단',
      'An open cluster about 100 million years old',
    ),
    note: both(
      '일곱 자매라고도 부르는 파란 별 무리입니다.',
      'The blue “Seven Sisters.”',
    ),
    lore: both(
      '그리스 신화에서는 거인 아틀라스의 일곱 딸이 사냥꾼 오리온에게 쫓기다 별이 되었습니다. 우리나라에서는 좀생이별이라 부르며, 음력 2월 초 달과 좀생이별의 거리를 보고 그해 농사를 점치는 ‘좀생이 보기’ 풍속이 있었습니다.',
      'In Greek myth they are the seven daughters of Atlas, turned to stars while fleeing Orion. Koreans called them Jomsaengi and read the year’s harvest from how far they sat from the Moon in early spring (the Jomsaengi-bogi custom).',
    ),
  },
  crab: {
    facts: both(
      '1054년 초신성의 잔해, 가운데에 초당 30번 도는 펄서',
      'Remnant of the 1054 supernova with a 30-times-a-second pulsar',
    ),
    note: both(
      '1054년 동아시아 천문 기록에 남은 객성(손님별)의 잔해입니다.',
      'The remains of a “guest star” recorded by East Asian astronomers in 1054.',
    ),
    lightCurve: both(
      '송나라 기록에 따르면 23일 동안 낮에도 보였고, 약 2년 가까이 지나서야 밤하늘에서 사라졌습니다.',
      'Song-dynasty records say it was visible in daylight for 23 days and stayed in the night sky for nearly two years.',
    ),
    lore: both(
      '1054년 송나라 천문관은 황소자리 천관성 곁에 나타난 손님별(객성)을 적었고, 일본 기록에도 남았습니다. 오늘날 게 성운이 바로 그 별의 잔해입니다.',
      'In 1054 Song astronomers logged a “guest star” beside Tianguan in Taurus, also noted in Japan; the Crab Nebula is what it left behind.',
    ),
  },
  'eta-carinae': {
    facts: both(
      '태양의 약 100배가 넘는 질량의 쌍성',
      'A binary weighing over ~100 Suns',
    ),
    note: both(
      '1843년 대폭발로 하늘에서 두 번째로 밝아졌던 별. 초신성(극초신성) 후보입니다.',
      'Its 1843 Great Eruption made it the sky’s second-brightest star; a hypernova candidate.',
    ),
    lore: both(
      '1840년대 대폭발 때 남반구 하늘에서 시리우스 다음으로 밝아졌습니다. 언젠가 초신성(어쩌면 극초신성)으로 생을 마칠 것으로 봅니다.',
      'During its 1840s Great Eruption it became second only to Sirius; it is expected to end as a supernova, perhaps a hypernova.',
    ),
  },
  'cygnus-x1': {
    facts: both('태양 질량의 약 21배인 블랙홀', 'A ~21-solar-mass black hole'),
    note: both(
      '처음으로 널리 인정된 블랙홀. 동반성의 가스를 빨아들이며 X선을 냅니다.',
      'The first widely accepted black hole, glowing in X-rays as it feeds on its companion.',
    ),
  },
  'gaia-bh3': {
    facts: both(
      '태양 질량의 약 33배, 2024년 발견',
      '~33 solar masses, found in 2024',
    ),
    note: both(
      '우리 은하에서 찾은 가장 무거운 항성 블랙홀. 빛을 내지 않고 동반성의 흔들림으로 찾았습니다.',
      'The heaviest stellar black hole known in the Galaxy, found from its companion’s wobble.',
    ),
  },
  sgr1806: {
    facts: both(
      '자기장이 지구의 1천조 배인 중성자별',
      'A neutron star with a field a quadrillion times Earth’s',
    ),
    note: both(
      '2004년 거대 플레어가 지구 전리층을 흔들었습니다.',
      'Its 2004 giant flare jolted Earth’s ionosphere.',
    ),
  },
  wr104: {
    facts: both(
      '먼지가 바람개비처럼 감기는 쌍성',
      'A binary wrapped in a pinwheel of dust',
    ),
    note: both(
      '감마선 폭발 후보로 거론되지만 제트 방향은 불확실합니다.',
      'Discussed as a gamma-ray-burst candidate; its jet direction is uncertain.',
    ),
  },
  eagle: {
    facts: both('높이 약 4광년의 가스 기둥', 'Gas pillars about 4 ly tall'),
    note: both(
      '허블과 제임스 웹 사진으로 유명한 별 탄생 지역입니다.',
      'A stellar nursery made famous by Hubble and JWST.',
    ),
  },
  lagoon: {
    facts: both(
      '가로 약 110광년, 모래시계 모양 별 탄생 지역',
      '~110 ly wide, with an hourglass-shaped stellar nursery',
    ),
    note: both(
      '궁수자리에서 맨눈으로도 희미하게 보이는 큰 발광 성운입니다.',
      'A large emission nebula in Sagittarius, faintly visible to the naked eye.',
    ),
  },
  trifid: {
    facts: both(
      '발광·반사·암흑 성운이 한자리에',
      'Emission, reflection and dark nebulae in one place',
    ),
    note: both(
      '어두운 띠가 붉은 구름을 셋으로 가르고, 옆에는 푸른 반사 성운이 붙어 있습니다.',
      'Dark lanes split its red glow into three lobes, with a blue reflection nebula beside it.',
    ),
  },
  'carina-nebula': {
    facts: both(
      '지름 약 300광년, 에타 용골자리를 품음',
      '~300 ly across, home of Eta Carinae',
    ),
    note: both(
      '오리온 대성운보다 네 배쯤 큰 남반구 하늘의 별 탄생 지역입니다.',
      'A southern-sky stellar nursery about four times larger than the Orion Nebula.',
    ),
  },
  rosette: {
    facts: both(
      '지름 약 130광년, 가운데가 빈 꽃 모양',
      '~130 ly across, a flower with a hollow centre',
    ),
    note: both(
      '가운데 젊은 별무리의 바람이 가스를 밀어내 장미꽃처럼 보입니다.',
      'Winds from the young cluster at its heart have blown out the centre, leaving a rose.',
    ),
  },
  'north-america': {
    facts: both(
      '북아메리카 대륙을 닮은 붉은 구름',
      'A red cloud shaped like North America',
    ),
    note: both(
      '백조자리 데네브 곁에 있고, 어두운 먼지 띠가 멕시코만처럼 보입니다.',
      'Near Deneb in Cygnus; a dark dust lane plays the Gulf of Mexico.',
    ),
  },
  horsehead: {
    facts: both(
      '높이 약 3.5광년의 암흑 성운',
      'A dark nebula about 3.5 ly tall',
    ),
    note: both(
      '붉게 빛나는 수소 구름 앞에 차가운 먼지가 말머리 그림자를 드리웁니다.',
      'Cold dust casts a horse-head silhouette against glowing red hydrogen.',
    ),
  },
  ring: {
    facts: both(
      '지름 약 1광년의 행성상 성운',
      'A planetary nebula about 1 ly across',
    ),
    note: both(
      '태양 같은 별이 마지막에 벗어 던진 가스 껍질이 고리처럼 보입니다.',
      'The cast-off gas shell of a dying Sun-like star, seen as a ring.',
    ),
  },
  helix: {
    facts: both(
      '가장 가까운 큰 행성상 성운',
      'The nearest large planetary nebula',
    ),
    note: both(
      '물병자리에 있으며, 수십억 년 뒤 태양도 이렇게 껍질을 벗습니다.',
      'In Aquarius; billions of years from now the Sun will shed its layers like this.',
    ),
  },
  'cats-eye': {
    facts: both(
      '여러 겹 껍질이 겹친 행성상 성운',
      'A planetary nebula of nested shells',
    ),
    note: both(
      '죽어 가는 별이 수천 년마다 껍질을 벗어 고양이 눈 같은 무늬를 남겼습니다.',
      'A dying star puffed off shells every few thousand years, leaving a cat’s-eye pattern.',
    ),
  },
  dumbbell: {
    facts: both(
      '처음 발견된 행성상 성운 (1764년)',
      'The first planetary nebula discovered (1764)',
    ),
    note: both(
      '작은여우자리에 있는 모래시계 모양의 가스 껍질입니다.',
      'An hourglass-shaped shell of gas in Vulpecula.',
    ),
  },
  veil: {
    facts: both(
      '약 1만~2만 년 전 터진 초신성의 잔해',
      'Remnant of a supernova 10,000–20,000 years ago',
    ),
    note: both(
      '폭발 충격파가 성간 가스를 달구어 실처럼 가는 빛의 띠를 남겼습니다.',
      'The blast wave heated interstellar gas into thin, threadlike filaments.',
    ),
  },
  tarantula: {
    facts: both(
      '국부 은하군에서 가장 활발한 별 탄생 지역',
      'The most active star-forming region in the Local Group',
    ),
    note: both(
      '대마젤란 은하 안에 있으며, 우리 은하에 있었다면 그림자가 질 만큼 밝았을 것입니다.',
      'Inside the Large Magellanic Cloud; were it in our Galaxy it would cast shadows.',
    ),
  },
  'omega-centauri': {
    facts: both(
      '별 약 1천만 개의 구상 성단',
      'A globular cluster of ~10 million stars',
    ),
    note: both(
      '우리 은하가 삼킨 작은 은하의 중심일 수 있으며, 2024년 중간 질량 블랙홀의 증거가 나왔습니다.',
      'Possibly the core of a swallowed dwarf galaxy; evidence for an intermediate-mass black hole emerged in 2024.',
    ),
  },
  sn1006: {
    facts: both(
      '기록에 남은 가장 밝은 초신성 (Ia형)',
      'The brightest supernova on record (type Ia)',
    ),
    note: both(
      '1006년 이리자리에 나타나 몇 달 동안 밤에도 그림자를 드리울 만큼 밝았습니다.',
      'Appeared in Lupus in 1006 and for months was bright enough to cast shadows at night.',
    ),
    lightCurve: IA_CURVE,
    lore: both(
      '중국·일본·아랍·유럽에 기록이 남았습니다. 이집트의 천문학자 알리 이븐 리드완은 금성보다 밝고 크기는 금성의 두세 배라고 적었습니다.',
      'Recorded in China, Japan, the Arab world and Europe; the Egyptian astronomer Ali ibn Ridwan wrote that it outshone Venus.',
    ),
  },
  tycho: {
    facts: both(
      '1572년 카시오페이아자리의 Ia형 초신성',
      'A type Ia supernova in Cassiopeia, 1572',
    ),
    note: both(
      '티코 브라헤가 자세히 재어, 별들의 하늘은 변하지 않는다는 옛 생각을 무너뜨렸습니다.',
      'Tycho Brahe’s careful measurements of it overturned the old belief in an unchanging starry sky.',
    ),
    lightCurve: IA_CURVE,
    lore: both(
      '조선의 『선조실록』에도 1572년 겨울 카시오페이아자리 쪽에 나타난 객성이 적혀 있습니다.',
      'Korea’s Joseon annals (Seonjo Sillok) also record a guest star appearing near Cassiopeia in the winter of 1572.',
    ),
  },
  kepler: {
    facts: both(
      '1604년 뱀주인자리의 Ia형 초신성',
      'A type Ia supernova in Ophiuchus, 1604',
    ),
    note: both(
      '지금까지 우리 은하에서 맨눈으로 본 마지막 초신성입니다.',
      'The last supernova in our Galaxy seen with the naked eye.',
    ),
    lightCurve: IA_CURVE,
    lore: both(
      '조선 관상감은 1604년 가을부터 이듬해 봄까지 이 객성의 위치와 밝기를 꾸준히 적었습니다. 이 기록은 오늘날 이 초신성의 밝기 곡선을 되살리는 데 쓰입니다.',
      'Joseon court astronomers logged this guest star steadily from autumn 1604 into the next spring; their notes are still used to rebuild its light curve.',
    ),
  },
  'cas-a': {
    facts: both(
      '약 340년 전 빛이 닿은 IIb형 초신성의 잔해',
      'Remnant of a type IIb supernova whose light arrived ~340 years ago',
    ),
    note: both(
      '하늘에서 가장 센 전파원 가운데 하나. 폭발 당시 기록은 확실하지 않고, 잔해의 메아리 빛으로 유형을 알아냈습니다.',
      'One of the strongest radio sources in the sky; no sure record of the explosion survives, and light echoes revealed its type.',
    ),
    lore: both(
      '1680년 존 플램스티드가 이 자리에서 본 6등성(카시오페이아자리 3)이 이 초신성이었을 수 있다는 의견이 있습니다.',
      'A 6th-magnitude star John Flamsteed charted here in 1680 (3 Cassiopeiae) may have been this supernova.',
    ),
  },
  sn1987a: {
    facts: both(
      '대마젤란 은하의 II형 초신성 (1987년)',
      'A type II supernova in the Large Magellanic Cloud (1987)',
    ),
    note: both(
      '망원경 시대에 가장 가까운 초신성. 빛보다 먼저 중성미자가 지구의 검출기에 잡혔습니다.',
      'The nearest supernova of the telescope era; its neutrinos reached detectors on Earth before its light.',
    ),
    lightCurve: both(
      '1987년 2월 23일에 나타나 3등급 남짓으로 밝아졌고, 5월 무렵 가장 밝았다가 서서히 어두워졌습니다. 무거운 별이 터지는 II형이라 꼭대기가 넓습니다.',
      'Appeared on 23 February 1987, climbed to about magnitude 3 and peaked around May before fading — the broad hump of a collapsing massive star.',
    ),
    lore: both(
      '일본 가미오칸데 등이 이 초신성의 중성미자를 잡아, 고시바 마사토시가 2002년 노벨 물리학상을 받았습니다.',
      'Neutrinos from it were caught by Kamiokande and other detectors, part of the work behind Masatoshi Koshiba’s 2002 Nobel Prize.',
    ),
  },
  't-crb': {
    facts: both(
      '약 80년마다 터지는 반복 신성',
      'A recurrent nova that erupts about every 80 years',
    ),
    note: both(
      '적색 거성의 가스가 백색 왜성 표면에 쌓였다가 터집니다. 1866년과 1946년에 2~3등까지 밝아졌습니다.',
      'Gas from a red giant piles up on a white dwarf and ignites; it flared to 2nd–3rd magnitude in 1866 and 1946.',
    ),
    lightCurve: both(
      '평소 10등급 안팎이다가 몇 시간 만에 2~3등급까지 치솟고, 일주일쯤 뒤 다시 맨눈에서 사라집니다.',
      'Normally around 10th magnitude, it leaps to 2nd–3rd within hours and drops out of naked-eye view in about a week.',
    ),
    lore: both(
      '‘타오르는 별(Blaze Star)’이라는 별명이 있습니다. 1946년 뒤 다시 터질 때가 가까워져 2020년대 천문가들이 지켜보고 있습니다.',
      'Nicknamed the Blaze Star; with its last eruption in 1946, astronomers in the 2020s have been watching for the next.',
    ),
  },
  'rs-oph': {
    facts: both(
      '약 15~20년마다 터지는 반복 신성',
      'A recurrent nova erupting every ~15–20 years',
    ),
    note: both(
      '2021년 폭발에서는 신성에서 처음으로 아주 높은 에너지의 감마선이 잡혔습니다. 거리는 측정마다 차이가 큽니다.',
      'Its 2021 eruption gave the first very-high-energy gamma rays seen from a nova; distance estimates vary widely.',
    ),
    lightCurve: both(
      '평소 11등급 안팎에서 하루쯤 만에 4~5등급까지 밝아지고, 몇 주에 걸쳐 어두워집니다.',
      'From about 11th magnitude it brightens to 4th–5th within a day and fades over several weeks.',
    ),
  },
  'v1500-cyg': {
    facts: both(
      '알려진 가장 빠르게 밝아진 신성 가운데 하나',
      'One of the fastest-rising novae known',
    ),
    note: both(
      '맨눈에 안 보이던 별이 며칠 만에 2등성보다 밝아졌습니다.',
      'A star far too faint for the eye brightened past second magnitude within days.',
    ),
    lightCurve: both(
      '1975년 8월 갑자기 나타나 사흘쯤 만에 가장 밝았고, 맨눈으로는 일주일 남짓 보였습니다.',
      'It burst out in August 1975, peaked in about three days and was a naked-eye star for little more than a week.',
    ),
  },
  'gk-per': {
    facts: both(
      '불꽃놀이 성운을 남긴 고전 신성',
      'A classical nova that left the Firework Nebula',
    ),
    note: both(
      '1901년 0등급까지 밝아졌고, 지금은 그때 내뿜은 가스가 불꽃놀이처럼 퍼져 보입니다.',
      'It reached magnitude 0 in 1901; the gas it threw off now spreads like fireworks.',
    ),
    lightCurve: both(
      '1901년 2월 하루 이틀 만에 0등급까지 밝아졌고, 그 뒤 몇 달 동안 밝기가 오르내리며 어두워졌습니다.',
      'In February 1901 it shot to magnitude 0 within a day or two, then faded over months with repeated flickers.',
    ),
  },
  'v603-aql': {
    facts: both(
      '망원경 시대에 가장 밝았던 신성',
      'The brightest nova of the telescope era',
    ),
    note: both(
      '1918년 6월 0등급보다 밝게 빛나, 망원경으로 하늘을 본 뒤 나타난 가장 밝은 신성이 되었습니다.',
      'In June 1918 it outshone magnitude 0, the brightest nova since telescopes were turned to the sky.',
    ),
    lightCurve: both(
      '1918년 6월 8일 무렵 나타나 며칠 만에 가장 밝았고, 몇 주 사이에 맨눈에서 사라졌습니다.',
      'It appeared around 8 June 1918, peaked within days and vanished from naked-eye view in a few weeks.',
    ),
  },
  kepler452: {
    facts: both(
      '지구의 사촌이라 불린 행성 452b',
      'Home of “Earth’s cousin,” planet 452b',
    ),
    note: both(
      '태양형 별의 거주 가능 영역을 도는 지구보다 큰 행성입니다.',
      'A larger-than-Earth planet in a Sun-like star’s habitable zone.',
    ),
  },
  lmc: {
    facts: both(
      '우리 은하의 가장 큰 위성 은하',
      'The Galaxy’s largest satellite',
    ),
    note: both(
      '1987년 초신성 SN 1987A가 터진 곳입니다.',
      'Where supernova SN 1987A exploded.',
    ),
  },
  smc: {
    facts: both(
      '남반구 하늘에서 맨눈으로 보이는 위성 은하',
      'A satellite galaxy visible from the southern hemisphere',
    ),
    note: both(
      '대마젤란 은하와 기체 다리로 이어져 있습니다.',
      'Linked to the Large Cloud by a bridge of gas.',
    ),
  },
}
