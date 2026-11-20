/**
 * 우주 대전(스페이스 오페라 모드)의 세력·함급·병기·특수 작전.
 * 나무위키 「스페이스 오페라」 4. 주요 소재에 나오는 소재 이름을 모두 쓰도록 꾸렸습니다
 * (이름만 참고하고 설명·세력·함선은 이 프로젝트에서 지음, 특정 작품의 이름·설정은 쓰지 않음).
 */
import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'

/* ── 스페이스 오페라 소재 ─────────────────────────── */

export type MotifId =
  | 'power-armor'
  | 'mech'
  | 'beam'
  | 'optical'
  | 'particle'
  | 'plasma'
  | 'cyborg'
  | 'transhuman'
  | 'posthuman'
  | 'megastructure'
  | 'dyson-sphere'
  | 'ringworld'
  | 'space-elevator'
  | 'plasma-gun'
  | 'lost-tech'
  | 'superweapon'
  | 'planet-killer'
  | 'alien'
  | 'swarm'
  | 'cosmic-being'
  | 'parallel'
  | 'multiverse'
  | 'colonization'
  | 'space-war'
  | 'battleship'
  | 'carrier'
  | 'pirates'
  | 'warp'
  | 'galactic-empire'
  | 'earth-vs-colony'
  | 'time-travel'
  | 'ftl'
  | 'psionics'
  | 'terraforming'
  | 'hive-mind'
  | 'magitech'

/** 소재 이름 (목록 순서대로) */
export const MOTIFS: Record<MotifId, Text> = {
  'power-armor': both('강화복', 'Powered armour'),
  mech: both('로봇보행병기', 'Walking mechs'),
  beam: both('빔 병기', 'Beam weapons'),
  optical: both('광학병기', 'Optical weapons'),
  particle: both('입자병기', 'Particle weapons'),
  plasma: both('플라즈마 병기', 'Plasma weapons'),
  cyborg: both('사이보그', 'Cyborgs'),
  transhuman: both('트랜스휴먼', 'Transhumans'),
  posthuman: both('포스트휴먼', 'Posthumans'),
  megastructure: both('메가스트럭처', 'Megastructures'),
  'dyson-sphere': both('다이슨 스피어', 'Dyson sphere'),
  ringworld: both('링월드', 'Ringworld'),
  'space-elevator': both('우주 엘리베이터', 'Space elevator'),
  'plasma-gun': both('플라즈마 건', 'Plasma guns'),
  'lost-tech': both('로스트 테크놀러지', 'Lost technology'),
  superweapon: both('슈퍼 웨폰', 'Superweapon'),
  'planet-killer': both('플래닛 킬러', 'Planet killer'),
  alien: both('외계인', 'Aliens'),
  swarm: both('벌레떼 종족', 'Insectoid swarm'),
  'cosmic-being': both('우주적 존재', 'Cosmic beings'),
  parallel: both('평행우주', 'Parallel universe'),
  multiverse: both('다중우주', 'Multiverse'),
  colonization: both('우주 개척', 'Space colonisation'),
  'space-war': both('우주전쟁', 'Space war'),
  battleship: both('우주전함', 'Space battleships'),
  carrier: both('우주항공모함', 'Space carriers'),
  pirates: both('우주해적', 'Space pirates'),
  warp: both('워프', 'Warp'),
  'galactic-empire': both('은하 제국', 'Galactic empire'),
  'earth-vs-colony': both('지구 vs 식민지', 'Earth vs colonies'),
  'time-travel': both('시간여행', 'Time travel'),
  ftl: both('초광속', 'Faster than light'),
  psionics: both('초능력', 'Psychic powers'),
  terraforming: both('테라포밍', 'Terraforming'),
  'hive-mind': both('하이브 마인드', 'Hive mind'),
  magitech: both('마도공학', 'Magitech'),
}

export const MOTIF_IDS = Object.keys(MOTIFS) as MotifId[]

/* ── 함급 ─────────────────────────────────────────── */

export type ShipClassId =
  | 'fighter'
  | 'interceptor'
  | 'corsair'
  | 'swarmer'
  | 'drone'
  | 'mech'
  | 'frigate'
  | 'destroyer'
  | 'cruiser'
  | 'bioship'
  | 'battleship'
  | 'carrier'
  | 'dreadnought'
  | 'station'
  | 'fortress'

export interface ShipClass {
  id: ShipClassId
  name: Text
  /** 한 척의 전투력 (함대 전력의 바탕) */
  power: number
}

