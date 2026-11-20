import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'
import type { BodyId } from '../solar/bodies'

/**
 * 우주적 존재: 신화·전승·창작 속 존재가 별만 한 크기로 나타나 서로 싸우고,
 * 그 싸움이 태양계에 우주적 재해를 일으킵니다 (과학 모델 밖의 신화 모드).
 *
 * 설명은 모두 이 프로젝트에서 직접 썼습니다. 긴 전승 설명은 첫 화면 묶음과 3D 워커에 실리지 않도록
 * `lore.ts`에 따로 두고 화면이 필요할 때 받습니다. 아우터 갓·옛 지배자·코스믹 호러 일부는
 * 퍼블릭 도메인인 H. P. 러브크래프트(1937년 사망)와 R. W. 체임버스(1933년 사망)의 원작을 바탕으로 하고,
 * 엘더 갓 진영은 이 프로젝트가 꾸렸습니다. 신수 후보는 나무위키 「상상의 동물」 문서를 참고했습니다.
 */

/** 진영 */
export type Faction =
  | 'outer'
  | 'old'
  | 'horror'
  | 'elder'
  | 'god'
  | 'angel'
  | 'demon'
  | 'beast'
  | 'spirit'
  | 'monster'
  | 'machine'

/** 고르는 목록의 묶음 (진영과 신수의 지역) */
export type BeingGroup =
  | 'outer'
  | 'old'
  | 'horror'
  | 'elder'
  | 'god'
  | 'angel'
  | 'demon'
  | 'symbols'
  | 'auspicious'
  | 'korea'
  | 'china'
  | 'japan'
  | 'westAsia'
  | 'greece'
  | 'norse'
  | 'spirit'
  | 'monster'
  | 'machine'

/** 속성: 오행(목·화·토·금·수)과 혼돈·빛 */
export type Element =
  'wood' | 'fire' | 'earth' | 'metal' | 'water' | 'void' | 'light'

/** 성향: 이기면 무엇을 남기는지 (질서는 회복, 혼돈은 삼킴, 자연은 권능 그대로) */
export type Alignment = 'order' | 'chaos' | 'wild'

/** 우주적 재해 */
export type Calamity =
  | 'flare'
  | 'rain'
  | 'eclipse'
  | 'frost'
  | 'heat'
  | 'madness'
  | 'radiation'
  | 'quake'
  | 'devour'
  | 'blessing'
  | 'quench'
  | 'scrap'
  | 'drought'
  | 'emp'
  | 'blight'

/** 3D에서 그리는 꼴 */
export type BeingForm =
  | 'bird'
  | 'dragon'
  | 'serpent'
  | 'hydra'
  | 'beast'
  | 'turtle'
  | 'ring'
  | 'giant'
  | 'octopus'
  | 'fish'
  | 'jelly'
  | 'worm'
  | 'formless'
  | 'void'
  | 'globes'
  | 'brood'
  | 'masks'
  | 'eye'
  | 'wheels'
  | 'angel'
  | 'swarm'
  | 'mecha'
  | 'harvester'
  | 'colour'

/** 꼴마다 달리 그릴 것 (없으면 기본) */
export interface FormOptions {
  heads?: number
  wings?: number
  arms?: number
  legs?: number
  horns?: boolean
  horn?: boolean
  mane?: boolean
  tail?: 'long' | 'fan' | 'short'
  crest?: boolean
  canine?: boolean
  feline?: boolean
  equine?: boolean
  heavy?: boolean
  maw?: boolean
  humanFace?: boolean
  serpentLegs?: boolean
  halo?: boolean
  robe?: boolean
  faces?: number
  weapon?: 'spear' | 'hammer' | 'sword' | 'scythe' | 'bow' | 'axe' | 'bolt'
  headdress?: 'falcon' | 'sun' | 'crown'
  whale?: boolean
  fins?: boolean
}

export interface Being {
  id: string
  name: Text
  faction: Faction
  group: BeingGroup
  element: Element
  alignment: Alignment
  /** 권능 (1~10): 승산·지속 시간·재해 세기 */
  power: number
  /** 일으키는 재해 [대표, 둘째] */
  calamities: [Calamity, Calamity]
  form: BeingForm
  shape?: FormOptions
  /** 3D 크기 배율 (1 = 태양만 함) */
  size?: number
  color: string
  /** 출전 */
  origin: Text
  /** 전승에서 맞서는 존재 */
  rivals?: string[]
}

const LOVECRAFT = both('H. P. 러브크래프트의 원작', 'H. P. Lovecraft')
const ORIGINAL = both('이 프로젝트의 창작', 'Original to this project')
const DEMONOLOGY = both(
  '서양 악마학 (『솔로몬의 작은 열쇠』 등)',
  'Western demonology (the Lesser Key of Solomon, etc.)',
)
const ANGELS = both(
  '아브라함 계통 전승의 천사 품계',
  'Angelic orders of Abrahamic tradition',
)
const FOUR_SYMBOLS = both(
  '동아시아 사신(四神)·오행',
  'East Asian Four Symbols and Five Phases',
)
const NORSE = both('북유럽 신화 (『에다』)', 'Norse myth (the Eddas)')
const GREEK = both('그리스 신화', 'Greek myth')

