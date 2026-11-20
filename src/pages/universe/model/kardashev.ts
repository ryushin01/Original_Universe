/**
 * 카르다쇼프 척도: 문명이 다루는 에너지로 문명의 단계를 매기는 척도.
 * 니콜라이 카르다쇼프(1964)가 Ⅰ~Ⅲ단계를 내놓았고, 칼 세이건이 Ⅰ단계를 10¹⁶ W로 고쳐 단계 사이를
 * 잇는 연속식 K = (log₁₀P − 6) / 10을 만들었으며, 미치오 카쿠가 Ⅳ~Ⅵ단계를 더했습니다.
 * 값과 기준점은 공개된 사실(나무위키 「카르다쇼프 척도」 등)만 참고하고 문장은 직접 썼습니다.
 * (이 파일의 긴 설명은 펼쳐야 보이므로 글꼴은 첫 화면 글자 파일이 아니라 조각으로 받음)
 */
import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'

/** 세이건의 연속식: 에너지 P(W) → 척도 K (0.1마다 10배, 한 단계는 100억 배) */
export const kardashevOf = (powerW: number) =>
  powerW > 0 ? (Math.log10(powerW) - 6) / 10 : null

/** 척도 K에 해당하는 에너지 (W) */
export const powerAt = (k: number) => 10 ** (10 * k + 6)

export interface KardashevType {
  /** 단계 (0~6) */
  level: number
  /** 로마 숫자 표기 */
  numeral: string
  label: Text
  /** 세이건 기준 에너지 (W, Ⅴ·Ⅵ단계는 정해지지 않음) */
  watts: number | null
  /** 카르다쇼프가 1964년에 잡은 기준 (W) */
  original?: number
  /** 다루는 범위 */
  scope: Text
  /** 예 (이 시뮬레이터에서 해 볼 수 있는 것 포함) */
  examples: Text
}