export const SHIP_CLASSES: Record<ShipClassId, ShipClass> = {
  fighter: { id: 'fighter', name: both('함재 전투기', 'Fighter'), power: 1 },
  interceptor: {
    id: 'interceptor',
    name: both('요격기', 'Interceptor'),
    power: 1.2,
  },
  corsair: {
    id: 'corsair',
    name: both('해적 쾌속선', 'Corsair'),
    power: 2.5,
  },
  swarmer: {
    id: 'swarmer',
    name: both('군체 돌격체', 'Swarmer'),
    power: 0.8,
  },
  drone: { id: 'drone', name: both('무인 전투기', 'Drone'), power: 1 },
  mech: { id: 'mech', name: both('보행 기갑', 'Walking mech'), power: 3 },
  frigate: { id: 'frigate', name: both('호위함', 'Frigate'), power: 4 },
  destroyer: { id: 'destroyer', name: both('구축함', 'Destroyer'), power: 6 },
  cruiser: { id: 'cruiser', name: both('순양함', 'Cruiser'), power: 10 },
  bioship: { id: 'bioship', name: both('생체 모함', 'Bio-ship'), power: 18 },
  battleship: {
    id: 'battleship',
    name: both('우주전함', 'Battleship'),
    power: 22,
  },
  carrier: {
    id: 'carrier',
    name: both('우주항공모함', 'Carrier'),
    power: 18,
  },
  dreadnought: {
    id: 'dreadnought',
    name: both('드레드노트 기함', 'Dreadnought'),
    power: 40,
  },
  station: {
    id: 'station',
    name: both('궤도 요새 정거장', 'Fortress station'),
    power: 35,
  },
  fortress: {
    id: 'fortress',
    name: both('고대 거대 요새', 'Ancient citadel'),
    power: 60,
  },
}

/** 전투기·무인기처럼 떼로 다니는 작은 함급 */
export const SMALL_CLASSES: ShipClassId[] = [
  'fighter',
  'interceptor',
  'corsair',
  'swarmer',
  'drone',
  'mech',
]

/* ── 병기 ─────────────────────────────────────────── */

export type WeaponId =
  | 'red-laser'
  | 'blue-laser'
  | 'beam'
  | 'optical'
  | 'particle'
  | 'plasma'
  | 'plasma-gun'
  | 'acid'
  | 'arcane'
  | 'chrono'
  | 'graviton'

export interface Weapon {
  id: WeaponId
  name: Text
  /** 화면의 광선·탄 색 */
  color: string
  /** 줄기 광선이면 beam, 날아가는 탄이면 bolt */
  look: 'beam' | 'bolt'
  /** 화력 배율 (란체스터 계수) */
  quality: number
  /** 이 병기가 보여 주는 소재 */
  motif?: MotifId
}

export const WEAPONS: Record<WeaponId, Weapon> = {
  'red-laser': {
    id: 'red-laser',
    name: both('적색 레이저 포', 'Crimson laser batteries'),
    color: '#ff2e2e',
    look: 'beam',
    quality: 1.08,
    motif: 'beam',
  },
  'blue-laser': {
    id: 'blue-laser',
    name: both('청색 레이저 포', 'Sapphire laser batteries'),
    color: '#3d7bff',
    look: 'beam',
    quality: 1.05,
    motif: 'beam',
  },
  beam: {
    id: 'beam',
    name: both('빔 포', 'Beam cannons'),
    color: '#9fd3ff',
    look: 'beam',
    quality: 1,
    motif: 'beam',
  },
  optical: {
    id: 'optical',
    name: both('광학 위상 배열 레이저', 'Optical phased-array lasers'),
    color: '#4fc3ff',
    look: 'beam',
    quality: 1.05,
    motif: 'optical',
  },
  particle: {
    id: 'particle',
    name: both('입자 창', 'Particle lances'),
    color: '#ffd27a',
    look: 'beam',
    quality: 1.1,
    motif: 'particle',
  },
  plasma: {
    id: 'plasma',
    name: both('플라즈마 포', 'Plasma cannons'),
    color: '#ffa25c',
    look: 'bolt',
    quality: 1.1,
    motif: 'plasma',
  },
  'plasma-gun': {
    id: 'plasma-gun',
    name: both('플라즈마 건', 'Plasma guns'),
    color: '#ff7a59',
    look: 'bolt',
    quality: 1,
    motif: 'plasma-gun',
  },
  acid: {
    id: 'acid',
    name: both('산성 생체탄', 'Bio-acid spores'),
    color: '#7dff8a',
    look: 'bolt',
    quality: 0.95,
  },
  arcane: {
    id: 'arcane',
    name: both('마도 술식탄', 'Arcane sigil bolts'),
    color: '#d6a8ff',
    look: 'bolt',
    quality: 1,
  },
  chrono: {
    id: 'chrono',
    name: both('시간 왜곡파', 'Chrono-distortion waves'),
    color: '#9ad5ae',
    look: 'bolt',
    quality: 1,
  },
  graviton: {
    id: 'graviton',
    name: both('고대 중력창', 'Ancient graviton spears'),
    color: '#b39ddb',
    look: 'beam',
    quality: 1.12,
  },
}

