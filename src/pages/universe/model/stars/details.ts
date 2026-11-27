import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'

/** 별의 설명 (3D 워커와 첫 화면 묶음에 싣지 않고, 정보 카드가 처음 필요할 때 받음) */
export interface StarDetail {
  note: Text
  planets?: Text
  /** 소속 별자리 */
  constellation: Text
  /** 동양(한국·중국) 이름과 바이어 이름 */
  eastName?: Text
  /** 동반성 */
  companion?: Text
  /** 신화·전승 (직접 쓴 짧은 설명) */
  lore?: Text
}

/**
 * 별 id → 설명. 별자리·동양 이름은 IAU 별자리 경계와 중국·한국 전통 별 이름(28수·삼원) 표기를 따랐고,
 * 설명과 전승 문장은 이 프로젝트에서 직접 썼습니다(docs/data-sources.md).
 */
export const STAR_DETAILS: Record<string, StarDetail> = {
  'alpha-centauri': {
    note: both(
      '태양과 비슷한 두 별이 80년마다 서로를 돕니다. 맨눈으로 보이는 가장 가까운 별입니다.',
      'Two Sun-like stars orbiting each other every 80 years — the nearest stars visible to the eye.',
    ),
    constellation: both('센타우루스자리', 'Centaurus'),
    eastName: both(
      '남문이 · 센타우루스자리 α',
      'Nanmen Er (South Gate II) · α Centauri',
    ),
    companion: both(
      '두 별이 약 80년마다 서로를 돌고, 프록시마가 멀리서 함께 돕니다',
      'A and B circle each other every ~80 years, with Proxima orbiting far out',
    ),
  },
  proxima: {
    note: both(
      '태양에서 가장 가까운 별. 자주 플레어를 내는 적색 왜성입니다.',
      'The Sun’s nearest neighbour, a flaring red dwarf.',
    ),
    planets: both(
      '프록시마 b (거주 가능 영역), d',
      'Proxima b (habitable zone), d',
    ),
    constellation: both('센타우루스자리', 'Centaurus'),
  },
  barnard: {
    note: both(
      '하늘에서 가장 빨리 움직이는 별(고유 운동)입니다.',
      'The star with the fastest motion across our sky.',
    ),
    planets: both(
      '지구보다 작은 행성 4개 (2025년 확인)',
      'Four sub-Earth planets (confirmed 2025)',
    ),
    constellation: both('뱀주인자리', 'Ophiuchus'),
  },
  wolf359: {
    note: both(
      '아주 어둡고 차가운 적색 왜성입니다.',
      'A very faint, cool red dwarf.',
    ),
    constellation: both('사자자리', 'Leo'),
  },
  lalande21185: {
    note: both(
      '북반구에서 보이는 가장 밝은 적색 왜성입니다.',
      'The brightest red dwarf in northern skies.',
    ),
    constellation: both('큰곰자리', 'Ursa Major'),
  },
  sirius: {
    note: both(
      '밤하늘에서 가장 밝은 별. 동반성 시리우스 B는 백색 왜성입니다.',
      'The brightest star in the night sky; its companion Sirius B is a white dwarf.',
    ),
    constellation: both('큰개자리', 'Canis Major'),
    eastName: both(
      '천랑성 · 큰개자리 α',
      'Tianlang (Celestial Wolf) · α Canis Majoris',
    ),
    companion: both(
      '시리우스 B: 지구만 한 백색 왜성(질량 약 1 M☉), 약 50년마다 한 바퀴',
      'Sirius B: an Earth-sized white dwarf (~1 M☉) circling every ~50 years',
    ),
    lore: both(
      '그리스 신화에서는 사냥꾼 오리온의 사냥개, 옛 이집트에서는 새벽에 다시 보이면 나일강이 넘칠 때를 알리는 별이었습니다. 동양에서는 하늘의 늑대(천랑)라 불렀고, 곁의 활(호시) 별들이 이 늑대를 겨눈다고 보았습니다.',
      "In Greek myth it is Orion's hunting dog; in ancient Egypt its dawn return heralded the Nile flood. East Asian astronomers called it the Celestial Wolf, with the stars of the Bow aimed at it.",
    ),
  },
  ross248: {
    note: both(
      '약 3만 6천 년 뒤 약 3광년까지 다가와 태양에서 가장 가까운 별이 됩니다.',
      'In ~36,000 years it will come within ~3 ly and become the Sun’s closest star.',
    ),
    constellation: both('안드로메다자리', 'Andromeda'),
  },
  'epsilon-eridani': {
    note: both(
      '젊은 태양 같은 별. 외계 지적 생명 탐사(SETI)의 첫 대상이었습니다.',
      'A young Sun-like star; an early SETI target.',
    ),
    planets: both(
      '목성형 행성 b와 먼지 원반',
      'Jupiter-like planet b and a debris disc',
    ),
    constellation: both('에리다누스자리', 'Eridanus'),
  },
  ross128: {
    note: both(
      '플레어가 적은 조용한 적색 왜성입니다.',
      'An unusually quiet red dwarf.',
    ),
    planets: both('온화한 행성 로스 128 b', 'Temperate planet Ross 128 b'),
    constellation: both('처녀자리', 'Virgo'),
  },
  procyon: {
    note: both(
      '작은개자리의 밝은 별. 백색 왜성 동반성이 있습니다.',
      'Canis Minor’s bright star, with a white-dwarf companion.',
    ),
    constellation: both('작은개자리', 'Canis Minor'),
    eastName: both(
      '남하삼 · 작은개자리 α',
      'Nanhe San (South River III) · α Canis Minoris',
    ),
    companion: both(
      '프로키온 B: 백색 왜성(질량 약 0.6 M☉), 약 41년마다 한 바퀴',
      'Procyon B: a white dwarf (~0.6 M☉) circling every ~41 years',
    ),
  },
  '61-cygni': {
    note: both(
      '1838년 베셀이 처음으로 연주시차를 재어 거리를 알아낸 별입니다.',
      'In 1838 Bessel measured its parallax — the first stellar distance ever measured.',
    ),
    constellation: both('백조자리', 'Cygnus'),
  },
  'epsilon-indi': {
    note: both(
      '갈색 왜성 두 개가 함께 돕니다.',
      'Two brown dwarfs orbit with it.',
    ),
    planets: both(
      '제임스 웹이 직접 찍은 거대 행성 Ab (2024)',
      'Giant planet Ab, imaged by JWST (2024)',
    ),
    constellation: both('인디언자리', 'Indus'),
  },
  'tau-ceti': {
    note: both(
      '가까운 태양형 별이라 SF에 자주 나옵니다.',
      'A nearby Sun-like star, a science-fiction favourite.',
    ),
    planets: both('후보 행성 여러 개', 'Several candidate planets'),
    constellation: both('고래자리', 'Cetus'),
  },
  teegarden: {
    note: both(
      '지구와 가장 닮은 행성 후보를 거느린 별 가운데 하나입니다.',
      'Hosts some of the most Earth-like planet candidates.',
    ),
    planets: both(
      '지구만 한 행성 b·c (거주 가능 영역)',
      'Earth-mass planets b and c in the habitable zone',
    ),
    constellation: both('양자리', 'Aries'),
  },
  kapteyn: {
    note: both(
      '은하 헤일로에서 온 아주 늙은 별로, 은하 원반과 반대 방향으로 돕니다.',
      'A very old halo star circling the Galaxy against the disc’s rotation.',
    ),
    constellation: both('화가자리', 'Pictor'),
  },
  altair: {
    note: both(
      '9시간 만에 한 바퀴 도는 빠른 자전으로 적도가 부풀었습니다.',
      'Spins once every 9 hours, bulging at the equator.',
    ),
    constellation: both('독수리자리', 'Aquila'),
    eastName: both(
      '견우성 · 독수리자리 α',
      'Cowherd Star (Niulang) · α Aquilae',
    ),
    lore: both(
      '견우와 직녀 이야기의 견우. 은하수 건너 직녀성(베가)을 바라보며 칠석날 오작교에서 만나기를 기다립니다.',
      'The Cowherd of the Cowherd-and-Weaver tale, gazing across the Milky Way at Vega until they meet on the magpie bridge each Qixi night.',
    ),
  },
  gliese581: {
    note: both(
      '거주 가능 영역 행성 논쟁으로 유명해진 적색 왜성입니다.',
      'A red dwarf famous for the debate over its habitable-zone planets.',
    ),
    planets: both('행성 3개', 'Three planets'),
    constellation: both('천칭자리', 'Libra'),
  },
  vega: {
    note: both(
      '약 1만 2천 년 뒤 북극성이 됩니다. 별 밝기 등급의 기준이었습니다.',
      'Will be the pole star in ~12,000 years; once the zero point of stellar magnitudes.',
    ),
    constellation: both('거문고자리', 'Lyra'),
    eastName: both(
      '직녀성 · 거문고자리 α',
      'Weaver Girl Star (Zhinü) · α Lyrae',
    ),
    lore: both(
      '견우와 직녀 이야기의 직녀. 은하수에 가로막힌 두 사람은 음력 칠월 칠석에 까치와 까마귀가 놓은 오작교에서 한 해에 한 번 만납니다.',
      'The Weaver Girl of the Cowherd-and-Weaver tale: parted by the Milky Way, the lovers meet once a year on the seventh night of the seventh lunar month, on a bridge of magpies and crows.',
    ),
  },
  fomalhaut: {
    note: both(
      '먼지 고리로 둘러싸인 젊은 별입니다.',
      'A young star ringed by dust.',
    ),
    constellation: both('남쪽물고기자리', 'Piscis Austrinus'),
    eastName: both(
      '북락사문 · 남쪽물고기자리 α',
      'Beiluo Shimen · α Piscis Austrini',
    ),
  },
  arcturus: {
    note: both(
      '늙은 적색 거성. 약 50억 년 뒤 태양도 이렇게 됩니다.',
      'An aging red giant — the Sun’s look in about 5 billion years.',
    ),
    constellation: both('목동자리', 'Boötes'),
    eastName: both('대각성 · 목동자리 α', 'Dajiao (Great Horn) · α Boötis'),
    lore: both(
      '그리스어로 ‘곰을 지키는 이’. 동양에서는 하늘의 청룡 뿔(대각)이라 불렀습니다.',
      'Greek for “guardian of the bear”; East Asia called it the Great Horn of the Azure Dragon.',
    ),
  },
  trappist1: {
    note: both(
      '목성만 한 별 둘레를 지구형 행성 7개가 촘촘히 돕니다.',
      'Seven rocky worlds packed around a Jupiter-sized star.',
    ),
    planets: both(
      '지구만 한 행성 7개, 3개는 거주 가능 영역',
      'Seven Earth-size planets, three in the habitable zone',
    ),
    constellation: both('물병자리', 'Aquarius'),
  },
  capella: {
    note: both(
      '거성 두 쌍으로 이뤄진 4중성입니다.',
      'A quadruple system built around two giants.',
    ),
    constellation: both('마차부자리', 'Auriga'),
    eastName: both(
      '오거이 · 마차부자리 α',
      'Wuche Er (Five Chariots II) · α Aurigae',
    ),
  },
  '51-pegasi': {
    note: both(
      '1995년 태양 같은 별 둘레에서 처음 외계 행성을 찾은 곳 (2019 노벨 물리학상).',
      'Where the first planet around a Sun-like star was found in 1995 (2019 Nobel Prize).',
    ),
    planets: both('뜨거운 목성 51 Peg b (1995)', 'Hot Jupiter 51 Peg b (1995)'),
    constellation: both('페가수스자리', 'Pegasus'),
  },
  gliese710: {
    note: both(
      '태양 쪽으로 다가오는 중. 약 129만 년 뒤 1만 AU(0.17광년)까지 와서 오르트 구름을 흔듭니다.',
      'Heading our way: in ~1.29 million years it passes within 10,000 AU (0.17 ly), stirring the Oort cloud.',
    ),
    constellation: both('뱀자리', 'Serpens'),
  },
  aldebaran: {
    note: both(
      '황소자리의 붉은 눈인 적색 거성입니다.',
      'The red-giant eye of Taurus.',
    ),
    constellation: both('황소자리', 'Taurus'),
    eastName: both('필수오 · 황소자리 α', 'Bi Wu (Net V) · α Tauri'),
    lore: both(
      '황소의 붉은 눈. 아랍어로 ‘뒤따르는 자’라는 뜻으로, 플레이아데스를 쫓아 떠오르기 때문입니다.',
      "The bull's red eye; its Arabic name means “the follower,” as it rises after the Pleiades.",
    ),
  },
  'ik-pegasi': {
    note: both(
      '가장 가까운 Ia형 초신성 후보. 동반성인 무거운 백색 왜성이 질량을 얻으면 폭발할 수 있습니다.',
      'The nearest type Ia supernova candidate: its massive white-dwarf companion could explode.',
    ),
    constellation: both('페가수스자리', 'Pegasus'),
    companion: both(
      'IK 페가수스 B: 무거운 백색 왜성',
      'IK Pegasi B: a massive white dwarf',
    ),
  },
  spica: {
    note: both(
      '무거운 쌍성. 주성은 언젠가 초신성이 됩니다.',
      'A massive binary whose primary will one day go supernova.',
    ),
    constellation: both('처녀자리', 'Virgo'),
    eastName: both('각수일 · 처녀자리 α', 'Jiao Yi (Horn I) · α Virginis'),
    lore: both(
      '처녀자리 여신이 든 보리 이삭. 동양에서는 청룡의 뿔(각수)로, 28수의 첫 별자리입니다.',
      'The ear of grain held by the Virgin; in East Asia the Horn of the Azure Dragon, first of the 28 lunar lodges.',
    ),
  },
  canopus: {
    note: both(
      '밤하늘에서 두 번째로 밝은 별. 우리나라에서는 남쪽 지평선 가까이 낮게 보여 노인성이라 불렀습니다.',
      'The second-brightest star; seen low on the southern horizon from Korea, where it was called the Old Man Star.',
    ),
    constellation: both('용골자리', 'Carina'),
    eastName: both('노인성 · 용골자리 α', 'Old Man Star (Laoren) · α Carinae'),
    lore: both(
      '이 별을 보면 오래 산다고 해 남극노인성이라 불렀고, 옛 왕조는 이 별이 보이면 나라에 경사가 있다고 기록했습니다.',
      'Seeing it was said to grant long life, so it was named the Old Man of the South Pole; old dynasties recorded its appearance as a good omen.',
    ),
  },
  polaris: {
    note: both(
      '지금의 북극성. 세차 운동으로 1만 2천 년 뒤에는 베가가 그 자리를 잇습니다.',
      'Today’s pole star; precession hands the role to Vega in ~12,000 years.',
    ),
    constellation: both('작은곰자리', 'Ursa Minor'),
    eastName: both('북극성 · 작은곰자리 α', 'Pole Star · α Ursae Minoris'),
    lore: both(
      '하늘의 모든 별이 이 별을 중심으로 도는 것처럼 보여, 동양에서는 하늘 임금이 머무는 자미원의 중심으로 여겼습니다. 길을 찾는 뱃사람과 여행자의 길잡이 별입니다.',
      'Because the whole sky seems to wheel around it, East Asian astronomy placed it at the heart of the Purple Forbidden Enclosure, seat of the Celestial Emperor. Sailors and travellers steered by it.',
    ),
  },
  betelgeuse: {
    note: both(
      '태양 자리에 두면 목성 궤도 근처까지 차는 적색 초거성. 2019~2020년 크게 어두워져 관심을 모았습니다.',
      'A red supergiant that would reach toward Jupiter’s orbit; its Great Dimming of 2019–2020 drew worldwide attention.',
    ),
    constellation: both('오리온자리', 'Orion'),
    eastName: both(
      '삼수사 · 오리온자리 α',
      'Shen Si (Three Stars IV) · α Orionis',
    ),
    lore: both(
      '오리온의 어깨. 동양에서는 삼수(세 별) 별자리의 한 별입니다. 수명이 다하면 초신성이 되어 몇 주 동안 반달만큼 밝게 빛날 수 있습니다(시기는 알 수 없음).',
      "Orion's shoulder, and part of the Three Stars lodge in East Asian astronomy. When it dies it may go supernova and shine as bright as a half Moon for weeks (no one knows when).",
    ),
  },
  antares: {
    note: both(
      '전갈자리의 심장. 화성과 겨룰 만큼 붉다는 뜻의 이름입니다.',
      'The heart of Scorpius; its name means “rival of Mars.”',
    ),
    constellation: both('전갈자리', 'Scorpius'),
    eastName: both(
      '심수이 · 대화성 · 전갈자리 α',
      'Xin Er (Heart II), the Great Fire · α Scorpii',
    ),
    lore: both(
      '붉은빛 때문에 동양에서는 큰 불(대화)이라 불렀고, 이 별이 서쪽으로 지면 가을이 온다고 여겼습니다. 그리스 신화에서는 오리온을 찌른 전갈의 심장이라 오리온과 한 하늘에 함께 뜨지 않습니다.',
      'Its red glow earned it the name Great Fire in East Asia, and its westward sinking marked the coming of autumn. In Greek myth it is the heart of the scorpion that stung Orion, so the two never share the sky.',
    ),
  },
  rigel: {
    note: both('오리온자리의 푸른 초거성입니다.', 'Orion’s blue supergiant.'),
    constellation: both('오리온자리', 'Orion'),
    eastName: both(
      '삼수칠 · 오리온자리 β',
      'Shen Qi (Three Stars VII) · β Orionis',
    ),
    lore: both(
      '오리온의 발. 아랍어로 ‘발’을 뜻하는 이름입니다.',
      "Orion's foot; its name comes from the Arabic for “foot.”",
    ),
  },
  deneb: {
    note: both(
      '맨눈으로 보이는 별 가운데 가장 멀고 밝은 축에 듭니다.',
      'One of the most distant and luminous stars visible to the naked eye.',
    ),
    constellation: both('백조자리', 'Cygnus'),
    eastName: both(
      '천진사 · 백조자리 α',
      'Tianjin Si (Celestial Ford IV) · α Cygni',
    ),
  },
  pollux: {
    note: both(
      '주황색 거성. 행성(폴룩스 b)을 거느린 가장 밝은 별 가운데 하나입니다.',
      'An orange giant and one of the brightest stars known to host a planet (Pollux b).',
    ),
    planets: both('거대 행성 폴룩스 b', 'Giant planet Pollux b'),
    constellation: both('쌍둥이자리', 'Gemini'),
    eastName: both(
      '북하삼 · 쌍둥이자리 β',
      'Beihe San (North River III) · β Geminorum',
    ),
    lore: both(
      '그리스 신화의 쌍둥이 폴룩스. 죽지 않는 몸이었지만 죽은 형제 카스토르와 영원을 나누어 둘이 함께 하늘에 올랐습니다.',
      'The immortal twin of Greek myth, who shared his immortality with his slain brother Castor so the two could stay together in the sky.',
    ),
  },
  regulus: {
    note: both(
      '하루도 안 걸려 한 바퀴 도는 빠른 자전으로 적도가 크게 부푼 푸른 별입니다.',
      'A blue star spinning so fast (under a day per turn) that its equator bulges strongly.',
    ),
    constellation: both('사자자리', 'Leo'),
    eastName: both('헌원십사 · 사자자리 α', 'Xuanyuan Shisi · α Leonis'),
    lore: both(
      '‘작은 왕’이라는 뜻의 이름으로, 사자의 심장에 놓인 왕의 별입니다. 동양에서는 황제(헌원)를 나타내는 별자리에 들었습니다.',
      "Its name means “little king” — the royal star at the lion's heart. In East Asia it belonged to the asterism of the Yellow Emperor, Xuanyuan.",
    ),
  },
}