export const BEINGS: Being[] = [
  /* ── 아우터 갓 ─────────────────────────── */
  {
    id: 'azathoth',
    name: both('아자토스', 'Azathoth'),
    faction: 'outer',
    group: 'outer',
    element: 'void',
    alignment: 'chaos',
    power: 10,
    calamities: ['madness', 'quake'],
    form: 'void',
    size: 1.5,
    color: '#b388ff',
    origin: LOVECRAFT,
  },
  {
    id: 'yog-sothoth',
    name: both('요그소토스', 'Yog-Sothoth'),
    faction: 'outer',
    group: 'outer',
    element: 'void',
    alignment: 'chaos',
    power: 9,
    calamities: ['quake', 'radiation'],
    form: 'globes',
    size: 1.3,
    color: '#f0c8ff',
    origin: LOVECRAFT,
  },
  {
    id: 'nyarlathotep',
    name: both('니알라토텝', 'Nyarlathotep'),
    faction: 'outer',
    group: 'outer',
    element: 'void',
    alignment: 'chaos',
    power: 8,
    calamities: ['madness', 'flare'],
    form: 'masks',
    color: '#8f6bff',
    origin: LOVECRAFT,
    rivals: ['nodens'],
  },
  {
    id: 'shub-niggurath',
    name: both('슈브니구라스', 'Shub-Niggurath'),
    faction: 'outer',
    group: 'outer',
    element: 'void',
    alignment: 'chaos',
    power: 8,
    calamities: ['rain', 'madness'],
    form: 'brood',
    size: 1.2,
    color: '#7a5cff',
    origin: LOVECRAFT,
  },

  /* ── 옛 지배자 ─────────────────────────── */
  {
    id: 'cthulhu',
    name: both('크툴루', 'Cthulhu'),
    faction: 'old',
    group: 'old',
    element: 'void',
    alignment: 'chaos',
    power: 7,
    calamities: ['madness', 'rain'],
    form: 'octopus',
    shape: { wings: 2 },
    color: '#5fd0b0',
    origin: LOVECRAFT,
  },
  {
    id: 'dagon',
    name: both('다곤', 'Dagon'),
    faction: 'old',
    group: 'old',
    element: 'water',
    alignment: 'chaos',
    power: 5,
    calamities: ['rain', 'frost'],
    form: 'fish',
    shape: { fins: true },
    color: '#4f9fc8',
    origin: LOVECRAFT,
  },

  /* ── 코스믹 호러 ───────────────────────── */
  {
    id: 'colour-out-of-space',
    name: both('우주에서 온 색채', 'The Colour Out of Space'),
    faction: 'horror',
    group: 'horror',
    element: 'void',
    alignment: 'chaos',
    power: 7,
    calamities: ['blight', 'madness'],
    form: 'colour',
    color: '#c8ff7a',
    origin: both(
      'H. P. 러브크래프트 「우주에서 온 색채」(1927)',
      'H. P. Lovecraft, “The Colour Out of Space” (1927)',
    ),
  },
  {
    id: 'king-in-yellow',
    name: both('노란 옷의 왕', 'The King in Yellow'),
    faction: 'horror',
    group: 'horror',
    element: 'void',
    alignment: 'chaos',
    power: 7,
    calamities: ['madness', 'eclipse'],
    form: 'giant',
    shape: { robe: true, headdress: 'crown' },
    color: '#e8d04f',
    origin: both(
      'R. W. 체임버스 『노란 옷의 왕』(1895)',
      'R. W. Chambers, The King in Yellow (1895)',
    ),
  },
  {
    id: 'unblinking-eye',
    name: both('감기지 않는 눈', 'The Unblinking Eye'),
    faction: 'horror',
    group: 'horror',
    element: 'void',
    alignment: 'chaos',
    power: 8,
    calamities: ['madness', 'radiation'],
    form: 'eye',
    size: 1.2,
    color: '#ff5c7a',
    origin: ORIGINAL,
  },
  {
    id: 'starless-hunger',
    name: both('별 없는 허기', 'The Starless Hunger'),
    faction: 'horror',
    group: 'horror',
    element: 'void',
    alignment: 'chaos',
    power: 9,
    calamities: ['eclipse', 'devour'],
    form: 'void',
    size: 1.3,
    color: '#5b3df5',
    origin: ORIGINAL,
  },
  {
    id: 'howling-nebula',
    name: both('울부짖는 성운', 'The Howling Nebula'),
    faction: 'horror',
    group: 'horror',
    element: 'void',
    alignment: 'chaos',
    power: 6,
    calamities: ['flare', 'madness'],
    form: 'brood',
    size: 1.4,
    color: '#ff8ad8',
    origin: ORIGINAL,
  },

  /* ── 엘더 갓 ───────────────────────────── */
  {
    id: 'nodens',
    name: both('노덴스', 'Nodens'),
    faction: 'elder',
    group: 'elder',
    element: 'light',
    alignment: 'order',
    power: 9,
    calamities: ['blessing', 'radiation'],
    form: 'giant',
    shape: { halo: true, weapon: 'spear' },
    color: '#cfe3ff',
    origin: both(
      '켈트의 옛 신, 러브크래프트 작품의 「커다란 심연의 주인」',
      'An old Celtic god; “Lord of the Great Abyss” in Lovecraft',
    ),
    rivals: ['nyarlathotep'],
  },
  {
    id: 'hypnos',
    name: both('히프노스', 'Hypnos'),
    faction: 'elder',
    group: 'elder',
    element: 'light',
    alignment: 'order',
    power: 6,
    calamities: ['blessing', 'eclipse'],
    form: 'giant',
    shape: { halo: true, wings: 2 },
    color: '#b9c6ff',
    origin: both(
      '그리스 신화의 잠의 신, 러브크래프트 「히프노스」',
      'Greek god of sleep; Lovecraft’s “Hypnos”',
    ),
  },
  {
    id: 'bast',
    name: both('바스트', 'Bast'),
    faction: 'elder',
    group: 'elder',
    element: 'light',
    alignment: 'order',
    power: 5,
    calamities: ['blessing', 'heat'],
    form: 'beast',
    shape: { feline: true, halo: true },
    color: '#ffd08a',
    origin: both(
      '이집트 신화의 고양이 여신, 러브크래프트 작품에도 나옴',
      'Egyptian cat goddess, also honoured in Lovecraft’s tales',
    ),
  },
  {
    id: 'nuwa',
    name: both('여와', 'Nüwa'),
    faction: 'elder',
    group: 'elder',
    element: 'light',
    alignment: 'order',
    power: 8,
    calamities: ['blessing', 'quake'],
    form: 'giant',
    shape: { serpentLegs: true, halo: true },
    color: '#ffe6a8',
    origin: both('중국 신화 (『회남자』)', 'Chinese myth (Huainanzi)'),
    rivals: ['gonggong'],
  },
  {
    id: 'pangu',
    name: both('반고', 'Pangu'),
    faction: 'elder',
    group: 'elder',
    element: 'light',
    alignment: 'order',
    power: 9,
    calamities: ['quake', 'blessing'],
    form: 'giant',
    shape: { weapon: 'axe', halo: true },
    size: 1.2,
    color: '#ffefc4',
    origin: both('중국 창세 신화', 'Chinese creation myth'),
    rivals: ['hundun'],
  },
  {
    id: 'mago',
    name: both('마고', 'Mago'),
    faction: 'elder',
    group: 'elder',
    element: 'light',
    alignment: 'order',
    power: 7,
    calamities: ['rain', 'blessing'],
    form: 'giant',
    shape: { robe: true, halo: true },
    size: 1.2,
    color: '#f6d6ff',
    origin: both('한국 설화 (마고할미)', 'Korean folklore (Mago Halmi)'),
  },

  /* ── 신들 ──────────────────────────────── */
  {
    id: 'ra',
    name: both('라', 'Ra'),
    faction: 'god',
    group: 'god',
    element: 'fire',
    alignment: 'order',
    power: 9,
    calamities: ['heat', 'blessing'],
    form: 'giant',
    shape: { headdress: 'sun', weapon: 'spear' },
    color: '#ffc24a',
    origin: both('이집트 신화', 'Egyptian myth'),
    rivals: ['apep'],
  },
  {
    id: 'marduk',
    name: both('마르두크', 'Marduk'),
    faction: 'god',
    group: 'god',
    element: 'wood',
    alignment: 'order',
    power: 9,
    calamities: ['flare', 'quake'],
    form: 'giant',
    shape: { weapon: 'bow', headdress: 'crown' },
    color: '#ffd36b',
    origin: both(
      '바빌로니아 신화 (『에누마 엘리시』)',
      'Babylonian myth (Enuma Elish)',
    ),
    rivals: ['tiamat'],
  },
  {
    id: 'zeus',
    name: both('제우스', 'Zeus'),
    faction: 'god',
    group: 'god',
    element: 'wood',
    alignment: 'order',
    power: 9,
    calamities: ['flare', 'quake'],
    form: 'giant',
    shape: { weapon: 'bolt' },
    color: '#e8f0ff',
    origin: GREEK,
    rivals: ['typhon', 'kronos'],
  },
  {
    id: 'kronos',
    name: both('크로노스', 'Kronos'),
    faction: 'god',
    group: 'god',
    element: 'earth',
    alignment: 'chaos',
    power: 8,
    calamities: ['devour', 'frost'],
    form: 'giant',
    shape: { weapon: 'scythe' },
    color: '#9fb3d9',
    origin: GREEK,
    rivals: ['zeus'],
  },
  {
    id: 'odin',
    name: both('오딘', 'Odin'),
    faction: 'god',
    group: 'god',
    element: 'wood',
    alignment: 'order',
    power: 8,
    calamities: ['blessing', 'frost'],
    form: 'giant',
    shape: { weapon: 'spear', headdress: 'crown' },
    color: '#c9d6ff',
    origin: NORSE,
    rivals: ['fenrir'],
  },
  {
    id: 'thor',
    name: both('토르', 'Thor'),
    faction: 'god',
    group: 'god',
    element: 'wood',
    alignment: 'order',
    power: 8,
    calamities: ['flare', 'quake'],
    form: 'giant',
    shape: { weapon: 'hammer' },
    color: '#8fc7ff',
    origin: NORSE,
    rivals: ['jormungandr'],
  },
  {
    id: 'surtr',
    name: both('수르트', 'Surtr'),
    faction: 'god',
    group: 'god',
    element: 'fire',
    alignment: 'chaos',
    power: 9,
    calamities: ['heat', 'flare'],
    form: 'giant',
    shape: { weapon: 'sword', horns: true },
    size: 1.2,
    color: '#ff5a2b',
    origin: NORSE,
  },
  {
    id: 'gonggong',
    name: both('공공', 'Gonggong'),
    faction: 'god',
    group: 'god',
    element: 'water',
    alignment: 'chaos',
    power: 8,
    calamities: ['quake', 'rain'],
    form: 'dragon',
    shape: { humanFace: true },
    color: '#4fb0ff',
    origin: both('중국 신화 (『회남자』)', 'Chinese myth (Huainanzi)'),
    rivals: ['nuwa'],
  },

  /* ── 천사 ──────────────────────────────── */
  {
    id: 'seraphim',
    name: both('세라핌', 'Seraphim'),
    faction: 'angel',
    group: 'angel',
    element: 'light',
    alignment: 'order',
    power: 8,
    calamities: ['heat', 'blessing'],
    form: 'angel',
    shape: { wings: 6 },
    color: '#ffd9a0',
    origin: ANGELS,
  },
  {
    id: 'cherubim',
    name: both('케루빔', 'Cherubim'),
    faction: 'angel',
    group: 'angel',
    element: 'light',
    alignment: 'order',
    power: 7,
    calamities: ['blessing', 'radiation'],
    form: 'angel',
    shape: { wings: 4, faces: 4, weapon: 'sword' },
    color: '#e6f0ff',
    origin: ANGELS,
  },
  {
    id: 'ophanim',
    name: both('오파님', 'Ophanim'),
    faction: 'angel',
    group: 'angel',
    element: 'light',
    alignment: 'order',
    power: 7,
    calamities: ['radiation', 'quake'],
    form: 'wheels',
    color: '#fff2c8',
    origin: ANGELS,
  },

  /* ── 악마 ──────────────────────────────── */
  {
    id: 'bael',
    name: both('바알', 'Bael'),
    faction: 'demon',
    group: 'demon',
    element: 'void',
    alignment: 'chaos',
    power: 7,
    calamities: ['madness', 'eclipse'],
    form: 'giant',
    shape: { heads: 3, wings: 2 },
    color: '#b0ff6a',
    origin: DEMONOLOGY,
  },
  {
    id: 'asmodeus',
    name: both('아스모데우스', 'Asmodeus'),
    faction: 'demon',
    group: 'demon',
    element: 'fire',
    alignment: 'chaos',
    power: 7,
    calamities: ['heat', 'madness'],
    form: 'giant',
    shape: { heads: 3, wings: 2, horns: true },
    color: '#ff4d6d',
    origin: DEMONOLOGY,
  },
  {
    id: 'beelzebub',
    name: both('벨제붑', 'Beelzebub'),
    faction: 'demon',
    group: 'demon',
    element: 'void',
    alignment: 'chaos',
    power: 8,
    calamities: ['blight', 'madness'],
    form: 'swarm',
    size: 1.2,
    color: '#9acd32',
    origin: DEMONOLOGY,
  },
  {
    id: 'abaddon',
    name: both('아바돈', 'Abaddon'),
    faction: 'demon',
    group: 'demon',
    element: 'void',
    alignment: 'chaos',
    power: 8,
    calamities: ['rain', 'devour'],
    form: 'swarm',
    size: 1.2,
    color: '#d4a017',
    origin: DEMONOLOGY,
  },
  {
    id: 'asura',
    name: both('아수라', 'Asura'),
    faction: 'demon',
    group: 'demon',
    element: 'fire',
    alignment: 'chaos',
    power: 7,
    calamities: ['quake', 'heat'],
    form: 'giant',
    shape: { heads: 3, arms: 6 },
    color: '#ff7b54',
    origin: both('인도·불교 신화', 'Indian and Buddhist myth'),
  },

  /* ── 신수: 사신·황룡 ───────────────────── */
  {
    id: 'azure-dragon',
    name: both('청룡', 'Azure Dragon'),
    faction: 'beast',
    group: 'symbols',
    element: 'wood',
    alignment: 'order',
    power: 7,
    calamities: ['flare', 'blessing'],
    form: 'dragon',
    shape: { horns: true, legs: 4 },
    color: '#3fd6a0',
    origin: FOUR_SYMBOLS,
    rivals: ['white-tiger'],
  },
  {
    id: 'white-tiger',
    name: both('백호', 'White Tiger'),
    faction: 'beast',
    group: 'symbols',
    element: 'metal',
    alignment: 'order',
    power: 7,
    calamities: ['rain', 'radiation'],
    form: 'beast',
    shape: { feline: true },
    color: '#eef3ff',
    origin: FOUR_SYMBOLS,
    rivals: ['azure-dragon'],
  },
  {
    id: 'vermilion-bird',
    name: both('주작', 'Vermilion Bird'),
    faction: 'beast',
    group: 'symbols',
    element: 'fire',
    alignment: 'order',
    power: 7,
    calamities: ['heat', 'flare'],
    form: 'bird',
    shape: { tail: 'long', crest: true },
    color: '#ff5a3c',
    origin: FOUR_SYMBOLS,
    rivals: ['black-tortoise'],
  },
  {
    id: 'black-tortoise',
    name: both('현무', 'Black Tortoise'),
    faction: 'beast',
    group: 'symbols',
    element: 'water',
    alignment: 'order',
    power: 7,
    calamities: ['frost', 'quake'],
    form: 'turtle',
    color: '#6f8dff',
    origin: FOUR_SYMBOLS,
    rivals: ['vermilion-bird'],
  },
  {
    id: 'yellow-dragon',
    name: both('황룡', 'Yellow Dragon'),
    faction: 'beast',
    group: 'symbols',
    element: 'earth',
    alignment: 'order',
    power: 8,
    calamities: ['quake', 'blessing'],
    form: 'dragon',
    shape: { horns: true, legs: 4 },
    size: 1.1,
    color: '#f2c14e',
    origin: both('동아시아 오방(五方)·오행', 'East Asian Five Directions'),
  },

  /* ── 신수: 사령·서수 ───────────────────── */
  {
    id: 'qilin',
    name: both('기린', 'Qilin'),
    faction: 'beast',
    group: 'auspicious',
    element: 'earth',
    alignment: 'order',
    power: 6,
    calamities: ['blessing', 'heat'],
    form: 'beast',
    shape: { horn: true, mane: true },
    color: '#ffe08a',
    origin: both('동아시아 사령(四靈)', 'East Asian Four Benevolent Animals'),
  },
  {
    id: 'fenghuang',
    name: both('봉황', 'Fenghuang'),
    faction: 'beast',
    group: 'auspicious',
    element: 'fire',
    alignment: 'order',
    power: 7,
    calamities: ['blessing', 'heat'],
    form: 'bird',
    shape: { tail: 'fan', crest: true },
    color: '#ff9ad5',
    origin: both('동아시아 사령(四靈)', 'East Asian Four Benevolent Animals'),
  },
  {
    id: 'yinglong',
    name: both('응룡', 'Yinglong'),
    faction: 'beast',
    group: 'auspicious',
    element: 'water',
    alignment: 'order',
    power: 7,
    calamities: ['rain', 'frost'],
    form: 'dragon',
    shape: { horns: true, wings: 2, legs: 4 },
    color: '#6fd0ff',
    origin: both('중국 『산해경』', 'Chinese Classic of Mountains and Seas'),
  },
  {
    id: 'haetae',
    name: both('해태', 'Haetae'),
    faction: 'beast',
    group: 'auspicious',
    element: 'water',
    alignment: 'order',
    power: 5,
    calamities: ['quench', 'blessing'],
    form: 'beast',
    shape: { horn: true, mane: true },
    color: '#9fe3c8',
    origin: both(
      '한국·중국 전승 (해치)',
      'Korean and Chinese tradition (haechi)',
    ),
  },
  {
    id: 'baize',
    name: both('백택', 'Baize'),
    faction: 'beast',
    group: 'auspicious',
    element: 'wood',
    alignment: 'order',
    power: 5,
    calamities: ['blessing', 'quench'],
    form: 'beast',
    shape: { horns: true, mane: true },
    color: '#f0f4ff',
    origin: both('중국 전승', 'Chinese tradition'),
  },

  /* ── 신수: 한국 ────────────────────────── */
  {
    id: 'samjogo',
    name: both('삼족오', 'Samjogo'),
    faction: 'beast',
    group: 'korea',
    element: 'fire',
    alignment: 'order',
    power: 6,
    calamities: ['flare', 'heat'],
    form: 'bird',
    shape: { legs: 3, tail: 'short' },
    color: '#ffb347',
    origin: both(
      '동아시아 전승, 고구려 고분 벽화',
      'East Asian tradition; Goguryeo tomb murals',
    ),
  },
  {
    id: 'bulgae',
    name: both('불개', 'Bulgae'),
    faction: 'beast',
    group: 'korea',
    element: 'fire',
    alignment: 'chaos',
    power: 6,
    calamities: ['eclipse', 'heat'],
    form: 'beast',
    shape: { canine: true },
    color: '#ff7a3d',
    origin: both('한국 설화', 'Korean folktale'),
  },
  {
    id: 'bulgasari',
    name: both('불가사리', 'Bulgasari'),
    faction: 'beast',
    group: 'korea',
    element: 'metal',
    alignment: 'wild',
    power: 6,
    calamities: ['scrap', 'rain'],
    form: 'beast',
    shape: { heavy: true, horns: true },
    color: '#b8c2cc',
    origin: both('한국 설화', 'Korean folktale'),
  },
  {
    id: 'imugi',
    name: both('이무기', 'Imugi'),
    faction: 'beast',
    group: 'korea',
    element: 'water',
    alignment: 'wild',
    power: 4,
    calamities: ['rain', 'frost'],
    form: 'serpent',
    color: '#6aa6a0',
    origin: both('한국 설화', 'Korean folktale'),
  },

  /* ── 신수: 중국 ────────────────────────── */
  {
    id: 'zhulong',
    name: both('촉룡', 'Zhulong'),
    faction: 'beast',
    group: 'china',
    element: 'fire',
    alignment: 'wild',
    power: 8,
    calamities: ['eclipse', 'heat'],
    form: 'dragon',
    shape: { humanFace: true },
    size: 1.2,
    color: '#ff6b4a',
    origin: both('중국 『산해경』', 'Chinese Classic of Mountains and Seas'),
  },
  {
    id: 'tiangou',
    name: both('천구', 'Tiangou'),
    faction: 'beast',
    group: 'china',
    element: 'metal',
    alignment: 'chaos',
    power: 6,
    calamities: ['eclipse', 'rain'],
    form: 'beast',
    shape: { canine: true },
    color: '#ffd27a',
    origin: both('중국 전승', 'Chinese tradition'),
  },
  {
    id: 'kunpeng',
    name: both('곤붕', 'Kun-Peng'),
    faction: 'beast',
    group: 'china',
    element: 'water',
    alignment: 'wild',
    power: 8,
    calamities: ['eclipse', 'quake'],
    form: 'bird',
    shape: { tail: 'fan' },
    size: 1.5,
    color: '#7fb6ff',
    origin: both('중국 『장자』', 'Chinese Zhuangzi'),
  },
  {
    id: 'hundun',
    name: both('혼돈', 'Hundun'),
    faction: 'beast',
    group: 'china',
    element: 'void',
    alignment: 'chaos',
    power: 7,
    calamities: ['madness', 'quake'],
    form: 'formless',
    color: '#d9a441',
    origin: both(
      '중국 『산해경』·『장자』',
      'Chinese Classic of Mountains and Seas; Zhuangzi',
    ),
    rivals: ['pangu'],
  },
  {
    id: 'taotie',
    name: both('도철', 'Taotie'),
    faction: 'beast',
    group: 'china',
    element: 'metal',
    alignment: 'chaos',
    power: 6,
    calamities: ['devour', 'rain'],
    form: 'beast',
    shape: { maw: true, heavy: true, horns: true },
    color: '#c08a4a',
    origin: both('중국 사흉(四凶)', 'Chinese Four Perils'),
  },

  /* ── 신수: 일본 ────────────────────────── */
  {
    id: 'orochi',
    name: both('야마타노오로치', 'Yamata no Orochi'),
    faction: 'beast',
    group: 'japan',
    element: 'water',
    alignment: 'chaos',
    power: 7,
    calamities: ['rain', 'quake'],
    form: 'hydra',
    shape: { heads: 8 },
    color: '#c74b4b',
    origin: both('일본 『고사기』', 'Japanese Kojiki'),
  },

  /* ── 신수: 인도·서아시아·이집트 ────────── */
  {
    id: 'vritra',
    name: both('브리트라', 'Vritra'),
    faction: 'beast',
    group: 'westAsia',
    element: 'water',
    alignment: 'chaos',
    power: 6,
    calamities: ['drought', 'heat'],
    form: 'serpent',
    color: '#8d7bd6',
    origin: both('인도 『리그베다』', 'Indian Rigveda'),
  },
  {
    id: 'tiamat',
    name: both('티아마트', 'Tiamat'),
    faction: 'beast',
    group: 'westAsia',
    element: 'water',
    alignment: 'chaos',
    power: 9,
    calamities: ['rain', 'quake'],
    form: 'dragon',
    shape: { horns: true, wings: 2, legs: 4 },
    size: 1.3,
    color: '#4dd4c8',
    origin: both(
      '바빌로니아 신화 (『에누마 엘리시』)',
      'Babylonian myth (Enuma Elish)',
    ),
    rivals: ['marduk'],
  },
  {
    id: 'leviathan',
    name: both('레비아탄', 'Leviathan'),
    faction: 'beast',
    group: 'westAsia',
    element: 'water',
    alignment: 'wild',
    power: 8,
    calamities: ['quake', 'rain'],
    form: 'serpent',
    shape: { fins: true },
    size: 1.3,
    color: '#3fa7d6',
    origin: both('히브리 전승', 'Hebrew tradition'),
  },
  {
    id: 'behemoth',
    name: both('베헤모스', 'Behemoth'),
    faction: 'beast',
    group: 'westAsia',
    element: 'earth',
    alignment: 'wild',
    power: 8,
    calamities: ['quake', 'drought'],
    form: 'beast',
    shape: { heavy: true, horns: true },
    size: 1.3,
    color: '#b98d5a',
    origin: both('히브리 전승', 'Hebrew tradition'),
  },
  {
    id: 'ziz',
    name: both('지즈', 'Ziz'),
    faction: 'beast',
    group: 'westAsia',
    element: 'wood',
    alignment: 'wild',
    power: 7,
    calamities: ['eclipse', 'frost'],
    form: 'bird',
    shape: { tail: 'fan' },
    size: 1.4,
    color: '#b0d0ff',
    origin: both('히브리 전승', 'Hebrew tradition'),
  },
  {
    id: 'simurgh',
    name: both('시무르그', 'Simurgh'),
    faction: 'beast',
    group: 'westAsia',
    element: 'wood',
    alignment: 'order',
    power: 6,
    calamities: ['blessing', 'eclipse'],
    form: 'bird',
    shape: { tail: 'long', crest: true },
    color: '#ff9f6a',
    origin: both('페르시아 『샤나메』', 'Persian Shahnameh'),
  },
  {
    id: 'anzu',
    name: both('안주', 'Anzu'),
    faction: 'beast',
    group: 'westAsia',
    element: 'wood',
    alignment: 'chaos',
    power: 6,
    calamities: ['flare', 'frost'],
    form: 'bird',
    shape: { tail: 'short', mane: true },
    color: '#d6a24a',
    origin: both('메소포타미아 신화', 'Mesopotamian myth'),
  },
  {
    id: 'apep',
    name: both('아펩', 'Apep'),
    faction: 'beast',
    group: 'westAsia',
    element: 'void',
    alignment: 'chaos',
    power: 8,
    calamities: ['eclipse', 'madness'],
    form: 'serpent',
    size: 1.2,
    color: '#7c4dff',
    origin: both('이집트 신화', 'Egyptian myth'),
    rivals: ['ra'],
  },
  {
    id: 'bennu',
    name: both('베누', 'Bennu'),
    faction: 'beast',
    group: 'westAsia',
    element: 'fire',
    alignment: 'order',
    power: 6,
    calamities: ['blessing', 'heat'],
    form: 'bird',
    shape: { crest: true, tail: 'long' },
    color: '#ffc76b',
    origin: both('이집트 신화', 'Egyptian myth'),
  },

  /* ── 신수: 그리스 ──────────────────────── */
  {
    id: 'phoenix',
    name: both('불사조', 'Phoenix'),
    faction: 'beast',
    group: 'greece',
    element: 'fire',
    alignment: 'order',
    power: 7,
    calamities: ['heat', 'blessing'],
    form: 'bird',
    shape: { tail: 'long', crest: true },
    size: 1.2,
    color: '#ff7b2e',
    origin: both('그리스·로마 전승', 'Greek and Roman tradition'),
  },
  {
    id: 'typhon',
    name: both('티폰', 'Typhon'),
    faction: 'beast',
    group: 'greece',
    element: 'fire',
    alignment: 'chaos',
    power: 9,
    calamities: ['flare', 'quake'],
    form: 'giant',
    shape: { serpentLegs: true, wings: 2 },
    size: 1.3,
    color: '#ff8a5c',
    origin: both('그리스 신화 (헤시오도스)', 'Greek myth (Hesiod)'),
    rivals: ['zeus'],
  },
  {
    id: 'hydra',
    name: both('히드라', 'Hydra'),
    faction: 'beast',
    group: 'greece',
    element: 'water',
    alignment: 'chaos',
    power: 6,
    calamities: ['radiation', 'rain'],
    form: 'hydra',
    shape: { heads: 7 },
    color: '#6fe08a',
    origin: GREEK,
  },
  {
    id: 'pegasus',
    name: both('페가수스', 'Pegasus'),
    faction: 'beast',
    group: 'greece',
    element: 'light',
    alignment: 'order',
    power: 5,
    calamities: ['blessing', 'quench'],
    form: 'beast',
    shape: { equine: true, wings: 2 },
    color: '#e0f0ff',
    origin: GREEK,
    rivals: ['chimera'],
  },
  {
    id: 'ouroboros',
    name: both('우로보로스', 'Ouroboros'),
    faction: 'beast',
    group: 'greece',
    element: 'earth',
    alignment: 'wild',
    power: 8,
    calamities: ['quake', 'blessing'],
    form: 'ring',
    color: '#d8c060',
    origin: both(
      '이집트·그리스 연금술 전승',
      'Egyptian and Greek alchemical tradition',
    ),
  },

  /* ── 신수: 북유럽 ──────────────────────── */
  {
    id: 'jormungandr',
    name: both('요르문간드', 'Jörmungandr'),
    faction: 'beast',
    group: 'norse',
    element: 'water',
    alignment: 'chaos',
    power: 9,
    calamities: ['radiation', 'quake'],
    form: 'ring',
    size: 1.4,
    color: '#4fc0a0',
    origin: NORSE,
    rivals: ['thor'],
  },
  {
    id: 'fenrir',
    name: both('펜리르', 'Fenrir'),
    faction: 'beast',
    group: 'norse',
    element: 'void',
    alignment: 'chaos',
    power: 8,
    calamities: ['devour', 'frost'],
    form: 'beast',
    shape: { canine: true },
    size: 1.2,
    color: '#8fa0c0',
    origin: NORSE,
    rivals: ['odin'],
  },
  {
    id: 'skoll',
    name: both('스콜', 'Sköll'),
    faction: 'beast',
    group: 'norse',
    element: 'fire',
    alignment: 'chaos',
    power: 6,
    calamities: ['eclipse', 'heat'],
    form: 'beast',
    shape: { canine: true },
    color: '#ffa04a',
    origin: NORSE,
    rivals: ['hati'],
  },
  {
    id: 'hati',
    name: both('하티', 'Hati'),
    faction: 'beast',
    group: 'norse',
    element: 'water',
    alignment: 'chaos',
    power: 6,
    calamities: ['devour', 'frost'],
    form: 'beast',
    shape: { canine: true },
    color: '#a8c0ff',
    origin: NORSE,
    rivals: ['skoll'],
  },
  {
    id: 'nidhogg',
    name: both('니드호그', 'Níðhöggr'),
    faction: 'beast',
    group: 'norse',
    element: 'earth',
    alignment: 'chaos',
    power: 7,
    calamities: ['devour', 'quake'],
    form: 'dragon',
    shape: { wings: 2, horns: true },
    color: '#6b8f5a',
    origin: NORSE,
  },
  {
    id: 'hraesvelgr',
    name: both('흐레스벨그', 'Hræsvelgr'),
    faction: 'beast',
    group: 'norse',
    element: 'wood',
    alignment: 'wild',
    power: 6,
    calamities: ['frost', 'flare'],
    form: 'bird',
    shape: { tail: 'fan' },
    size: 1.2,
    color: '#cfe0ff',
    origin: NORSE,
  },

  /* ── 영수 ────────────────────────────────── */
  {
    id: 'gumiho',
    name: both('구미호', 'Gumiho'),
    faction: 'spirit',
    group: 'spirit',
    element: 'fire',
    alignment: 'wild',
    power: 6,
    calamities: ['madness', 'eclipse'],
    form: 'beast',
    shape: { canine: true, tail: 'fan' },
    color: '#ff9f6b',
    origin: both(
      '한국·중국·일본 전승 (『산해경』의 아홉 꼬리 여우)',
      'Korean, Chinese and Japanese folklore (the nine-tailed fox of the Classic of Mountains and Seas)',
    ),
  },
  {
    id: 'pixiu',
    name: both('비휴', 'Pixiu'),
    faction: 'spirit',
    group: 'spirit',
    element: 'metal',
    alignment: 'order',
    power: 6,
    calamities: ['scrap', 'blessing'],
    form: 'beast',
    shape: { feline: true, horn: true, wings: 2 },
    color: '#e8c26a',
    origin: both(
      '중국 전승 (재물을 지키는 영수)',
      'Chinese folklore (a guardian of wealth)',
    ),
  },
  {
    id: 'baku',
    name: both('맥', 'Baku'),
    faction: 'spirit',
    group: 'spirit',
    element: 'water',
    alignment: 'order',
    power: 4,
    calamities: ['blessing', 'quench'],
    form: 'beast',
    shape: { heavy: true },
    color: '#9fb8ff',
    origin: both(
      '중국·일본 전승 (악몽을 먹는 맥)',
      'Chinese and Japanese folklore (the nightmare-eating baku)',
    ),
  },
  {
    id: 'jingwei',
    name: both('정위', 'Jingwei'),
    faction: 'spirit',
    group: 'spirit',
    element: 'wood',
    alignment: 'wild',
    power: 3,
    calamities: ['drought', 'rain'],
    form: 'bird',
    shape: { crest: true },
    size: 0.8,
    color: '#9be37a',
    origin: both(
      '중국 신화 (『산해경』)',
      'Chinese myth (Classic of Mountains and Seas)',
    ),
  },
  {
    id: 'bifang',
    name: both('필방', 'Bifang'),
    faction: 'spirit',
    group: 'spirit',
    element: 'fire',
    alignment: 'wild',
    power: 5,
    calamities: ['heat', 'flare'],
    form: 'bird',
    shape: { tail: 'long' },
    color: '#ff6b4a',
    origin: both(
      '중국 신화 (『산해경』의 외다리 불새)',
      'Chinese myth (the one-legged fire bird of the Classic of Mountains and Seas)',
    ),
  },
  {
    id: 'jade-rabbit',
    name: both('옥토끼', 'Jade Rabbit'),
    faction: 'spirit',
    group: 'spirit',
    element: 'light',
    alignment: 'order',
    power: 3,
    calamities: ['blessing', 'frost'],
    form: 'beast',
    shape: { halo: true },
    size: 0.7,
    color: '#f2f4ff',
    origin: both(
      '동아시아 전승 (달의 토끼)',
      'East Asian folklore (the rabbit in the Moon)',
    ),
  },
  {
    id: 'chanchu',
    name: both('섬여', 'Chan Chu'),
    faction: 'spirit',
    group: 'spirit',
    element: 'water',
    alignment: 'wild',
    power: 4,
    calamities: ['eclipse', 'frost'],
    form: 'turtle',
    size: 0.8,
    color: '#7fd1b9',
    origin: both(
      '중국 전승 (달의 두꺼비)',
      'Chinese folklore (the toad in the Moon)',
    ),
  },
  {
    id: 'cheonma',
    name: both('천마', 'Cheonma'),
    faction: 'spirit',
    group: 'spirit',
    element: 'light',
    alignment: 'order',
    power: 5,
    calamities: ['blessing', 'quench'],
    form: 'beast',
    shape: { equine: true, wings: 2, mane: true },
    color: '#cfe3ff',
    origin: both(
      '한국 전승 (신라 천마도)',
      'Korean tradition (the Silla Heavenly Horse painting)',
    ),
  },
  {
    id: 'nue',
    name: both('누에', 'Nue'),
    faction: 'spirit',
    group: 'spirit',
    element: 'void',
    alignment: 'chaos',
    power: 5,
    calamities: ['madness', 'emp'],
    form: 'beast',
    shape: { feline: true, tail: 'long' },
    color: '#a58bff',
    origin: both(
      '일본 전승 (『헤이케 이야기』)',
      'Japanese legend (The Tale of the Heike)',
    ),
  },
  {
    id: 'raiju',
    name: both('라이주', 'Raijū'),
    faction: 'spirit',
    group: 'spirit',
    element: 'metal',
    alignment: 'wild',
    power: 5,
    calamities: ['emp', 'flare'],
    form: 'beast',
    shape: { canine: true },
    color: '#8fd3ff',
    origin: both(
      '일본 전승 (번개와 함께 떨어지는 뇌수)',
      'Japanese folklore (the thunder beast that falls with lightning)',
    ),
  },
  {
    id: 'unicorn',
    name: both('유니콘', 'Unicorn'),
    faction: 'spirit',
    group: 'spirit',
    element: 'light',
    alignment: 'order',
    power: 5,
    calamities: ['quench', 'blessing'],
    form: 'beast',
    shape: { equine: true, horn: true, mane: true },
    color: '#fff1fb',
    origin: both(
      '유럽 전승 (중세 동물지)',
      'European legend (medieval bestiaries)',
    ),
  },
  {
    id: 'griffin',
    name: both('그리핀', 'Griffin'),
    faction: 'spirit',
    group: 'spirit',
    element: 'earth',
    alignment: 'order',
    power: 6,
    calamities: ['quake', 'scrap'],
    form: 'beast',
    shape: { feline: true, wings: 2, crest: true },
    color: '#d9a85b',
    origin: both('그리스·서아시아 전승', 'Greek and West Asian legend'),
  },
  /* ── 몬스터 ────────────────────────────── */
  {
    id: 'kraken',
    name: both('크라켄', 'Kraken'),
    faction: 'monster',
    group: 'monster',
    element: 'water',
    alignment: 'wild',
    power: 7,
    calamities: ['rain', 'quake'],
    form: 'octopus',
    size: 1.2,
    color: '#c05a7a',
    origin: both('북유럽·유럽 전승', 'Scandinavian and European folklore'),
  },
  {
    id: 'chimera',
    name: both('키메라', 'Chimera'),
    faction: 'monster',
    group: 'monster',
    element: 'fire',
    alignment: 'chaos',
    power: 6,
    calamities: ['heat', 'radiation'],
    form: 'beast',
    shape: { feline: true, heads: 2, mane: true },
    color: '#ff8f5a',
    origin: GREEK,
    rivals: ['pegasus'],
  },
  {
    id: 'starwhale',
    name: both('별고래', 'Starwhale'),
    faction: 'monster',
    group: 'monster',
    element: 'water',
    alignment: 'wild',
    power: 7,
    calamities: ['rain', 'frost'],
    form: 'fish',
    shape: { whale: true },
    size: 1.5,
    color: '#7fc8ff',
    origin: ORIGINAL,
  },
  {
    id: 'nebula-jelly',
    name: both('성운 해파리', 'Nebula Jellyfish'),
    faction: 'monster',
    group: 'monster',
    element: 'water',
    alignment: 'wild',
    power: 6,
    calamities: ['eclipse', 'radiation'],
    form: 'jelly',
    size: 1.4,
    color: '#b98cff',
    origin: ORIGINAL,
  },
  {
    id: 'star-gnawer',
    name: both('별갉이', 'Star-gnawer'),
    faction: 'monster',
    group: 'monster',
    element: 'earth',
    alignment: 'chaos',
    power: 7,
    calamities: ['devour', 'quake'],
    form: 'worm',
    size: 1.2,
    color: '#c9a27a',
    origin: ORIGINAL,
  },

  /* ── 거대 로봇 ─────────────────────────── */
  {
    id: 'silent-colossus',
    name: both('침묵의 거신', 'The Silent Colossus'),
    faction: 'machine',
    group: 'machine',
    element: 'metal',
    alignment: 'order',
    power: 8,
    calamities: ['emp', 'quake'],
    form: 'mecha',
    size: 1.2,
    color: '#8ee6ff',
    origin: both(
      '이 프로젝트의 창작 (잠든 고대 거대 기계라는 SF 개념을 참고)',
      'Original to this project (after the sci-fi idea of dormant ancient war machines)',
    ),
  },
  {
    id: 'von-neumann-swarm',
    name: both('자기 복제 탐사선 무리', 'Von Neumann Swarm'),
    faction: 'machine',
    group: 'machine',
    element: 'metal',
    alignment: 'wild',
    power: 7,
    calamities: ['devour', 'scrap'],
    form: 'swarm',
    size: 1.2,
    color: '#9fffcf',
    origin: both(
      'SF 일반 개념 (폰 노이만 탐사선)',
      'General sci-fi concept (von Neumann probes)',
    ),
  },
  {
    id: 'star-harvester',
    name: both('항성 수확기', 'Star Harvester'),
    faction: 'machine',
    group: 'machine',
    element: 'metal',
    alignment: 'wild',
    power: 8,
    calamities: ['eclipse', 'flare'],
    form: 'harvester',
    size: 1.3,
    color: '#ffd0a0',
    origin: both(
      'SF 일반 개념 (항성 채굴)',
      'General sci-fi concept (star lifting)',
    ),
  },
  {
    id: 'planet-breaker',
    name: both('행성 파쇄 병기', 'Planet Breaker'),
    faction: 'machine',
    group: 'machine',
    element: 'metal',
    alignment: 'chaos',
    power: 9,
    calamities: ['quake', 'rain'],
    form: 'mecha',
    shape: { heavy: true },
    size: 1.4,
    color: '#ff9f7a',
    origin: ORIGINAL,
  },
]