/* ── 특수 작전 ────────────────────────────────────── */

export type SpecialId =
  | 'crimson-barrage'
  | 'shield-wall'
  | 'warp-strike'
  | 'carrier-wing'
  | 'boarding'
  | 'mech-drop'
  | 'hive-regrowth'
  | 'self-repair'
  | 'psionic'
  | 'arcane-ward'
  | 'summon'
  | 'rewind'
  | 'rift'
  | 'lost-tech'
  | 'raid'
  | 'planet-killer'
  | 'colony-uprising'
  | 'megastructure'
  | 'divine-strike'
  | 'divine-duel'
  | 'megaweapon'

export interface Special {
  id: SpecialId
  name: Text
  /** 터지는 교전 차례 (0부터) */
  rounds: number[]
  /** 적 전력을 깎는 비율 */
  strike?: number
  /** 제 전력을 되찾는 비율 */
  boost?: number
  motifs: MotifId[]
}

export const SPECIALS: Record<SpecialId, Special> = {
  'crimson-barrage': {
    id: 'crimson-barrage',
    name: both('붉은 일제 사격', 'Crimson barrage'),
    rounds: [1, 3],
    strike: 0.07,
    motifs: ['beam', 'space-war'],
  },
  'shield-wall': {
    id: 'shield-wall',
    name: both('푸른 방어막 진형', 'Sapphire shield wall'),
    rounds: [1, 3],
    boost: 0.06,
    motifs: ['battleship'],
  },
  'warp-strike': {
    id: 'warp-strike',
    name: both('워프 기습', 'Warp strike'),
    rounds: [0],
    strike: 0.08,
    motifs: ['warp', 'ftl'],
  },
  'carrier-wing': {
    id: 'carrier-wing',
    name: both('함재기 출격', 'Carrier wing launch'),
    rounds: [1, 3],
    strike: 0.04,
    motifs: ['carrier'],
  },
  boarding: {
    id: 'boarding',
    name: both('강화복 강습', 'Powered-armour boarding'),
    rounds: [2],
    strike: 0.08,
    motifs: ['power-armor'],
  },
  'mech-drop': {
    id: 'mech-drop',
    name: both('보행 기갑 강하', 'Mech drop'),
    rounds: [2],
    strike: 0.1,
    motifs: ['mech'],
  },
  'hive-regrowth': {
    id: 'hive-regrowth',
    name: both('군체 재생', 'Hive regrowth'),
    rounds: [2, 4],
    boost: 0.18,
    motifs: ['hive-mind', 'swarm', 'alien'],
  },
  'self-repair': {
    id: 'self-repair',
    name: both('나노 자기 수복', 'Nanite self-repair'),
    rounds: [3],
    boost: 0.18,
    motifs: ['cyborg', 'transhuman', 'posthuman'],
  },
  psionic: {
    id: 'psionic',
    name: both('초능력 교란', 'Psychic disruption'),
    rounds: [1],
    strike: 0.06,
    motifs: ['psionics'],
  },
  'arcane-ward': {
    id: 'arcane-ward',
    name: both('마도 결계', 'Magitech ward'),
    rounds: [2],
    boost: 0.08,
    motifs: ['magitech'],
  },
  summon: {
    id: 'summon',
    name: both('봉인 해제', 'Breaking the seal'),
    rounds: [3],
    strike: 0.1,
    motifs: ['cosmic-being'],
  },
  rewind: {
    id: 'rewind',
    name: both('시간 되감기', 'Time rewind'),
    rounds: [4],
    motifs: ['time-travel'],
  },
  rift: {
    id: 'rift',
    name: both('차원 균열 증원', 'Rift reinforcements'),
    rounds: [1, 3],
    boost: 0.15,
    motifs: ['parallel', 'multiverse'],
  },
  'lost-tech': {
    id: 'lost-tech',
    name: both('고대 병기 기동', 'Lost weapon awakens'),
    rounds: [3],
    strike: 0.25,
    motifs: ['lost-tech'],
  },
  raid: {
    id: 'raid',
    name: both('매복과 보급선 약탈', 'Ambush and supply raid'),
    rounds: [1, 3],
    strike: 0.1,
    motifs: ['pirates'],
  },
  'planet-killer': {
    id: 'planet-killer',
    name: both('행성 파괴포', 'Planet-killer cannon'),
    rounds: [2],
    strike: 0.06,
    motifs: ['superweapon', 'planet-killer'],
  },
  'colony-uprising': {
    id: 'colony-uprising',
    name: both('식민지 봉기', 'Colonial uprising'),
    rounds: [1],
    boost: 0.1,
    motifs: ['colonization', 'earth-vs-colony', 'terraforming'],
  },
  megastructure: {
    id: 'megastructure',
    name: both('메가스트럭처 지원 사격', 'Megastructure support fire'),
    rounds: [1],
    motifs: ['megastructure', 'dyson-sphere', 'ringworld', 'space-elevator'],
  },
  // 아래 셋은 세력이 아니라 가세한 신적 존재·대형 병기가 일으킴 (차례는 combat.ts)
  'divine-strike': {
    id: 'divine-strike',
    name: both('신의 일격', 'Divine strike'),
    rounds: [],
    motifs: ['cosmic-being'],
  },
  'divine-duel': {
    id: 'divine-duel',
    name: both('신들의 결투', 'Duel of the gods'),
    rounds: [],
    motifs: ['cosmic-being'],
  },
  megaweapon: {
    id: 'megaweapon',
    name: both('대형 병기 발사', 'Megaweapon fires'),
    rounds: [],
    motifs: ['superweapon'],
  },
}

