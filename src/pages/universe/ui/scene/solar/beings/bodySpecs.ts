/**
 * 우주적 존재마다 3D 몸을 무엇으로 그릴지 (자료만, 장면 코드 없음)
 * - model: 3D 모델(models.ts) + 덧붙이는 것(날개·후광·뿔·꼬리 깃·뱀 꼬리)
 * - swarm: 모델 여럿이 떼 지어 맴돎
 * - 나머지: 모델 없이 계산으로 만드는 몸 (뱀·용, 공허, 구체, 덩어리, 눈, 바퀴, 수확기, 날개 무리, 색채)
 */
import type { ModelId } from './models'

/** 덧붙이는 것을 붙일 자리 (모델의 뼈나 정점을 따라 움직임) */
export type Anchor = 'head' | 'back' | 'hips' | 'tail'

export type Extra =
  /** 날개 (깃털 / 박쥐 같은 막), 쌍 수 */
  | { kind: 'wings'; style: 'feather' | 'membrane'; pairs?: number; span?: number }
  /** 머리 위의 빛 고리 */
  | { kind: 'halo' }
  /** 머리 뒤의 해 원반 (size: 크기 배율) */
  | { kind: 'disc'; size?: number }
  /** 머리의 뿔 (하나 / 둘) */
  | { kind: 'horns'; count: 1 | 2 }
  /** 꼬리에서 흩날리는 깃 (불새) */
  | { kind: 'plumes' }
  /** 뱀 꼬리·몸 (at에서 시작해 뒤로, coil이면 몸을 감음) */
  | { kind: 'tail'; at: Anchor; count?: number; coil?: boolean }

export type BodySpec =
  | {
      kind: 'model'
      model: ModelId
      /** 같은 반지름 안에서 더 크게 (날갯짓 범위 때문에 작아 보이는 새 등) */
      scale?: number
      extras?: Extra[]
      /** 같은 모델을 돌려 겹쳐 그릴 각도 (여러 팔·얼굴) */
      ghosts?: number[]
    }
  | { kind: 'swarm'; model: ModelId; count: number }
  | {
      kind: 'serpent'
      /** serpent: 뱀, loong: 다리·뿔·수염 있는 동양 용, ring: 제 꼬리를 문 고리, hydra: 머리 여럿 */
      style: 'serpent' | 'loong' | 'ring' | 'hydra'
      heads?: number
      wings?: boolean
    }
  | { kind: 'void' }
  | { kind: 'globes' }
  | { kind: 'blob'; tentacles: number; wings?: boolean }
  | { kind: 'eye' }
  | { kind: 'wheels' }
  | { kind: 'harvester' }
  | { kind: 'winged'; pairs: number; faces?: number }
  | { kind: 'colour' }

const BIRD = 1.35
const FIRE: Extra[] = [{ kind: 'plumes' }]