export const BEING_BY_ID: Record<string, Being> = Object.fromEntries(
  BEINGS.map((b) => [b.id, b]),
)

export const isBeingId = (id: string): boolean => Object.hasOwn(BEING_BY_ID, id)

export const FACTION_NAME: Record<Faction, Text> = {
  outer: both('아우터 갓', 'Outer God'),
  old: both('옛 지배자', 'Great Old One'),
  horror: both('코스믹 호러', 'Cosmic horror'),
  elder: both('엘더 갓', 'Elder God'),
  god: both('신', 'God'),
  angel: both('천사', 'Angel'),
  demon: both('악마', 'Demon'),
  beast: both('신수', 'Divine beast'),
  spirit: both('영수', 'Spirit beast'),
  monster: both('몬스터', 'Monster'),
  machine: both('거대 로봇', 'Giant robot'),
}

/** 고르는 목록의 묶음 이름 (순서대로 보임) */
export const GROUP_NAME: Record<BeingGroup, Text> = {
  outer: both('아우터 갓', 'Outer Gods'),
  old: both('옛 지배자', 'Great Old Ones'),
  horror: both('코스믹 호러', 'Cosmic horrors'),
  elder: both('엘더 갓', 'Elder Gods'),
  god: both('신들', 'Gods'),
  angel: both('천사', 'Angels'),
  demon: both('악마', 'Demons'),
  symbols: both('신수 · 사신과 황룡', 'Divine beasts · Four Symbols'),
  auspicious: both('신수 · 사령과 서수', 'Divine beasts · Auspicious'),
  korea: both('신수 · 한국', 'Divine beasts · Korea'),
  china: both('신수 · 중국', 'Divine beasts · China'),
  japan: both('신수 · 일본', 'Divine beasts · Japan'),
  westAsia: both(
    '신수 · 인도·서아시아·이집트',
    'Divine beasts · India, West Asia, Egypt',
  ),
  greece: both('신수 · 그리스', 'Divine beasts · Greece'),
  norse: both('신수 · 북유럽', 'Divine beasts · Norse'),
  spirit: both('영수', 'Spirit beasts'),
  monster: both('몬스터', 'Monsters'),
  machine: both('거대 로봇', 'Giant robots'),
}