/* ── 대형 병기 ────────────────────────────────────── */

/**
 * 함선과 다른 꼴의 거대 병기: 싸움터에 따로 떠서 정해진 차례에 큰 일격을 날림.
 * 이름·모양은 이 프로젝트에서 지음 (특정 작품의 병기를 본뜨지 않음)
 */
export type MegaweaponId =
  | 'colossus'
  | 'bastion'
  | 'nicoll-dyson'
  | 'mass-driver'
  | 'singularity'
  | 'siege-beast'
  | 'mind-spire'
  | 'warden'
  | 'cleaver'
  | 'prism'
  | 'hourglass'

/** 3D 꼴 (ui/scene/solar/war/megaweapons.ts) */
export type MegaweaponForm =
  | 'colossus'
  | 'bastion'
  | 'mirrors'
  | 'spine'
  | 'ring'
  | 'beast'
  | 'spire'
  | 'warden'
  | 'blade'
  | 'prism'
  | 'hourglass'

/** 쏘는 모습: 곧은 광선, 날아가는 탄, 검은 구, 작은 탄 무리, 퍼지는 파동, 초승달 날 */
export type MegaweaponShot =
  'beam' | 'slug' | 'orb' | 'swarm' | 'pulse' | 'wave'

export interface Megaweapon {
  id: MegaweaponId
  name: Text
  summary: Text
  form: MegaweaponForm
  shot: MegaweaponShot
  /** 쏘는 교전 차례 (0부터) */
  rounds: number[]
  /** 한 번에 적 전력을 깎는 비율 */
  strike: number
  /** 쏠 때 제 전력을 되찾는 비율 (방벽·시간 되감기) */
  boost?: number
  motifs: MotifId[]
}