export const BODIES: Record<string, BodySpec> = {
  // 아우터 갓
  azathoth: { kind: 'void' },
  'yog-sothoth': { kind: 'globes' },
  nyarlathotep: { kind: 'model', model: 'crawler', extras: [{ kind: 'halo' }] },
  'shub-niggurath': { kind: 'blob', tentacles: 9 },
  // 옛 지배자
  cthulhu: {
    kind: 'model',
    model: 'octopus',
    extras: [{ kind: 'wings', style: 'membrane' }],
  },
  dagon: { kind: 'model', model: 'anglerfish' },
  // 코스믹 호러
  'colour-out-of-space': { kind: 'colour' },
  'king-in-yellow': { kind: 'model', model: 'wizard' },
  'unblinking-eye': { kind: 'eye' },
  'starless-hunger': { kind: 'void' },
  'howling-nebula': { kind: 'blob', tentacles: 5 },
  // 엘더 갓
  nodens: { kind: 'model', model: 'king', extras: [{ kind: 'halo' }] },
  hypnos: {
    kind: 'model',
    model: 'human',
    extras: [{ kind: 'wings', style: 'feather', span: 0.7 }],
  },
  bast: { kind: 'model', model: 'panther' },
  nuwa: {
    kind: 'model',
    model: 'woman',
    extras: [{ kind: 'tail', at: 'hips' }],
  },
  pangu: { kind: 'model', model: 'human', scale: 1.1 },
  mago: { kind: 'model', model: 'woman', extras: [{ kind: 'halo' }] },
  // 신들
  ra: { kind: 'model', model: 'human', extras: [{ kind: 'disc' }] },
  marduk: { kind: 'model', model: 'king' },
  zeus: { kind: 'model', model: 'king', extras: [{ kind: 'halo' }] },
  kronos: { kind: 'model', model: 'human', scale: 1.1 },
  odin: { kind: 'model', model: 'king' },
  thor: { kind: 'model', model: 'human' },
  surtr: { kind: 'model', model: 'human', scale: 1.1, extras: [{ kind: 'disc' }] },
  gonggong: { kind: 'serpent', style: 'loong' },
  // 천사
  seraphim: { kind: 'winged', pairs: 3 },
  cherubim: { kind: 'winged', pairs: 2, faces: 4 },
  ophanim: { kind: 'wheels' },
  // 악마
  bael: { kind: 'model', model: 'spider' },
  asmodeus: {
    kind: 'model',
    model: 'king',
    extras: [{ kind: 'horns', count: 2 }],
  },
  beelzebub: { kind: 'swarm', model: 'wasp', count: 40 },
  abaddon: { kind: 'swarm', model: 'wasp', count: 56 },
  asura: { kind: 'model', model: 'human', ghosts: [-38, 38] },
  // 사신
  'azure-dragon': { kind: 'serpent', style: 'loong' },
  'white-tiger': { kind: 'model', model: 'panther' },
  'vermilion-bird': { kind: 'model', model: 'parrot', scale: BIRD, extras: FIRE },
  'black-tortoise': {
    kind: 'model',
    model: 'turtle',
    extras: [{ kind: 'tail', at: 'back', coil: true }],
  },
  'yellow-dragon': { kind: 'serpent', style: 'loong' },
  // 상서로운 짐승
  qilin: { kind: 'model', model: 'deer', extras: [{ kind: 'horns', count: 1 }] },
  fenghuang: { kind: 'model', model: 'parrot', scale: BIRD, extras: FIRE },
  yinglong: { kind: 'serpent', style: 'loong', wings: true },
  haetae: {
    kind: 'model',
    model: 'chowchow',
    extras: [{ kind: 'horns', count: 1 }],
  },
  baize: { kind: 'model', model: 'elk' },
  // 한국
  samjogo: {
    kind: 'model',
    model: 'raven',
    scale: BIRD,
    extras: [{ kind: 'disc', size: 0.55 }],
  },
  bulgae: { kind: 'model', model: 'dog' },
  bulgasari: { kind: 'model', model: 'bear' },
  imugi: { kind: 'serpent', style: 'serpent' },
  // 중국
  zhulong: { kind: 'serpent', style: 'loong' },
  tiangou: { kind: 'model', model: 'dog' },
  kunpeng: { kind: 'model', model: 'eagle', scale: 1.5 },
  hundun: { kind: 'blob', tentacles: 6, wings: true },
  taotie: { kind: 'model', model: 'goat' },
  // 일본
  orochi: { kind: 'serpent', style: 'hydra', heads: 8 },
  // 서아시아·이집트
  vritra: { kind: 'serpent', style: 'serpent' },
  tiamat: { kind: 'model', model: 'dragon', scale: 1.15 },
  leviathan: { kind: 'serpent', style: 'serpent' },
  behemoth: { kind: 'model', model: 'buffalo' },
  ziz: { kind: 'model', model: 'eagle', scale: 1.5 },
  simurgh: { kind: 'model', model: 'parrot', scale: BIRD, extras: FIRE },
  anzu: { kind: 'model', model: 'eagle', scale: BIRD },
  apep: { kind: 'serpent', style: 'serpent' },
  bennu: { kind: 'model', model: 'stork', scale: BIRD, extras: FIRE },
  // 그리스
  phoenix: { kind: 'model', model: 'parrot', scale: BIRD, extras: FIRE },
  typhon: {
    kind: 'model',
    model: 'human',
    scale: 1.1,
    extras: [
      { kind: 'tail', at: 'hips', count: 2 },
      { kind: 'wings', style: 'membrane' },
    ],
  },
  hydra: { kind: 'serpent', style: 'hydra', heads: 9 },
  pegasus: {
    kind: 'model',
    model: 'horse',
    extras: [{ kind: 'wings', style: 'feather' }],
  },
  ouroboros: { kind: 'serpent', style: 'ring' },
  // 북유럽
  jormungandr: { kind: 'serpent', style: 'ring' },
  fenrir: { kind: 'model', model: 'wolf', scale: 1.1 },
  skoll: { kind: 'model', model: 'wolf' },
  hati: { kind: 'model', model: 'wolf' },
  nidhogg: { kind: 'model', model: 'dragon' },
  hraesvelgr: { kind: 'model', model: 'eagle', scale: BIRD },
  // 괴물
  kraken: { kind: 'model', model: 'squid' },
  chimera: {
    kind: 'model',
    model: 'panther',
    extras: [
      { kind: 'horns', count: 2 },
      { kind: 'tail', at: 'tail' },
    ],
  },
  starwhale: { kind: 'model', model: 'whale' },
  'nebula-jelly': { kind: 'model', model: 'jellyfish' },
  'star-gnawer': { kind: 'model', model: 'centipede' },
  // 거대 로봇
  'silent-colossus': { kind: 'model', model: 'colossus' },
  'von-neumann-swarm': { kind: 'swarm', model: 'spaceship', count: 36 },
  'star-harvester': { kind: 'harvester' },
  'planet-breaker': { kind: 'model', model: 'mech' },
}

/** 이 몸이 받아야 하는 모델 (모델 없이 계산하는 몸이면 없음) */
export function modelOf(spec: BodySpec): ModelId | undefined {
  return spec.kind === 'model' || spec.kind === 'swarm' ? spec.model : undefined
}
