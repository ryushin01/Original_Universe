import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'
import type { BodyId } from '../solar/bodies'

/**
 * 우주적 존재: 신화·전승·창작 속 존재가 별만 한 크기로 나타나 서로 싸우고,
 * 그 싸움이 태양계에 우주적 재해를 일으킵니다 (과학 모델 밖의 신화 모드).
 *
 * 설명은 모두 이 프로젝트에서 직접 썼습니다. 아우터 갓·옛 지배자·코스믹 호러 일부는
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
  /** 전승 (직접 쓴 한두 문장) */
  lore: Text
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
    lore: both(
      '우주 한가운데에서 끝없이 들끓으며 잠든 눈먼 혼돈. 둘레의 존재들이 피리와 북으로 그 잠을 달랩니다.',
      'Blind chaos seething at the centre of everything, its sleep lulled by the piping and drumming of the beings around it.',
    ),
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
    lore: both(
      '모든 시간과 공간에 한꺼번에 닿아 있는 문이자 열쇠. 무지갯빛으로 빛나는 구체의 무리로 나타납니다.',
      'The gate and the key, touching every time and place at once; it appears as a heap of iridescent spheres.',
    ),
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
    lore: both(
      '천 개의 얼굴로 나타나는 기어오는 혼돈. 바깥 신들의 뜻을 전하며 사람들에게 기묘한 전기의 기적을 보여 줍니다.',
      'The crawling chaos of a thousand faces, herald of the Outer Gods, who dazzles crowds with uncanny electrical marvels.',
    ),
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
    lore: both(
      '천 마리 새끼를 거느린 숲의 검은 산양. 끝없이 낳고 퍼뜨리는 풍요의 악몽입니다.',
      'The black goat of the woods with a thousand young — a nightmare of endless fertility.',
    ),
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
    lore: both(
      '가라앉은 도시에서 죽은 듯 꿈꾸는 문어 머리의 거신. 별이 제자리에 오면 깨어나고, 그 꿈만으로도 예민한 사람들이 미칩니다.',
      'An octopus-headed colossus dreaming in a sunken city; it wakes when the stars are right, and its dreams alone drive sensitive minds mad.',
    ),
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
    lore: both(
      '심해에서 솟아오르는 거대한 물고기 형상의 존재. 바다 밑 오래된 것들을 거느립니다.',
      'A vast fish-like shape rising from the abyss, lord of the old things beneath the sea.',
    ),
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
    lore: both(
      '운석과 함께 떨어진, 이름 붙일 수 없는 빛깔. 닿는 것마다 잿빛으로 시들게 하고 생명을 빨아들입니다.',
      'A colour with no name that fell with a meteorite, draining the life from everything it touches and leaving it grey and brittle.',
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
    lore: both(
      '읽는 사람을 미치게 한다는 희곡 속 왕. 검은 별이 뜨는 호숫가 도시에서 너덜너덜한 노란 옷을 끌고 나타납니다.',
      'The king from a play that maddens its readers, trailing tattered yellow robes from a lakeside city beneath black stars.',
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
    lore: both(
      '은하와 은하 사이에 열려 있는 눈. 그 시선이 닿은 곳은 별빛이 바래고 생각이 흩어집니다.',
      'An eye open in the gulf between galaxies; wherever its gaze falls, starlight fades and thoughts unravel.',
    ),
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
    lore: both(
      '빛을 먹고 자라는 텅 빈 굶주림. 별 하나를 다 먹으면 다음 별로 건너갑니다.',
      'An emptiness that grows by eating light, drifting on to the next star once one is consumed.',
    ),
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
    lore: both(
      '전파로 끝없이 비명을 지르는 성운. 그 잡음을 오래 들은 사람은 같은 비명을 따라 하게 됩니다.',
      'A nebula that never stops screaming in radio static; those who listen too long start screaming with it.',
    ),
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
    lore: both(
      '커다란 심연의 주인. 조개껍데기 수레를 몰고 나타나 혼돈의 사자를 쫓아냅니다.',
      'Lord of the Great Abyss, who rides a seashell chariot and drives off the heralds of chaos.',
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
    lore: both(
      '잠의 신. 꿈의 문을 닫아 광기가 넘어오지 못하게 하지만, 그가 지나간 하늘은 밤처럼 어두워집니다.',
      'God of sleep, who shuts the gates of dream against madness — though the sky darkens like night wherever he passes.',
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
    lore: both(
      '고양이와 집을 지키는 여신. 해의 뜨거운 눈을 지니고 어둠의 짐승을 사냥합니다.',
      'The cat goddess who guards hearth and home, bearing the Sun’s hot eye as she hunts the beasts of darkness.',
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
    lore: both(
      '사람을 빚은 뱀 꼬리의 여신. 하늘이 무너지자 오색 돌을 녹여 구멍을 메우고 큰 거북의 다리로 네 기둥을 세웠습니다.',
      'The serpent-tailed goddess who shaped humankind, melting five-coloured stones to patch the broken sky and propping it up on a giant turtle’s legs.',
    ),
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
    lore: both(
      '혼돈의 알에서 깨어나 하늘과 땅을 밀어 갈라놓은 거인. 숨은 바람이, 두 눈은 해와 달이 되었습니다.',
      'The giant who hatched from the egg of chaos and pushed sky from earth; his breath became the wind, his eyes the Sun and Moon.',
    ),
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
    lore: both(
      '산과 섬을 빚었다는 거대한 할머니 여신. 치마폭에 담아 나르던 흙과 돌을 쏟아 땅을 만들었습니다.',
      'The giant grandmother goddess who made mountains and islands by spilling the earth and stones she carried in her skirt.',
    ),
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
    lore: both(
      '태양의 배를 몰고 하늘을 건너는 매 머리의 태양신. 밤마다 혼돈의 뱀 아펩과 싸워 아침을 되찾습니다.',
      'The falcon-headed sun god who sails the solar barque across the sky and battles the chaos serpent Apep every night to win back the dawn.',
    ),
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
    lore: both(
      '바람과 폭풍을 거느린 바빌론의 수호신. 원초의 바다 티아마트를 쓰러뜨리고 그 몸을 갈라 하늘과 땅을 지었습니다.',
      'Storm-wielding patron of Babylon, who felled the primordial sea Tiamat and split her body to build heaven and earth.',
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
    lore: both(
      '벼락을 휘두르는 올림포스의 왕. 머리가 별에 닿던 티폰을 벼락으로 눌러 화산 밑에 가두었습니다.',
      'Thunderbolt-hurling king of Olympus, who pinned the star-tall Typhon beneath a volcano.',
    ),
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
    lore: both(
      '자식들을 삼킨 티탄의 왕. 낫을 쥐고 흘러가는 시간을 다스립니다.',
      'The Titan king who swallowed his own children, scythe in hand, ruling the passage of time.',
    ),
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
    lore: both(
      '지혜를 얻으려고 한쪽 눈을 내준 신들의 아버지. 라그나로크에 늑대 펜리르와 맞섭니다.',
      'The All-father who gave an eye for wisdom and faces the wolf Fenrir at Ragnarök.',
    ),
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
    lore: both(
      '천둥 망치를 든 신. 세상을 휘감은 뱀 요르문간드와 서로 쓰러뜨릴 숙적입니다.',
      'The thunder god with the hammer, fated to fell — and fall to — the world serpent Jörmungandr.',
    ),
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
    lore: both(
      '불타는 나라 무스펠의 거인. 라그나로크의 끝에 불꽃 칼로 온 세상을 태웁니다.',
      'Fire giant of Muspell, who sets the whole world ablaze with his flaming sword at the end of Ragnarök.',
    ),
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
    lore: both(
      '사람 얼굴에 뱀 몸을 한 물의 신. 싸움에 지자 하늘 기둥인 부주산을 들이받아 하늘을 기울게 했습니다.',
      'The human-faced, serpent-bodied water god who, losing a war, rammed Mount Buzhou — the pillar of heaven — and tilted the sky.',
    ),
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
    lore: both(
      '여섯 날개로 얼굴과 발을 가리고 불꽃처럼 타오르는 가장 높은 천사.',
      'The highest angels, burning like flame, who veil face and feet with six wings.',
    ),
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
    lore: both(
      '사람·사자·소·독수리 네 얼굴과 네 날개를 지닌 수호 천사. 불칼을 들고 문을 지킵니다.',
      'Four-faced, four-winged guardians — human, lion, ox and eagle — who keep the gate with a flaming sword.',
    ),
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
    lore: both(
      '바퀴 안에 바퀴가 맞물려 돌고 테두리마다 눈이 가득한 천사. 쉬지 않고 모든 방향을 봅니다.',
      'Wheels turning within wheels, their rims full of eyes, watching every direction without rest.',
    ),
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
    lore: both(
      '두꺼비·사람·고양이 세 머리를 가졌다는 동방의 마왕. 모습을 감추는 힘을 준다고 전합니다.',
      'An eastern demon king said to bear three heads — toad, man and cat — and to grant the power of invisibility.',
    ),
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
    lore: both(
      '불을 뿜는 세 머리의 욕망의 마왕. 솔로몬 왕에게 붙잡혀 일을 했다고 전합니다.',
      'The fire-breathing, three-headed demon of desire, said to have been bound to labour for King Solomon.',
    ),
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
    lore: both(
      '파리 떼의 왕. 셀 수 없는 날개 소리와 함께 썩음과 역병을 몰고 옵니다.',
      'Lord of the flies, arriving with the roar of countless wings and bringing rot and plague.',
    ),
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
    lore: both(
      '끝없는 구렁의 파괴자. 쇠 가슴받이를 두른 메뚜기 떼를 거느리고 땅을 휩씁니다.',
      'The destroyer of the bottomless pit, sweeping the land with a swarm of iron-breasted locusts.',
    ),
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
    lore: both(
      '하늘의 신들과 끝없이 싸우는 세 얼굴 여섯 팔의 전사. 그 싸움터에서 ‘아수라장’이라는 말이 나왔습니다.',
      'Three-faced, six-armed warriors forever at war with the gods of heaven — their battlefield gave Korean its word for utter chaos.',
    ),
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
    lore: both(
      '동쪽과 봄, 나무 기운의 푸른 용. 비와 천둥을 부르고 잠든 생명을 깨웁니다.',
      'The azure dragon of the east and of spring, summoning rain and thunder and waking sleeping life.',
    ),
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
    lore: both(
      '서쪽과 가을, 쇠 기운의 흰 범. 싸움과 심판을 맡아 사악한 기운을 베어 냅니다.',
      'The white tiger of the west and of autumn, lord of war and judgement who cuts down evil.',
    ),
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
    lore: both(
      '남쪽과 여름, 불 기운의 붉은 새. 날개를 펴면 하늘이 노을처럼 타오릅니다.',
      'The vermilion bird of the south and of summer; when it spreads its wings the sky burns like a sunset.',
    ),
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
    lore: both(
      '북쪽과 겨울, 물 기운의 거북과 뱀. 단단한 등딱지로 북쪽 하늘을 지킵니다.',
      'The black tortoise of the north and of winter, entwined with a serpent, guarding the northern sky with its shell.',
    ),
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
    lore: both(
      '사방의 한가운데를 다스리는 누런 용. 흙의 기운으로 네 신수의 균형을 잡습니다.',
      'The yellow dragon at the centre of the four directions, balancing the other four with the power of earth.',
    ),
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
    lore: both(
      '어진 임금이 날 때 나타난다는 상서로운 짐승. 산 풀조차 밟지 않을 만큼 어집니다.',
      'The auspicious beast that appears when a wise ruler is born, so gentle it will not tread on living grass.',
    ),
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
    lore: both(
      '태평한 세상에 나타나 오동나무에만 깃드는 새들의 왕.',
      'The king of birds, appearing in times of peace and perching only on paulownia trees.',
    ),
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
    lore: both(
      '날개 달린 비의 용. 큰 싸움에서 물을 모아 황제를 도왔습니다.',
      'The winged rain dragon that gathered the waters to help the Yellow Emperor in his great war.',
    ),
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
    lore: both(
      '옳고 그름을 가리는 외뿔 짐승. 불을 먹는다고 여겨 궁궐 앞에 세워 불을 막았습니다.',
      'The one-horned judge of right and wrong, believed to eat fire and set before palaces to ward off blazes.',
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
    lore: both(
      '세상 모든 요괴의 이름과 막는 법을 안다는 흰 짐승.',
      'The white beast that knows the name of every monster and how to ward it off.',
    ),
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
    lore: both(
      '해 속에 산다는 세 발 까마귀. 고구려 고분 벽화에 해를 나타내는 그림으로 남았습니다.',
      'The three-legged crow said to live in the Sun, painted as its emblem in Goguryeo tomb murals.',
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
    lore: both(
      '어둠의 나라 임금이 해와 달을 훔쳐 오라고 보낸 개. 물었다 놓은 자리가 일식과 월식이 되었다고 합니다.',
      'Fire dogs sent by the king of a land of darkness to steal the Sun and Moon; where they bit and let go, eclipses were left behind.',
    ),
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
    lore: both(
      '쇠를 먹고 자라는 짐승. 바늘 하나에서 시작해 나라의 쇠붙이를 다 먹어 치울 만큼 커졌습니다.',
      'A beast that grows by eating iron — from a single needle until it had eaten every scrap of metal in the land.',
    ),
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
    lore: both(
      '천 년을 기다려 용이 되려는 큰 뱀. 여의주를 얻지 못하면 홍수를 일으킵니다.',
      'A great serpent waiting a thousand years to become a dragon, unleashing floods if it fails.',
    ),
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
    lore: both(
      '사람 얼굴에 붉은 뱀 몸을 한 횃불 용. 눈을 뜨면 낮이 되고 감으면 밤이 됩니다.',
      'The torch dragon with a human face and a red serpent body: when it opens its eyes it is day, when it closes them, night.',
    ),
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
    lore: both(
      '해와 달을 삼키려 드는 하늘의 개. 떨어지는 별똥별로 여겨지기도 했습니다.',
      'The heavenly dog that tries to swallow the Sun and Moon, sometimes seen as a falling meteor.',
    ),
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
    lore: both(
      '몇천 리나 되는 물고기 곤이 새 붕이 되어, 하늘을 덮는 날개로 구만 리를 날아오릅니다.',
      'The vast fish Kun becomes the bird Peng, whose sky-covering wings carry it ninety thousand li high.',
    ),
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
    lore: both(
      '얼굴 없이 여섯 다리와 네 날개만 있는 혼돈의 짐승. 일곱 구멍을 뚫어 주자 죽었다는 이야기가 있습니다.',
      'Faceless chaos with six legs and four wings — it died when seven openings were bored into it.',
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
    lore: both(
      '무엇이든 먹어 치우는 탐욕의 짐승. 옛 청동기에는 얼굴만 새겨졌습니다.',
      'The beast of greed that devours everything; ancient bronzes bear only its face.',
    ),
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
    lore: both(
      '여덟 머리와 여덟 꼬리를 가진 큰 뱀. 골짜기 여덟 개를 덮을 만큼 깁니다.',
      'The eight-headed, eight-tailed serpent long enough to span eight valleys.',
    ),
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
    lore: both(
      '세상의 물을 가둬 가뭄을 부르는 큰 뱀.',
      'The great serpent that hoards the world’s waters and brings drought.',
    ),
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
    lore: both(
      '바닷물로 된 원초의 혼돈. 괴물 열한 무리를 낳아 젊은 신들과 싸웠습니다.',
      'The primordial chaos of salt water, who bore eleven kinds of monsters to fight the younger gods.',
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
    lore: both(
      '바다를 끓게 하는 거대한 바다 괴물. 몸이 비늘 방패로 덮여 있습니다.',
      'The vast sea monster whose thrashing makes the deep boil, armoured in shields of scales.',
    ),
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
    lore: both(
      '천 개의 산에서 풀을 뜯는 땅의 거수.',
      'The land colossus that grazes a thousand hills.',
    ),
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
    lore: both(
      '날개를 펴면 해를 가린다는 하늘의 큰 새.',
      'The great bird of the sky whose spread wings blot out the Sun.',
    ),
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
    lore: both(
      '생명나무에 깃들어 사는 지혜로운 큰 새. 다친 영웅을 깃털로 고쳐 줍니다.',
      'The wise great bird nesting in the tree of life, healing wounded heroes with its feathers.',
    ),
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
    lore: both(
      '사자 머리의 폭풍 새. 신들의 운명의 서판을 훔쳐 달아났습니다.',
      'The lion-headed storm bird that stole the gods’ Tablet of Destinies.',
    ),
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
    lore: both(
      '밤마다 태양의 배를 삼키려 드는 혼돈의 뱀. 지구 가까이 오는 소행성 아포피스의 이름이 여기서 나왔습니다.',
      'The chaos serpent that tries to swallow the Sun’s barque every night — namesake of the near-Earth asteroid Apophis.',
    ),
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
    lore: both(
      '세상의 첫 해가 뜬 언덕에 내려앉은 왜가리. 소행성 베누의 이름이 되었습니다.',
      'The heron that alighted on the first hill at the first sunrise — namesake of the asteroid Bennu.',
    ),
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
    lore: both(
      '수백 년마다 스스로 불타 재에서 다시 태어나는 새.',
      'The bird that burns itself every few centuries and is reborn from its own ashes.',
    ),
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
    lore: both(
      '머리가 별에 닿고 다리가 뱀인 괴물들의 아버지. 제우스와 싸워 화산 밑에 갇혔습니다.',
      'Father of monsters, head brushing the stars and legs of coiling serpents — imprisoned under a volcano by Zeus.',
    ),
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
    lore: both(
      '머리 하나를 베면 둘이 돋는 독 뱀. 바다뱀자리가 되었습니다.',
      'The venomous serpent that grows two heads for every one cut off — now the constellation Hydra.',
    ),
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
    lore: both(
      '날개 달린 하늘의 말. 발굽이 닿은 바위에서 샘이 솟았고, 페가수스자리가 되었습니다.',
      'The winged horse whose hoof struck a spring from the rock — now the constellation Pegasus.',
    ),
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
    lore: both(
      '제 꼬리를 물고 끝없이 도는 뱀. 끝과 시작이 하나인 순환을 뜻합니다.',
      'The serpent eating its own tail: the endless cycle in which ending and beginning are one.',
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
    lore: both(
      '세상을 한 바퀴 휘감고 제 꼬리를 문 바다뱀. 꼬리를 놓으면 라그나로크가 시작됩니다.',
      'The sea serpent that encircles the world biting its own tail; when it lets go, Ragnarök begins.',
    ),
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
    lore: both(
      '신들도 겨우 묶어 둔 거대한 늑대. 사슬을 끊으면 신들의 아버지를 삼킵니다.',
      'The giant wolf the gods could barely bind; when it breaks free it swallows the All-father.',
    ),
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
    lore: both(
      '해를 쫓아 하늘을 달리는 늑대. 마침내 따라잡으면 해를 삼킵니다.',
      'The wolf that chases the Sun across the sky and swallows it when it finally catches up.',
    ),
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
    lore: both(
      '달을 쫓는 늑대. 스콜과 함께 라그나로크에 하늘의 빛을 먹어 치웁니다.',
      'The wolf that chases the Moon, devouring the lights of the sky with Sköll at Ragnarök.',
    ),
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
    lore: both(
      '세계수의 뿌리를 갉아 먹는 용.',
      'The dragon gnawing at the roots of the world tree.',
    ),
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
    lore: both(
      '독수리 모습을 한 거인. 날갯짓으로 세상의 바람을 일으킵니다.',
      'A giant in eagle form whose wingbeats raise all the winds of the world.',
    ),
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
    lore: both(
      '섬으로 착각할 만큼 거대한 바다 괴물. 배를 통째로 끌어내립니다.',
      'A sea monster so vast it is mistaken for an island, dragging whole ships beneath the waves.',
    ),
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
    lore: both(
      '사자·염소·뱀이 하나가 된 불 뿜는 괴물.',
      'The fire-breathing monster that is lion, goat and serpent at once.',
    ),
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
    lore: both(
      '별과 별 사이를 천천히 헤엄치는 거대한 고래. 한 번 숨을 쉬면 혜성 꼬리 같은 물보라가 생깁니다.',
      'A colossal whale drifting slowly between the stars; each breath throws out a spray like a comet’s tail.',
    ),
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
    lore: both(
      '수천 광년 너비의 해파리. 늘어진 촉수가 스치는 별마다 빛을 잃습니다.',
      'A jellyfish thousands of light-years across; every star its trailing tentacles brush loses its light.',
    ),
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
    lore: both(
      '행성의 속을 파먹으며 자라는 거대한 벌레.',
      'A colossal worm that grows by hollowing out the hearts of planets.',
    ),
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
    lore: both(
      '위성 깊숙이 묻혀 잠들어 있던 옛 문명의 거대 기계. 깨어나 공간을 건너뛰어 와서는, 생명은 두고 행성 하나의 회로와 기계를 한꺼번에 멈춰 옛 질서를 집행합니다.',
      'A colossal machine of a vanished civilisation, buried deep in a moon until woken. It jumps across space and enforces its ancient order by silencing every circuit on a world at once — sparing life, stopping machines.',
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
    lore: both(
      '소행성과 위성을 원료 삼아 제 몸을 끝없이 복제하는 기계 떼. 멈추라는 명령을 잊어버렸습니다.',
      'A machine swarm that copies itself endlessly from mined asteroids and moons — and has forgotten how to stop.',
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
    lore: both(
      '별에서 플라스마를 뽑아 연료로 거둬 가는 거대한 고리 기계. 거둔 만큼 별빛이 줄어듭니다.',
      'A colossal ring-machine that siphons plasma from stars as fuel; the starlight dims by whatever it takes.',
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
    lore: both(
      '행성을 쪼개 자원으로 바꾸려고 만든 거대한 기동 병기. 주인이 사라진 뒤에도 명령을 따릅니다.',
      'A gigantic war machine built to crack planets open for their resources, still obeying long after its makers vanished.',
    ),
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
  /** 삼킬 수 있는 천체 (작은 것부터) */
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
    victims: ['io', 'europa', 'ganymede', 'callisto', 'jupiter'],
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