export const MEGAWEAPONS: Record<MegaweaponId, Megaweapon> = {
  colossus: {
    id: 'colossus',
    name: both('전쟁 거신병', 'War colossus'),
    summary: both(
      '궤도를 걸어 다니는 산만 한 인간형 병기. 가슴의 주포로 전열을 태웁니다.',
      'A mountain-sized humanoid war machine that strides through orbit and burns battle lines with its chest cannon.',
    ),
    form: 'colossus',
    shot: 'beam',
    rounds: [1, 3, 5],
    strike: 0.035,
    motifs: ['mech', 'superweapon'],
  },
  bastion: {
    id: 'bastion',
    name: both('방벽 거신', 'Bastion colossus'),
    summary: both(
      '육각 방패판을 겹쳐 든 거신. 방어막 파동으로 적을 밀어내며 아군을 감쌉니다.',
      'A giant bearing a wall of hexagonal shield plates; its barrier pulse shoves the enemy back and shelters its own ships.',
    ),
    form: 'bastion',
    shot: 'pulse',
    rounds: [2, 4],
    strike: 0.03,
    boost: 0.03,
    motifs: ['superweapon', 'lost-tech'],
  },
  'nicoll-dyson': {
    id: 'nicoll-dyson',
    name: both('니콜-다이슨 광선', 'Nicoll–Dyson beam'),
    summary: both(
      '다이슨 스웜의 반사경을 한 점에 모아 쏘는 항성 광선 (카르다쇼프 2단계 문명의 병기). 다이슨 스웜·다이슨 구를 지었으면 더 셉니다.',
      'A stellar beam made by focusing a Dyson swarm’s mirrors on one point (a Kardashev Type II weapon). Stronger if you have built a Dyson swarm or sphere.',
    ),
    form: 'mirrors',
    shot: 'beam',
    rounds: [3],
    strike: 0.09,
    motifs: ['megastructure', 'dyson-sphere', 'superweapon', 'optical'],
  },
  'mass-driver': {
    id: 'mass-driver',
    name: both('궤도 질량 투사기', 'Orbital mass driver'),
    summary: both(
      '가속 고리 수백 개로 쇳덩이를 광속 가까이 쏘는 상대론적 요격체 발사대. 한 발이 공룡을 멸종시킨 소행성보다 셉니다 (카르다쇼프 1단계 문명의 병기).',
      'A ring-lined launcher that throws iron slugs at near light speed: relativistic kill vehicles that each outhit the dinosaur-killing asteroid (a Kardashev Type I weapon).',
    ),
    form: 'spine',
    shot: 'slug',
    rounds: [1, 4],
    strike: 0.05,
    motifs: ['superweapon', 'megastructure'],
  },
  singularity: {
    id: 'singularity',
    name: both('특이점 투사기', 'Singularity projector'),
    summary: both(
      '거대한 고리가 작은 블랙홀을 빚어 던집니다. 스치는 함선은 조석력에 찢깁니다.',
      'A vast ring that forges a tiny black hole and hurls it; ships it grazes are torn apart by tides.',
    ),
    form: 'ring',
    shot: 'orb',
    rounds: [2, 5],
    strike: 0.05,
    motifs: ['superweapon', 'galactic-empire'],
  },
  'siege-beast': {
    id: 'siege-beast',
    name: both('공성 거수', 'Siege leviathan'),
    summary: both(
      '위성만 하게 자란 생체 병기. 마디진 몸을 비틀며 산성 포자 떼를 뿜습니다.',
      'A bio-weapon grown to the size of a moon; it writhes its segmented body and spews swarms of acid spores.',
    ),
    form: 'beast',
    shot: 'swarm',
    rounds: [1, 2, 3],
    strike: 0.03,
    motifs: ['swarm', 'alien', 'hive-mind', 'superweapon'],
  },
  'mind-spire': {
    id: 'mind-spire',
    name: both('정신 증폭 첨탑', 'Psionic spire'),
    summary: both(
      '승천한 정신들이 모인 첨탑. 생각의 파동으로 적 승무원을 쓰러뜨립니다.',
      'A spire housing ascended minds; its thought-wave knocks enemy crews senseless.',
    ),
    form: 'spire',
    shot: 'pulse',
    rounds: [2, 4],
    strike: 0.045,
    motifs: ['psionics', 'posthuman', 'superweapon'],
  },
  warden: {
    id: 'warden',
    name: both('수호 거신', 'Warden colossus'),
    summary: both(
      '오래 잠들어 있던 선조의 자율 병기. 마디진 몸을 펼치며 깨어나, 빛나는 핵에서 기계를 멈추는 정지 파동을 내뿜습니다.',
      'An autonomous precursor weapon asleep for ages. It unfolds its segmented body as it wakes and looses a stasis pulse from its glowing core that stops machines dead.',
    ),
    form: 'warden',
    shot: 'pulse',
    rounds: [2, 4],
    strike: 0.05,
    motifs: ['lost-tech', 'superweapon'],
  },
  cleaver: {
    id: 'cleaver',
    name: both('차원 절단기', 'Dimensional cleaver'),
    summary: both(
      '평행우주 너머에서 내리치는 초승달 날. 공간째로 전열을 가릅니다.',
      'A crescent blade that swings in from beyond a parallel universe and splits the battle line along with space itself.',
    ),
    form: 'blade',
    shot: 'wave',
    rounds: [3],
    strike: 0.09,
    motifs: ['parallel', 'multiverse', 'superweapon'],
  },
  prism: {
    id: 'prism',
    name: both('마도 결정포', 'Arcane prism'),
    summary: both(
      '성운에서 캐낸 거대 결정. 마력을 일곱 빛깔 광선으로 갈라 쏩니다.',
      'A colossal crystal mined from a nebula that splits arcane power into seven-coloured beams.',
    ),
    form: 'prism',
    shot: 'beam',
    rounds: [1, 3, 5],
    strike: 0.035,
    motifs: ['magitech', 'superweapon'],
  },
  hourglass: {
    id: 'hourglass',
    name: both('시간 정지포', 'Chrono-stasis engine'),
    summary: both(
      '맞물려 도는 고리 안의 모래시계. 적의 시간을 멈추고 아군의 시간을 되감습니다.',
      'An hourglass inside interlocking rings that freezes the enemy’s time and rewinds its own.',
    ),
    form: 'hourglass',
    shot: 'pulse',
    rounds: [2, 4],
    strike: 0.035,
    boost: 0.025,
    motifs: ['time-travel', 'superweapon'],
  },
}

export const MEGAWEAPON_IDS = Object.keys(MEGAWEAPONS) as MegaweaponId[]

export const isMegaweaponId = (id: string): id is MegaweaponId =>
  Object.hasOwn(MEGAWEAPONS, id)

/* ── 세력 ─────────────────────────────────────────── */

