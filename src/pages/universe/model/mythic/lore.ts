import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'

/**
 * 우주적 존재의 전승 설명 (직접 쓴 한두 문장, 존재 id → 두 언어).
 * 첫 화면 묶음과 3D 워커에 실리지 않도록 따로 두고, 우주적 존재 탭·정보 카드가 처음 필요할 때 받습니다.
 */
export const LORE: Record<string, Text> = {
  azathoth: both(
    '우주 한가운데에서 끝없이 들끓으며 잠든 눈먼 혼돈. 둘레의 존재들이 피리와 북으로 그 잠을 달랩니다.',
    'Blind chaos seething at the centre of everything, its sleep lulled by the piping and drumming of the beings around it.',
  ),
  'yog-sothoth': both(
    '모든 시간과 공간에 한꺼번에 닿아 있는 문이자 열쇠. 무지갯빛으로 빛나는 구체의 무리로 나타납니다.',
    'The gate and the key, touching every time and place at once; it appears as a heap of iridescent spheres.',
  ),
  nyarlathotep: both(
    '천 개의 얼굴로 나타나는 기어오는 혼돈. 바깥 신들의 뜻을 전하며 사람들에게 기묘한 전기의 기적을 보여 줍니다.',
    'The crawling chaos of a thousand faces, herald of the Outer Gods, who dazzles crowds with uncanny electrical marvels.',
  ),
  'shub-niggurath': both(
    '천 마리 새끼를 거느린 숲의 검은 산양. 끝없이 낳고 퍼뜨리는 풍요의 악몽입니다.',
    'The black goat of the woods with a thousand young — a nightmare of endless fertility.',
  ),
  cthulhu: both(
    '가라앉은 도시에서 죽은 듯 꿈꾸는 문어 머리의 거신. 별이 제자리에 오면 깨어나고, 그 꿈만으로도 예민한 사람들이 미칩니다.',
    'An octopus-headed colossus dreaming in a sunken city; it wakes when the stars are right, and its dreams alone drive sensitive minds mad.',
  ),
  dagon: both(
    '심해에서 솟아오르는 거대한 물고기 형상의 존재. 바다 밑 오래된 것들을 거느립니다.',
    'A vast fish-like shape rising from the abyss, lord of the old things beneath the sea.',
  ),
  'colour-out-of-space': both(
    '운석과 함께 떨어진, 이름 붙일 수 없는 빛깔. 닿는 것마다 잿빛으로 시들게 하고 생명을 빨아들입니다.',
    'A colour with no name that fell with a meteorite, draining the life from everything it touches and leaving it grey and brittle.',
  ),
  'king-in-yellow': both(
    '읽는 사람을 미치게 한다는 희곡 속 왕. 검은 별이 뜨는 호숫가 도시에서 너덜너덜한 노란 옷을 끌고 나타납니다.',
    'The king from a play that maddens its readers, trailing tattered yellow robes from a lakeside city beneath black stars.',
  ),
  'unblinking-eye': both(
    '은하와 은하 사이에 열려 있는 눈. 그 시선이 닿은 곳은 별빛이 바래고 생각이 흩어집니다.',
    'An eye open in the gulf between galaxies; wherever its gaze falls, starlight fades and thoughts unravel.',
  ),
  'starless-hunger': both(
    '빛을 먹고 자라는 텅 빈 굶주림. 별 하나를 다 먹으면 다음 별로 건너갑니다.',
    'An emptiness that grows by eating light, drifting on to the next star once one is consumed.',
  ),
  'howling-nebula': both(
    '전파로 끝없이 비명을 지르는 성운. 그 잡음을 오래 들은 사람은 같은 비명을 따라 하게 됩니다.',
    'A nebula that never stops screaming in radio static; those who listen too long start screaming with it.',
  ),
  nodens: both(
    '커다란 심연의 주인. 조개껍데기 수레를 몰고 나타나 혼돈의 사자를 쫓아냅니다.',
    'Lord of the Great Abyss, who rides a seashell chariot and drives off the heralds of chaos.',
  ),
  hypnos: both(
    '잠의 신. 꿈의 문을 닫아 광기가 넘어오지 못하게 하지만, 그가 지나간 하늘은 밤처럼 어두워집니다.',
    'God of sleep, who shuts the gates of dream against madness — though the sky darkens like night wherever he passes.',
  ),
  bast: both(
    '고양이와 집을 지키는 여신. 해의 뜨거운 눈을 지니고 어둠의 짐승을 사냥합니다.',
    'The cat goddess who guards hearth and home, bearing the Sun’s hot eye as she hunts the beasts of darkness.',
  ),
  nuwa: both(
    '사람을 빚은 뱀 꼬리의 여신. 하늘이 무너지자 오색 돌을 녹여 구멍을 메우고 큰 거북의 다리로 네 기둥을 세웠습니다.',
    'The serpent-tailed goddess who shaped humankind, melting five-coloured stones to patch the broken sky and propping it up on a giant turtle’s legs.',
  ),
  pangu: both(
    '혼돈의 알에서 깨어나 하늘과 땅을 밀어 갈라놓은 거인. 숨은 바람이, 두 눈은 해와 달이 되었습니다.',
    'The giant who hatched from the egg of chaos and pushed sky from earth; his breath became the wind, his eyes the Sun and Moon.',
  ),
  mago: both(
    '산과 섬을 빚었다는 거대한 할머니 여신. 치마폭에 담아 나르던 흙과 돌을 쏟아 땅을 만들었습니다.',
    'The giant grandmother goddess who made mountains and islands by spilling the earth and stones she carried in her skirt.',
  ),
  ra: both(
    '태양의 배를 몰고 하늘을 건너는 매 머리의 태양신. 밤마다 혼돈의 뱀 아펩과 싸워 아침을 되찾습니다.',
    'The falcon-headed sun god who sails the solar barque across the sky and battles the chaos serpent Apep every night to win back the dawn.',
  ),
  marduk: both(
    '바람과 폭풍을 거느린 바빌론의 수호신. 원초의 바다 티아마트를 쓰러뜨리고 그 몸을 갈라 하늘과 땅을 지었습니다.',
    'Storm-wielding patron of Babylon, who felled the primordial sea Tiamat and split her body to build heaven and earth.',
  ),
  zeus: both(
    '벼락을 휘두르는 올림포스의 왕. 머리가 별에 닿던 티폰을 벼락으로 눌러 화산 밑에 가두었습니다.',
    'Thunderbolt-hurling king of Olympus, who pinned the star-tall Typhon beneath a volcano.',
  ),
  kronos: both(
    '자식들을 삼킨 티탄의 왕. 낫을 쥐고 흘러가는 시간을 다스립니다.',
    'The Titan king who swallowed his own children, scythe in hand, ruling the passage of time.',
  ),
  odin: both(
    '지혜를 얻으려고 한쪽 눈을 내준 신들의 아버지. 라그나로크에 늑대 펜리르와 맞섭니다.',
    'The All-father who gave an eye for wisdom and faces the wolf Fenrir at Ragnarök.',
  ),
  thor: both(
    '천둥 망치를 든 신. 세상을 휘감은 뱀 요르문간드와 서로 쓰러뜨릴 숙적입니다.',
    'The thunder god with the hammer, fated to fell — and fall to — the world serpent Jörmungandr.',
  ),
  surtr: both(
    '불타는 나라 무스펠의 거인. 라그나로크의 끝에 불꽃 칼로 온 세상을 태웁니다.',
    'Fire giant of Muspell, who sets the whole world ablaze with his flaming sword at the end of Ragnarök.',
  ),
  gonggong: both(
    '사람 얼굴에 뱀 몸을 한 물의 신. 싸움에 지자 하늘 기둥인 부주산을 들이받아 하늘을 기울게 했습니다.',
    'The human-faced, serpent-bodied water god who, losing a war, rammed Mount Buzhou — the pillar of heaven — and tilted the sky.',
  ),
  seraphim: both(
    '여섯 날개로 얼굴과 발을 가리고 불꽃처럼 타오르는 가장 높은 천사.',
    'The highest angels, burning like flame, who veil face and feet with six wings.',
  ),
  cherubim: both(
    '사람·사자·소·독수리 네 얼굴과 네 날개를 지닌 수호 천사. 불칼을 들고 문을 지킵니다.',
    'Four-faced, four-winged guardians — human, lion, ox and eagle — who keep the gate with a flaming sword.',
  ),
  ophanim: both(
    '바퀴 안에 바퀴가 맞물려 돌고 테두리마다 눈이 가득한 천사. 쉬지 않고 모든 방향을 봅니다.',
    'Wheels turning within wheels, their rims full of eyes, watching every direction without rest.',
  ),
  bael: both(
    '두꺼비·사람·고양이 세 머리를 가졌다는 동방의 마왕. 모습을 감추는 힘을 준다고 전합니다.',
    'An eastern demon king said to bear three heads — toad, man and cat — and to grant the power of invisibility.',
  ),
  asmodeus: both(
    '불을 뿜는 세 머리의 욕망의 마왕. 솔로몬 왕에게 붙잡혀 일을 했다고 전합니다.',
    'The fire-breathing, three-headed demon of desire, said to have been bound to labour for King Solomon.',
  ),
  beelzebub: both(
    '파리 떼의 왕. 셀 수 없는 날개 소리와 함께 썩음과 역병을 몰고 옵니다.',
    'Lord of the flies, arriving with the roar of countless wings and bringing rot and plague.',
  ),
  abaddon: both(
    '끝없는 구렁의 파괴자. 쇠 가슴받이를 두른 메뚜기 떼를 거느리고 땅을 휩씁니다.',
    'The destroyer of the bottomless pit, sweeping the land with a swarm of iron-breasted locusts.',
  ),
  asura: both(
    '하늘의 신들과 끝없이 싸우는 세 얼굴 여섯 팔의 전사. 그 싸움터에서 ‘아수라장’이라는 말이 나왔습니다.',
    'Three-faced, six-armed warriors forever at war with the gods of heaven — their battlefield gave Korean its word for utter chaos.',
  ),
  'azure-dragon': both(
    '동쪽과 봄, 나무 기운의 푸른 용. 비와 천둥을 부르고 잠든 생명을 깨웁니다.',
    'The azure dragon of the east and of spring, summoning rain and thunder and waking sleeping life.',
  ),
  'white-tiger': both(
    '서쪽과 가을, 쇠 기운의 흰 범. 싸움과 심판을 맡아 사악한 기운을 베어 냅니다.',
    'The white tiger of the west and of autumn, lord of war and judgement who cuts down evil.',
  ),
  'vermilion-bird': both(
    '남쪽과 여름, 불 기운의 붉은 새. 날개를 펴면 하늘이 노을처럼 타오릅니다.',
    'The vermilion bird of the south and of summer; when it spreads its wings the sky burns like a sunset.',
  ),
  'black-tortoise': both(
    '북쪽과 겨울, 물 기운의 거북과 뱀. 단단한 등딱지로 북쪽 하늘을 지킵니다.',
    'The black tortoise of the north and of winter, entwined with a serpent, guarding the northern sky with its shell.',
  ),
  'yellow-dragon': both(
    '사방의 한가운데를 다스리는 누런 용. 흙의 기운으로 네 신수의 균형을 잡습니다.',
    'The yellow dragon at the centre of the four directions, balancing the other four with the power of earth.',
  ),
  qilin: both(
    '어진 임금이 날 때 나타난다는 상서로운 짐승. 산 풀조차 밟지 않을 만큼 어집니다.',
    'The auspicious beast that appears when a wise ruler is born, so gentle it will not tread on living grass.',
  ),
  fenghuang: both(
    '태평한 세상에 나타나 오동나무에만 깃드는 새들의 왕.',
    'The king of birds, appearing in times of peace and perching only on paulownia trees.',
  ),
  yinglong: both(
    '날개 달린 비의 용. 큰 싸움에서 물을 모아 황제를 도왔습니다.',
    'The winged rain dragon that gathered the waters to help the Yellow Emperor in his great war.',
  ),
  haetae: both(
    '옳고 그름을 가리는 외뿔 짐승. 불을 먹는다고 여겨 궁궐 앞에 세워 불을 막았습니다.',
    'The one-horned judge of right and wrong, believed to eat fire and set before palaces to ward off blazes.',
  ),
  baize: both(
    '세상 모든 요괴의 이름과 막는 법을 안다는 흰 짐승.',
    'The white beast that knows the name of every monster and how to ward it off.',
  ),
  samjogo: both(
    '해 속에 산다는 세 발 까마귀. 고구려 고분 벽화에 해를 나타내는 그림으로 남았습니다.',
    'The three-legged crow said to live in the Sun, painted as its emblem in Goguryeo tomb murals.',
  ),
  bulgae: both(
    '어둠의 나라 임금이 해와 달을 훔쳐 오라고 보낸 개. 물었다 놓은 자리가 일식과 월식이 되었다고 합니다.',
    'Fire dogs sent by the king of a land of darkness to steal the Sun and Moon; where they bit and let go, eclipses were left behind.',
  ),
  bulgasari: both(
    '쇠를 먹고 자라는 짐승. 바늘 하나에서 시작해 나라의 쇠붙이를 다 먹어 치울 만큼 커졌습니다.',
    'A beast that grows by eating iron — from a single needle until it had eaten every scrap of metal in the land.',
  ),
  imugi: both(
    '천 년을 기다려 용이 되려는 큰 뱀. 여의주를 얻지 못하면 홍수를 일으킵니다.',
    'A great serpent waiting a thousand years to become a dragon, unleashing floods if it fails.',
  ),
  zhulong: both(
    '사람 얼굴에 붉은 뱀 몸을 한 횃불 용. 눈을 뜨면 낮이 되고 감으면 밤이 됩니다.',
    'The torch dragon with a human face and a red serpent body: when it opens its eyes it is day, when it closes them, night.',
  ),
  tiangou: both(
    '해와 달을 삼키려 드는 하늘의 개. 떨어지는 별똥별로 여겨지기도 했습니다.',
    'The heavenly dog that tries to swallow the Sun and Moon, sometimes seen as a falling meteor.',
  ),
  kunpeng: both(
    '몇천 리나 되는 물고기 곤이 새 붕이 되어, 하늘을 덮는 날개로 구만 리를 날아오릅니다.',
    'The vast fish Kun becomes the bird Peng, whose sky-covering wings carry it ninety thousand li high.',
  ),
  hundun: both(
    '얼굴 없이 여섯 다리와 네 날개만 있는 혼돈의 짐승. 일곱 구멍을 뚫어 주자 죽었다는 이야기가 있습니다.',
    'Faceless chaos with six legs and four wings — it died when seven openings were bored into it.',
  ),
  taotie: both(
    '무엇이든 먹어 치우는 탐욕의 짐승. 옛 청동기에는 얼굴만 새겨졌습니다.',
    'The beast of greed that devours everything; ancient bronzes bear only its face.',
  ),
  orochi: both(
    '여덟 머리와 여덟 꼬리를 가진 큰 뱀. 골짜기 여덟 개를 덮을 만큼 깁니다.',
    'The eight-headed, eight-tailed serpent long enough to span eight valleys.',
  ),
  vritra: both(
    '세상의 물을 가둬 가뭄을 부르는 큰 뱀.',
    'The great serpent that hoards the world’s waters and brings drought.',
  ),
  tiamat: both(
    '바닷물로 된 원초의 혼돈. 괴물 열한 무리를 낳아 젊은 신들과 싸웠습니다.',
    'The primordial chaos of salt water, who bore eleven kinds of monsters to fight the younger gods.',
  ),
  leviathan: both(
    '바다를 끓게 하는 거대한 바다 괴물. 몸이 비늘 방패로 덮여 있습니다.',
    'The vast sea monster whose thrashing makes the deep boil, armoured in shields of scales.',
  ),
  behemoth: both(
    '천 개의 산에서 풀을 뜯는 땅의 거수.',
    'The land colossus that grazes a thousand hills.',
  ),
  ziz: both(
    '날개를 펴면 해를 가린다는 하늘의 큰 새.',
    'The great bird of the sky whose spread wings blot out the Sun.',
  ),
  simurgh: both(
    '생명나무에 깃들어 사는 지혜로운 큰 새. 다친 영웅을 깃털로 고쳐 줍니다.',
    'The wise great bird nesting in the tree of life, healing wounded heroes with its feathers.',
  ),
  anzu: both(
    '사자 머리의 폭풍 새. 신들의 운명의 서판을 훔쳐 달아났습니다.',
    'The lion-headed storm bird that stole the gods’ Tablet of Destinies.',
  ),
  apep: both(
    '밤마다 태양의 배를 삼키려 드는 혼돈의 뱀. 지구 가까이 오는 소행성 아포피스의 이름이 여기서 나왔습니다.',
    'The chaos serpent that tries to swallow the Sun’s barque every night — namesake of the near-Earth asteroid Apophis.',
  ),
  bennu: both(
    '세상의 첫 해가 뜬 언덕에 내려앉은 왜가리. 소행성 베누의 이름이 되었습니다.',
    'The heron that alighted on the first hill at the first sunrise — namesake of the asteroid Bennu.',
  ),
  phoenix: both(
    '수백 년마다 스스로 불타 재에서 다시 태어나는 새.',
    'The bird that burns itself every few centuries and is reborn from its own ashes.',
  ),
  typhon: both(
    '머리가 별에 닿고 다리가 뱀인 괴물들의 아버지. 제우스와 싸워 화산 밑에 갇혔습니다.',
    'Father of monsters, head brushing the stars and legs of coiling serpents — imprisoned under a volcano by Zeus.',
  ),
  hydra: both(
    '머리 하나를 베면 둘이 돋는 독 뱀. 바다뱀자리가 되었습니다.',
    'The venomous serpent that grows two heads for every one cut off — now the constellation Hydra.',
  ),
  pegasus: both(
    '날개 달린 하늘의 말. 발굽이 닿은 바위에서 샘이 솟았고, 페가수스자리가 되었습니다.',
    'The winged horse whose hoof struck a spring from the rock — now the constellation Pegasus.',
  ),
  ouroboros: both(
    '제 꼬리를 물고 끝없이 도는 뱀. 끝과 시작이 하나인 순환을 뜻합니다.',
    'The serpent eating its own tail: the endless cycle in which ending and beginning are one.',
  ),
  jormungandr: both(
    '세상을 한 바퀴 휘감고 제 꼬리를 문 바다뱀. 꼬리를 놓으면 라그나로크가 시작됩니다.',
    'The sea serpent that encircles the world biting its own tail; when it lets go, Ragnarök begins.',
  ),
  fenrir: both(
    '신들도 겨우 묶어 둔 거대한 늑대. 사슬을 끊으면 신들의 아버지를 삼킵니다.',
    'The giant wolf the gods could barely bind; when it breaks free it swallows the All-father.',
  ),
  skoll: both(
    '해를 쫓아 하늘을 달리는 늑대. 마침내 따라잡으면 해를 삼킵니다.',
    'The wolf that chases the Sun across the sky and swallows it when it finally catches up.',
  ),
  hati: both(
    '달을 쫓는 늑대. 스콜과 함께 라그나로크에 하늘의 빛을 먹어 치웁니다.',
    'The wolf that chases the Moon, devouring the lights of the sky with Sköll at Ragnarök.',
  ),
  nidhogg: both(
    '세계수의 뿌리를 갉아 먹는 용.',
    'The dragon gnawing at the roots of the world tree.',
  ),
  hraesvelgr: both(
    '독수리 모습을 한 거인. 날갯짓으로 세상의 바람을 일으킵니다.',
    'A giant in eagle form whose wingbeats raise all the winds of the world.',
  ),
  kraken: both(
    '섬으로 착각할 만큼 거대한 바다 괴물. 배를 통째로 끌어내립니다.',
    'A sea monster so vast it is mistaken for an island, dragging whole ships beneath the waves.',
  ),
  chimera: both(
    '사자·염소·뱀이 하나가 된 불 뿜는 괴물.',
    'The fire-breathing monster that is lion, goat and serpent at once.',
  ),
  starwhale: both(
    '별과 별 사이를 천천히 헤엄치는 거대한 고래. 한 번 숨을 쉬면 혜성 꼬리 같은 물보라가 생깁니다.',
    'A colossal whale drifting slowly between the stars; each breath throws out a spray like a comet’s tail.',
  ),
  'nebula-jelly': both(
    '수천 광년 너비의 해파리. 늘어진 촉수가 스치는 별마다 빛을 잃습니다.',
    'A jellyfish thousands of light-years across; every star its trailing tentacles brush loses its light.',
  ),
  'star-gnawer': both(
    '행성의 속을 파먹으며 자라는 거대한 벌레.',
    'A colossal worm that grows by hollowing out the hearts of planets.',
  ),
  'silent-colossus': both(
    '위성 깊숙이 묻혀 잠들어 있던 옛 문명의 거대 기계. 깨어나 공간을 건너뛰어 와서는, 생명은 두고 행성 하나의 회로와 기계를 한꺼번에 멈춰 옛 질서를 집행합니다.',
    'A colossal machine of a vanished civilisation, buried deep in a moon until woken. It jumps across space and enforces its ancient order by silencing every circuit on a world at once — sparing life, stopping machines.',
  ),
  'von-neumann-swarm': both(
    '소행성과 위성을 원료 삼아 제 몸을 끝없이 복제하는 기계 떼. 멈추라는 명령을 잊어버렸습니다.',
    'A machine swarm that copies itself endlessly from mined asteroids and moons — and has forgotten how to stop.',
  ),
  'star-harvester': both(
    '별에서 플라스마를 뽑아 연료로 거둬 가는 거대한 고리 기계. 거둔 만큼 별빛이 줄어듭니다.',
    'A colossal ring-machine that siphons plasma from stars as fuel; the starlight dims by whatever it takes.',
  ),
  'planet-breaker': both(
    '행성을 쪼개 자원으로 바꾸려고 만든 거대한 기동 병기. 주인이 사라진 뒤에도 명령을 따릅니다.',
    'A gigantic war machine built to crack planets open for their resources, still obeying long after its makers vanished.',
  ),
}