export const KARDASHEV_TYPES: KardashevType[] = [
  {
    level: 0,
    numeral: '0',
    label: both('기준점', 'Baseline'),
    watts: 1e6,
    scope: both(
      '1 MW에서 척도가 0이 됩니다. 이보다 적게 쓰면 음수로, 모닥불 하나(약 10 kW)는 −0.2입니다.',
      'The scale reads zero at 1 MW and turns negative below it; a single campfire (about 10 kW) scores −0.2.',
    ),
    examples: both(
      '불과 가축, 물레방아의 시대. 원자로 한 기(1 GW)가 0.3, 고대 로마 무렵 인류 전체(약 100 GW)가 0.5입니다.',
      'The age of fire, draught animals and water wheels. One reactor (1 GW) is 0.3; all of humanity around Roman times (about 100 GW) is 0.5.',
    ),
  },
  {
    level: 1,
    numeral: 'Ⅰ',
    label: both('행성 문명', 'Planetary civilisation'),
    watts: 1e16,
    original: 4e12,
    scope: both(
      '행성 하나의 에너지를 다룹니다. 지구가 받는 햇빛(약 1.7×10¹⁷ W)에 견줄 만한 규모입니다.',
      'Commands the energy of a whole planet, on the order of the sunlight Earth receives (about 1.7×10¹⁷ W).',
    ),
    examples: both(
      '날씨 조절, 테라포밍, 핵융합 발전, 상대론적 요격체. 이 시뮬레이터에서는 화성 테라포밍과 우주 대전의 궤도 질량 투사기가 이 단계의 기술입니다.',
      'Weather control, terraforming, fusion power and relativistic kill vehicles. Here: terraforming Mars and the orbital mass driver of the space war.',
    ),
  },
  {
    level: 2,
    numeral: 'Ⅱ',
    label: both('항성 문명', 'Stellar civilisation'),
    watts: 1e26,
    original: 4e26,
    scope: both(
      '별 하나의 빛을 다 씁니다. 태양(3.8×10²⁶ W)의 빛을 모두 모으면 약 2.06입니다.',
      'Uses all the light of a star; capturing the whole Sun (3.8×10²⁶ W) gives about 2.06.',
    ),
    examples: both(
      '다이슨 구·다이슨 스웜, 별에서 물질을 뽑아내는 스타 리프팅, 항성 엔진, 니콜-다이슨 광선. 이 시뮬레이터에서는 건설 탭의 다이슨 스웜(약 1.9)·다이슨 구·항성 엔진과 우주 대전의 니콜-다이슨 광선입니다.',
      'Dyson spheres and swarms, star lifting, stellar engines and Nicoll–Dyson beams. Here: the Dyson swarm (about 1.9), Dyson sphere and stellar engine in Build, and the Nicoll–Dyson beam of the space war.',
    ),
  },
  {
    level: 3,
    numeral: 'Ⅲ',
    label: both('은하 문명', 'Galactic civilisation'),
    watts: 1e36,
    original: 4e37,
    scope: both(
      '은하 하나의 에너지를 다룹니다. 우리 은하의 광도는 약 5×10³⁶ W(약 3.07)입니다.',
      'Commands the energy of a galaxy; the Milky Way shines at about 5×10³⁶ W (about 3.07).',
    ),
    examples: both(
      '블랙홀·퀘이사·감마선 폭발의 에너지를 다루고 별을 옮기거나 짓습니다. 빛보다 빠른 여행이 없으면 은하 곳곳의 Ⅰ·Ⅱ단계 문명들로 갈라질 수도 있습니다.',
      'Harnesses black holes, quasars and gamma-ray bursts, and moves or builds stars. Without faster-than-light travel it may split into many Type I–II civilisations across the galaxy.',
    ),
  },
  {
    level: 4,
    numeral: 'Ⅳ',
    label: both('우주 문명', 'Universal civilisation'),
    watts: 1e46,
    scope: both(
      '미치오 카쿠가 더한 단계. 관측 가능한 우주의 별·은하·블랙홀을 다 합쳐도 10⁴⁵ W 안팎이라 암흑 에너지까지 다뤄야 합니다.',
      'Added by Michio Kaku. All the stars, galaxies and black holes of the observable universe add up to about 10⁴⁵ W, so it would have to tap dark energy.',
    ),
    examples: both(
      '우주 전체를 다루는 문명. 이 시뮬레이터의 우주 거대 구조 규모가 그 무대입니다.',
      'A civilisation spanning the cosmos; the cosmic-web scale of this simulator is its stage.',
    ),
  },
  {
    level: 5,
    numeral: 'Ⅴ',
    label: both('다중우주 문명', 'Multiverse civilisation'),
    watts: null,
    scope: both(
      '여러 우주의 에너지를 다룹니다. 값을 매길 수 없는 상상의 단계입니다.',
      'Commands the energy of many universes; an imaginary level with no value attached.',
    ),
    examples: both(
      '평행우주를 넘나드는 스페이스 오페라의 소재. 우주 대전의 차원 균열군이 이런 문명을 그립니다.',
      'A space-opera trope of crossing parallel universes, like the Rift Host of the space war.',
    ),
  },
  {
    level: 6,
    numeral: 'Ⅵ',
    label: both('모든 다중우주', 'All multiverses'),
    watts: null,
    scope: both(
      '모든 다중우주를 다루는 끝의 단계로, 확인할 방법이 없습니다.',
      'The final level, commanding every multiverse; there is no way to test it.',
    ),
    examples: both(
      '논의에서는 대개 다루지 않습니다.',
      'Mostly left out of serious discussion.',
    ),
  },
]

export interface KardashevLandmark {
  k: number
  label: Text
}