export type FactionId =
  | 'axis'
  | 'alliance'
  | 'federation'
  | 'colonies'
  | 'empire'
  | 'swarm'
  | 'pirates'
  | 'ascendancy'
  | 'precursors'
  | 'rift'
  | 'arcane'
  | 'chrono'

/** 싸움터에 오는 방식 (3D 등장 연출과 첫 기록) */
export type Arrival = 'cruise' | 'warp' | 'swarm' | 'awaken' | 'rift' | 'time'

export interface Faction {
  id: FactionId
  name: Text
  /** 이름표·카드 제목의 짧은 이름 */
  short: Text
  /** 화면의 함대 색 */
  color: string
  /** 광선·탄 색 (여러 색을 섞어 쏨) */
  lasers: string[]
  summary: Text
  /** 이 세력이 보여 주는 소재 (병기·특수 작전의 소재는 따로) */
  motifs: MotifId[]
  weapon: WeaponId
  /** 초계 함대(규모 1)의 함선 수 */
  fleet: Partial<Record<ShipClassId, number>>
  specials: SpecialId[]
  arrival: Arrival
  /** 기본으로 가세하는 신적 존재 (model/mythic/catalog.ts의 id) */
  patron: string
  /** 기본으로 내세우는 대형 병기 */
  megaweapon: MegaweaponId
}