export const ELEMENT_NAME: Record<Element, Text> = {
  wood: both('목(나무)', 'Wood'),
  fire: both('화(불)', 'Fire'),
  earth: both('토(흙)', 'Earth'),
  metal: both('금(쇠)', 'Metal'),
  water: both('수(물)', 'Water'),
  void: both('혼돈', 'Void'),
  light: both('빛', 'Light'),
}

export const ALIGNMENT_NAME: Record<Alignment, Text> = {
  order: both('질서', 'Order'),
  chaos: both('혼돈', 'Chaos'),
  wild: both('자연', 'Wild'),
}

export interface CalamitySpec {
  name: Text
  /** 미리보기에 쓰는 짧은 설명 */
  note: Text
}

export const CALAMITIES: Record<Calamity, CalamitySpec> = {
  flare: {
    name: both('항성 플레어', 'Stellar flare'),
    note: both(
      '태양에서 큰 코로나 질량 방출이 터짐',
      'A huge coronal mass ejection from the Sun',
    ),
  },
  rain: {
    name: both('파편 비', 'Debris rain'),
    note: both(
      '부서진 조각이 행성으로 날아옴',
      'Shattered fragments fly toward the planets',
    ),
  },
  eclipse: {
    name: both('태양 잠식', 'Sun-eating'),
    note: both(
      '해를 물어 햇빛이 줄었다가 몇 달에 걸쳐 돌아옴',
      'The Sun is bitten; sunlight dims and recovers over months',
    ),
  },
  frost: {
    name: both('혹한', 'Deep freeze'),
    note: both('지구가 몇 해 동안 차가워짐', 'Earth chills for a few years'),
  },
  heat: {
    name: both('작열', 'Scorching'),
    note: both('지구가 몇 해 동안 뜨거워짐', 'Earth bakes for a few years'),
  },
  madness: {
    name: both('광기의 파동', 'Wave of madness'),
    note: both(
      '꿈으로 퍼지는 광기에 사람과 생물이 스러짐',
      'Madness spreads through dreams; people and life wither',
    ),
  },
  radiation: {
    name: both('신성 방사', 'Divine radiation'),
    note: both(
      '감마선 같은 포효에 오존층이 깎임',
      'A gamma-ray roar strips the ozone layer',
    ),
  },
  quake: {
    name: both('중력 파동', 'Gravity quake'),
    note: both(
      '싸움터 행성의 궤도가 바뀜',
      'Orbits near the battlefield are knocked askew',
    ),
  },
  devour: {
    name: both('삼킴', 'Devouring'),
    note: both('싸움터의 천체를 삼킴', 'Swallows a body near the battlefield'),
  },
  blessing: {
    name: both('가호', 'Blessing'),
    note: both(
      '오존·생물·인구가 회복되고 냉각·잠식이 풀림',
      'Ozone, life and people recover; chills and dimming lift',
    ),
  },
  quench: {
    name: both('불끄기', 'Quenching'),
    note: both(
      '오고 있는 태양 폭풍과 열기를 꺼뜨림',
      'Puts out solar storms on their way and any heatwave',
    ),
  },
  scrap: {
    name: both('쇠 먹기', 'Iron-eating'),
    note: both(
      '완공된 우주 구조물 하나를 먹어 치움',
      'Eats one finished space structure',
    ),
  },
  drought: {
    name: both('가뭄', 'Drought'),
    note: both('지구의 바다 일부가 사라짐', 'Part of Earth’s oceans vanish'),
  },
  emp: {
    name: both('전자기 침묵', 'Electromagnetic silence'),
    note: both(
      '생명은 두고 전력망·위성·기지의 기계를 멈춤',
      'Spares life but stops grids, satellites and colony machinery',
    ),
  },
  blight: {
    name: both('생명 시듦', 'Withering'),
    note: both(
      '닿은 생명이 잿빛으로 시듦',
      'Life it touches turns grey and brittle',
    ),
  },
}