/** 기준점 (낮은 것부터) */
export const KARDASHEV_LANDMARKS: KardashevLandmark[] = [
  {
    k: -0.2,
    label: both('모닥불 하나 (약 10 kW)', 'A campfire (about 10 kW)'),
  },
  { k: 0.3, label: both('원자로 한 기 (1 GW)', 'One reactor (1 GW)') },
  {
    k: 0.5,
    label: both(
      '고대 로마~중세 초 인류 전체 (약 100 GW)',
      'All humanity, Roman to early medieval times (about 100 GW)',
    ),
  },
  {
    k: 0.58,
    label: both(
      '산업 혁명기 인류 (약 600~800 GW)',
      'Humanity in the Industrial Revolution (about 600–800 GW)',
    ),
  },
  {
    k: 0.7,
    label: both('칼 세이건의 1973년 추정', 'Carl Sagan’s 1973 estimate'),
  },
  {
    k: 0.73,
    label: both(
      '2025년 인류 (1차 에너지 약 655 EJ, 약 20.8 TW)',
      'Humanity in 2025 (about 655 EJ of primary energy, about 20.8 TW)',
    ),
  },
]

/** 역사·예측·한계·다른 척도 */
export const KARDASHEV_NOTES: Text[] = [
  both(
    '원래 척도(1964)는 Ⅰ단계를 그때 지구가 쓰던 에너지(4×10¹² W)로 잡았고 Ⅱ단계는 4×10²⁶ W, Ⅲ단계는 4×10³⁷ W였습니다. 세이건의 연속식에서는 0.01마다 에너지가 약 26% 늘고, 0.03이면 약 2배, 0.1이면 10배입니다.',
    'The original 1964 scale pegged Type I to Earth’s energy use at the time (4×10¹² W), with Type II at 4×10²⁶ W and Type III at 4×10³⁷ W. In Sagan’s formula every 0.01 adds about 26% more energy, 0.03 roughly doubles it and 0.1 multiplies it by ten.',
  ),
  both(
    '예측: 지금처럼 해마다 2% 안팎으로 늘면 Ⅰ단계까지 수백 년이 걸리고, 21세기 말~22세기 초에 닿으려면 해마다 6~10%씩 늘어야 합니다. 미치오 카쿠는 Ⅱ단계에 수천 년, Ⅲ단계에 10만~100만 년이 걸린다고 봤습니다.',
    'Forecasts: at today’s growth of about 2% a year, Type I is centuries away; reaching it by the late 21st or early 22nd century would take 6–10% growth every year. Michio Kaku put Type II thousands of years off and Type III 100,000 to a million years.',
  ),
  both(
    '한계: 에너지만 재므로 효율(같은 일에 드는 에너지는 크게 줄어 왔음)과 폐열·온실가스를 보지 못하고, 작지만 고도로 발달한 문명을 낮게 매길 수 있습니다.',
    'Limits: it measures energy alone, so it misses efficiency (the energy needed for the same work keeps falling) as well as waste heat and greenhouse gases, and it can underrate a small but highly advanced civilisation.',
  ),
  both(
    '다른 척도: 네오-카르다쇼프 척도는 생태계를 되살리는 힘으로 매기고(지금 인류는 생태계를 깎아 먹는 0-Bio), 배로 척도는 얼마나 작은 크기까지 물질을 다루는지로 매깁니다. 고도 문명이 보이지 않는 까닭을 묻는 페르미 역설·대여과기 가설과도 이어집니다.',
    'Other scales: the Neo-Kardashev scale rates the power to rebuild ecosystems (today’s humanity, which drains them, is Type 0-Bio), and the Barrow scale rates how small a civilisation can engineer matter. Both tie into the Fermi paradox and the Great Filter, which ask why no advanced civilisation is seen.',
  ),
]

/** 다음 정수 단계와 그때까지 필요한 에너지 배수 (Ⅳ단계를 넘으면 null) */
export function nextType(k: number): { level: number; factor: number } | null {
  const level = Math.floor(k) + 1
  if (level > 4) return null
  return { level, factor: 10 ** ((level - k) * 10) }
}

/** 해마다 rate(연속 복리)씩 늘 때 target(W)에 닿기까지의 햇수 */
export const yearsToReach = (powerW: number, targetW: number, rate: number) =>
  powerW >= targetW ? 0 : Math.log(targetW / powerW) / rate