export const FACTIONS: Faction[] = [
  {
    id: 'axis',
    name: both('악시스', 'The Axis'),
    short: both('악시스', 'Axis'),
    color: '#ff5a5a',
    lasers: ['#ff2e2e', '#ff5a36', '#ff1f5a', '#ff8a5c'],
    summary: both(
      '붉은 깃발 아래 모인 성간 군사 동맹. 워프로 전격 돌파하고 붉은 레이저 일제 사격으로 밀어붙입니다.',
      'A militarist interstellar pact under crimson banners that blitzes in through warp and pushes forward with red laser barrages.',
    ),
    motifs: ['space-war', 'battleship', 'warp'],
    weapon: 'red-laser',
    fleet: { battleship: 2, destroyer: 4, cruiser: 3, interceptor: 12 },
    specials: ['warp-strike', 'crimson-barrage'],
    arrival: 'warp',
    patron: 'surtr',
    megaweapon: 'colossus',
  },
  {
    id: 'alliance',
    name: both('더 얼라이언스', 'The Alliance'),
    short: both('얼라이언스', 'Alliance'),
    color: '#5b8dff',
    lasers: ['#3d7bff', '#4fc3ff', '#9fd3ff', '#2e5bff'],
    summary: both(
      '여러 행성 정부가 손잡은 연합 함대. 푸른 방어막 진형으로 버티며 함재기와 푸른 레이저 포화로 반격합니다.',
      'A coalition fleet of many planetary governments that holds the line with sapphire shield walls and strikes back with fighters and blue laser fire.',
    ),
    motifs: ['space-war', 'carrier', 'battleship'],
    weapon: 'blue-laser',
    fleet: { carrier: 1, battleship: 2, cruiser: 2, frigate: 5, fighter: 12 },
    specials: ['shield-wall', 'carrier-wing'],
    arrival: 'cruise',
    patron: 'black-tortoise',
    megaweapon: 'bastion',
  },
  {
    id: 'federation',
    name: both('지구 연방 우주군', 'Earth Federation Space Force'),
    short: both('연방', 'Federation'),
    color: '#8fb0ff',
    lasers: ['#9fd3ff', '#5fb4ff', '#ffffff'],
    summary: both(
      '지구 정부의 정규 함대. 우주항공모함 전단과 빔 포격, 강화복 강습대로 싸웁니다.',
      'Earth’s regular navy: carrier groups, beam broadsides and powered-armour boarding teams.',
    ),
    motifs: ['space-war', 'battleship', 'carrier', 'earth-vs-colony'],
    weapon: 'beam',
    fleet: { carrier: 1, battleship: 2, cruiser: 3, frigate: 4, fighter: 12 },
    specials: ['carrier-wing', 'boarding', 'megastructure'],
    arrival: 'cruise',
    patron: 'yellow-dragon',
    megaweapon: 'nicoll-dyson',
  },
  {
    id: 'colonies',
    name: both('자유 식민지 연합', 'Free Colonies League'),
    short: both('식민지 연합', 'Colonies'),
    color: '#ffa25c',
    lasers: ['#ffa25c', '#ffcf6b', '#ff7a45'],
    summary: both(
      '화성·소행성대·목성 위성의 개척민. 채굴선을 고친 포함과 보행 기갑, 플라즈마 포로 지구에서 독립하려 합니다.',
      'Settlers of Mars, the belt and the Jovian moons who fight for independence from Earth with converted mining ships, walking mechs and plasma cannons.',
    ),
    motifs: ['colonization', 'earth-vs-colony', 'terraforming', 'mech'],
    weapon: 'plasma',
    fleet: { cruiser: 3, frigate: 8, mech: 15, fighter: 12 },
    specials: ['colony-uprising', 'mech-drop', 'megastructure'],
    arrival: 'cruise',
    patron: 'phoenix',
    megaweapon: 'mass-driver',
  },
  {
    id: 'empire',
    name: both('아우렐리아 은하 제국', 'Aurelian Galactic Empire'),
    short: both('제국', 'Empire'),
    color: '#ffd27a',
    lasers: ['#ffd27a', '#ff9a3c', '#ff3b3b'],
    summary: both(
      '초광속 워프 항로로 은하를 다스리는 제국. 드레드노트 기함의 입자 창과 행성 파괴포를 앞세웁니다.',
      'An empire that rules the galaxy along faster-than-light warp lanes, led by dreadnoughts with particle lances and a planet-killer cannon.',
    ),
    motifs: ['galactic-empire', 'warp', 'ftl', 'battleship'],
    weapon: 'particle',
    fleet: { dreadnought: 1, battleship: 2, destroyer: 3, interceptor: 9 },
    specials: ['warp-strike', 'planet-killer'],
    arrival: 'warp',
    patron: 'ra',
    megaweapon: 'singularity',
  },
  {
    id: 'swarm',
    name: both('아카리드 군체', 'Acarid Hive'),
    short: both('군체', 'Hive'),
    color: '#6fe39b',
    lasers: ['#7dff8a', '#c8ff5a', '#3dffb4'],
    summary: both(
      '하나의 의식으로 움직이는 벌레떼 외계 종족. 생체 모함이 산성 생체탄을 뿜고, 쓰러진 만큼 떼가 다시 자라납니다.',
      'An insectoid alien species moving as one hive mind: living carriers spit bio-acid and the swarm regrows what it loses.',
    ),
    motifs: ['alien', 'swarm', 'hive-mind'],
    weapon: 'acid',
    fleet: { bioship: 3, swarmer: 58 },
    specials: ['hive-regrowth'],
    arrival: 'swarm',
    patron: 'beelzebub',
    megaweapon: 'siege-beast',
  },
  {
    id: 'pirates',
    name: both('붉은 성운 해적단', 'Crimson Nebula Corsairs'),
    short: both('해적단', 'Corsairs'),
    color: '#ff8c8c',
    lasers: ['#ff3b3b', '#ff7a59', '#ffb36b'],
    summary: both(
      '항로를 노리는 우주해적. 쾌속선으로 기습해 플라즈마 건으로 보급선을 털고 달아납니다.',
      'Space pirates preying on trade lanes: corsairs ambush, loot supply ships with plasma guns and slip away.',
    ),
    motifs: ['pirates'],
    weapon: 'plasma-gun',
    fleet: { corsair: 22, frigate: 6, fighter: 26 },
    specials: ['raid'],
    arrival: 'cruise',
    patron: 'kraken',
    megaweapon: 'mass-driver',
  },
  {
    id: 'ascendancy',
    name: both('승천자 연합', 'Ascendant Collective'),
    short: both('승천자', 'Ascendants'),
    color: '#4fc3ff',
    lasers: ['#4fc3ff', '#7df9ff', '#b6f0ff'],
    summary: both(
      '몸을 기계로 바꾼 사이보그와 트랜스휴먼, 정신을 옮겨 심은 포스트휴먼의 연합. 광학 위상 배열로 쏘고 나노 기계로 스스로 고칩니다.',
      'A union of cyborgs, transhumans and uploaded posthumans that fires optical phased arrays and heals itself with nanites.',
    ),
    motifs: ['cyborg', 'transhuman', 'posthuman'],
    weapon: 'optical',
    fleet: { station: 1, cruiser: 4, drone: 35 },
    specials: ['self-repair'],
    arrival: 'warp',
    patron: 'silent-colossus',
    megaweapon: 'mind-spire',
  },
  {
    id: 'precursors',
    name: both('잊힌 선조의 방위 체계', 'Forgotten Precursor Defence Grid'),
    short: both('선조', 'Precursors'),
    color: '#c3a8ff',
    lasers: ['#c3a8ff', '#ffffff', '#8f7bff'],
    summary: both(
      '사라진 고대 문명이 남긴 자동 방위 함대와 거대 요새. 깨어나면 지금의 과학으로는 풀 수 없는 로스트 테크놀러지로 반격합니다.',
      'Automated guardians and a colossal citadel left by a vanished civilisation; once woken they strike back with lost technology no one can explain.',
    ),
    motifs: ['lost-tech', 'megastructure'],
    weapon: 'graviton',
    fleet: { fortress: 1, cruiser: 2, drone: 24 },
    specials: ['lost-tech'],
    arrival: 'awaken',
    patron: 'nodens',
    megaweapon: 'warden',
  },
  {
    id: 'rift',
    name: both('차원 균열 침공군', 'Rift Incursion'),
    short: both('균열군', 'Rift'),
    color: '#ff6ec7',
    lasers: ['#ff6ec7', '#ff3fa4', '#c86bff'],
    summary: both(
      '평행우주에서 넘어온 또 하나의 지구 함대. 다중우주의 균열이 열릴 때마다 증원이 쏟아집니다.',
      'Another Earth’s navy from a parallel universe; every time a rift in the multiverse opens, reinforcements pour through.',
    ),
    motifs: ['parallel', 'multiverse'],
    weapon: 'beam',
    fleet: { battleship: 2, cruiser: 3, frigate: 4, fighter: 12 },
    specials: ['rift'],
    arrival: 'rift',
    patron: 'yog-sothoth',
    megaweapon: 'cleaver',
  },
  {
    id: 'arcane',
    name: both('성운 마도 기사단', 'Nebula Arcane Order'),
    short: both('기사단', 'Arcane Order'),
    color: '#d6a8ff',
    lasers: ['#d6a8ff', '#ff8cf0', '#9b7bff'],
    summary: both(
      '마법과 공학을 합친 마도공학 함선과 초능력 기사들. 마도 결계로 막고, 봉인을 풀어 우주적 존재를 깨웁니다.',
      'Magitech warships crewed by psychic knights who shield behind wards and break ancient seals to wake cosmic beings.',
    ),
    motifs: ['magitech', 'psionics', 'cosmic-being'],
    weapon: 'arcane',
    fleet: { battleship: 2, cruiser: 5, fighter: 16 },
    specials: ['psionic', 'arcane-ward', 'summon'],
    arrival: 'warp',
    patron: 'odin',
    megaweapon: 'prism',
  },
  {
    id: 'chrono',
    name: both('시간 순찰대', 'Chrono Wardens'),
    short: both('순찰대', 'Wardens'),
    color: '#9ad5ae',
    lasers: ['#9ad5ae', '#5effc8', '#e6ffb0'],
    summary: both(
      '먼 미래에서 시간여행으로 거슬러 온 순찰 함대. 초광속 항법으로 나타나고, 시간을 되감아 잃은 함선을 되돌립니다.',
      'A patrol fleet that travelled back from the far future, appearing on faster-than-light drives and rewinding time to undo its losses.',
    ),
    motifs: ['time-travel', 'ftl'],
    weapon: 'chrono',
    fleet: { cruiser: 6, frigate: 7, interceptor: 17 },
    specials: ['rewind'],
    arrival: 'time',
    patron: 'ouroboros',
    megaweapon: 'hourglass',
  },
]