/** 싸움터 */
export type SiteId = 'sun' | 'earth' | 'mars' | 'jupiter' | 'kuiper' | 'deep'

export interface BattleSite {
  id: SiteId
  name: Text
  /** 지구에 미치는 정도 (0~1) */
  reach: number
  /** 태양 잠식이 지구 햇빛에 미치는 정도 (0~1) */
  shade: number
  /** 이 싸움터의 천체 (중력 파동·파편 비) */
  bodies: BodyId[]
  /** 삼킬 수 있는 천체 (고를 때 반지름 순으로 정렬) */
  victims: BodyId[]
  /** 이 싸움터를 쓰려면 있어야 하는 천체 */
  anchor: BodyId | null
}

export const SITES: BattleSite[] = [
  {
    id: 'sun',
    name: both('태양 곁', 'Beside the Sun'),
    reach: 0.6,
    shade: 1,
    bodies: ['mercury', 'venus'],
    victims: ['mercury', 'venus'],
    anchor: null,
  },
  {
    id: 'earth',
    name: both('지구 곁', 'Beside Earth'),
    reach: 1,
    shade: 0.8,
    bodies: ['earth', 'moon'],
    victims: ['apophis', 'moon', 'earth'],
    anchor: 'earth',
  },
  {
    id: 'mars',
    name: both('화성 곁', 'Beside Mars'),
    reach: 0.4,
    shade: 0.5,
    bodies: ['mars', 'ceres'],
    victims: ['ceres', 'mars'],
    anchor: 'mars',
  },
  {
    id: 'jupiter',
    name: both('목성 곁', 'Beside Jupiter'),
    reach: 0.25,
    shade: 0.3,
    bodies: ['jupiter', 'io', 'europa', 'ganymede', 'callisto'],
    victims: ['europa', 'io', 'callisto', 'ganymede', 'jupiter'],
    anchor: 'jupiter',
  },
  {
    id: 'kuiper',
    name: both('카이퍼 벨트', 'Kuiper Belt'),
    reach: 0.1,
    shade: 0.15,
    bodies: ['neptune', 'pluto'],
    victims: ['halley', 'pluto', 'neptune'],
    anchor: null,
  },
  {
    id: 'deep',
    name: both(
      '성간 우주 (은하 중심 쪽)',
      'Deep space (toward the galactic centre)',
    ),
    reach: 0.05,
    shade: 0.05,
    bodies: [],
    victims: [],
    anchor: null,
  },
]

export const SITE_BY_ID = Object.fromEntries(
  SITES.map((s) => [s.id, s]),
) as Record<SiteId, BattleSite>

export const isSiteId = (id: string): id is SiteId =>
  Object.hasOwn(SITE_BY_ID, id)