export const FACTION_BY_ID = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f]),
) as Record<FactionId, Faction>

export const isFactionId = (id: string): id is FactionId =>
  Object.hasOwn(FACTION_BY_ID, id)

/** 세력이 보여 주는 소재 전부 (세력·병기·특수 작전) */
export function factionMotifs(faction: Faction): MotifId[] {
  const all = new Set<MotifId>(faction.motifs)
  const weapon = WEAPONS[faction.weapon].motif
  if (weapon) all.add(weapon)
  for (const id of faction.specials)
    for (const motif of SPECIALS[id].motifs) all.add(motif)
  return MOTIF_IDS.filter((id) => all.has(id))
}

/* ── 함대 규모 ────────────────────────────────────── */

export type FleetSize = 'patrol' | 'fleet' | 'armada' | 'total'

export const FLEET_SIZES: Record<FleetSize, { name: Text; scale: number }> = {
  patrol: { name: both('초계 함대', 'Patrol'), scale: 1 },
  fleet: { name: both('주력 함대', 'Battle fleet'), scale: 2 },
  armada: { name: both('대함대', 'Armada'), scale: 4 },
  total: { name: both('총력전', 'Total war'), scale: 8 },
}

export const FLEET_SIZE_IDS = Object.keys(FLEET_SIZES) as FleetSize[]

export const isFleetSize = (id: string): id is FleetSize =>
  Object.hasOwn(FLEET_SIZES, id)

/** 세력의 함선 수 (함대 규모를 곱함) */
export function fleetOf(
  faction: Faction,
  size: FleetSize,
): Array<{ cls: ShipClass; count: number }> {
  const scale = FLEET_SIZES[size].scale
  return (Object.keys(faction.fleet) as ShipClassId[]).map((id) => ({
    cls: SHIP_CLASSES[id],
    count: Math.round(faction.fleet[id]! * scale),
  }))
}

/** 함대 전력 (함선 전투력의 합) */
export const fleetPower = (faction: Faction, size: FleetSize) =>
  fleetOf(faction, size).reduce((sum, x) => sum + x.cls.power * x.count, 0)
