import { initialWorld } from './engine'
import { build, setSunBlackHole, startMeteorStorm } from './actions'
import {
  decodeSnapshot,
  encodeSnapshot,
  fromSnapshot,
  toSnapshot,
  validateSnapshot,
} from './snapshot'

describe('공유 스냅숏', () => {
  it('주소로 옮겨도 구조물·궤도·지구 상태가 같다', () => {
    let state = build(
      { ...initialWorld(2030), budget: 1e9 },
      'dyson-swarm',
      true,
    ).state
    state = setSunBlackHole(state, true).state
    state = {
      ...state,
      overrides: {
        neptune: {
          elements: {
            a: 31,
            e: 0.08,
            i: 2,
            node: 130,
            argPeri: 270,
            meanAnomaly: 10,
          },
          epochJd: 2470000.5,
          sunMass: 1,
        },
      },
    }
    const code = encodeSnapshot(toSnapshot(state))
    const back = fromSnapshot(decodeSnapshot(code)!)
    expect(back.year).toBeCloseTo(2030, 6)
    expect(back.structures.map((s) => s.kind)).toEqual(['dyson-swarm'])
    expect(back.sunBlackHole).toBe(true)
    expect(back.overrides.neptune?.elements.a).toBe(31)
  })

  it('충돌 겨울 냉각·누적 피해·기지 생존율도 되살린다', () => {
    const base = initialWorld(2040)
    const state = {
      ...base,
      losses: 1234,
      colonyHealth: { 'moon-base': 0.4 },
      earth: { ...base.earth, coolingC: -8.5 },
    }
    const back = fromSnapshot(
      decodeSnapshot(encodeSnapshot(toSnapshot(state)))!,
    )
    expect(back.earth.coolingC).toBe(-8.5)
    expect(back.losses).toBe(1234)
    expect(back.colonyHealth['moon-base']).toBe(0.4)
  })

  it('예약한 유성 폭풍도 저장한다', () => {
    const state = startMeteorStorm(initialWorld(2030.2), 'perseids').state
    const back = fromSnapshot(
      decodeSnapshot(encodeSnapshot(toSnapshot(state)))!,
    )
    expect(back.meteorStorm).toEqual(state.meteorStorm)
    expect(
      validateSnapshot({ ...toSnapshot(state), meteor: ['x', 1, 2] }),
    ).toBeNull()
  })

  it('예전 형식(지구 값 6개, 피해 없음)도 읽는다', () => {
    const old = { ...toSnapshot(initialWorld(2030)) }
    old.earth = old.earth.slice(0, 6) as typeof old.earth
    delete old.losses
    delete old.colonies
    const back = fromSnapshot(validateSnapshot(old)!)
    expect(back.earth.coolingC).toBe(0)
    expect(back.losses).toBe(0)
  })

  it('범위를 벗어나거나 모르는 값은 버린다', () => {
    const good = toSnapshot(initialWorld(2030))
    expect(validateSnapshot({ ...good, year: 1e20 })).toBeNull()
    expect(
      validateSnapshot({ ...good, structures: [['warp-gate', 2030, 2031]] }),
    ).toBeNull()
    expect(
      validateSnapshot({ ...good, removed: { earth: [2030, 'vanished'] } }),
    ).toBeNull()
    expect(decodeSnapshot('not-base64!!')).toBeNull()
    // 상속된 속성 이름은 구조물 종류가 아님
    expect(
      validateSnapshot({ ...good, structures: [['constructor', 2030, 2031]] }),
    ).toBeNull()
  })
})

describe('공유 링크 검사: 고쳐 쓴 주소는 하나라도 맞지 않으면 버린다', () => {
  const good = toSnapshot(initialWorld(2030))
  const withStructure = {
    ...good,
    structures: [['sentinel', 2030, 2031]],
  }

  it('정상 스냅숏과 문명 단계·바뀐 궤도·사라진 천체가 든 스냅숏은 통과한다', () => {
    expect(validateSnapshot(good)).not.toBeNull()
    const full = {
      ...withStructure,
      civ: ['type1', 'sentinel'],
      overrides: { mars: [1.6, 0.1, 2, 49, 286, 10, 2461000, 1] },
      removed: { pluto: [2031, 'ejected'] },
      colonies: { sentinel: 0.5 },
      dim: 0.3,
    }
    const back = fromSnapshot(validateSnapshot(full)!)
    expect(back.civ).toEqual({ level: 'type1', granted: ['sentinel'] })
    expect(back.overrides.mars?.elements.a).toBe(1.6)
    expect(back.overrides.mars?.sunMass).toBe(1)
    expect(back.removed.pluto).toEqual({ year: 2031, reason: 'ejected' })
    expect(back.solarDim).toBe(0.3)
    expect(back.structures[0]).toMatchObject({ kind: 'sentinel', done: false })
    expect(back.nextId).toBe(2)
  })

  it.each([
    ['객체가 아님', null],
    ['문자열', 'snapshot'],
    ['모르는 형식 번호', { ...good, v: 2 }],
    ['속도 단계가 정수가 아님', { ...good, speed: 1.5 }],
    ['속도 단계가 범위 밖', { ...good, speed: 99 }],
    ['예산이 숫자가 아님', { ...good, budget: 'many' }],
    ['누적 피해가 음수', { ...good, losses: -1 }],
    ['햇빛 잠식이 범위 밖', { ...good, dim: 1 }],
    ['유성 폭풍 칸 수가 틀림', { ...good, meteor: ['perseids', 2030] }],
    [
      '유성 폭풍 끝이 시작보다 앞',
      { ...good, meteor: ['perseids', 2031, 2030] },
    ],
    ['기지 생존율 칸이 객체가 아님', { ...good, colonies: 3 }],
    ['기지 종류를 모름', { ...good, colonies: { 'warp-gate': 0.5 } }],
    ['기지 생존율이 1을 넘음', { ...good, colonies: { sentinel: 2 } }],
    ['구조물이 배열이 아님', { ...good, structures: {} }],
    [
      '구조물이 40개를 넘음',
      {
        ...good,
        structures: Array.from({ length: 41 }, () => ['sentinel', 2030, 2031]),
      },
    ],
    ['구조물 칸 수가 틀림', { ...good, structures: [['sentinel', 2030]] }],
    [
      '같은 구조물이 두 번',
      {
        ...good,
        structures: [
          ['sentinel', 2030, 2031],
          ['sentinel', 2030, 2031],
        ],
      },
    ],
    ['완공이 착공보다 앞', { ...good, structures: [['sentinel', 2031, 2030]] }],
    ['문명 단계 칸이 비었음', { ...withStructure, civ: [] }],
    ['모르는 문명 단계', { ...withStructure, civ: ['type9'] }],
    ['문명 단계가 지금', { ...withStructure, civ: ['today'] }],
    [
      '문명이 짓지 않은 구조물을 줌',
      { ...withStructure, civ: ['type1', 'grid-shield'] },
    ],
    ['바뀐 궤도 칸이 없음', { ...good, overrides: undefined }],
    [
      '모르는 천체의 궤도',
      { ...good, overrides: { vulcan: [1, 0, 0, 0, 0, 0, 0, 1] } },
    ],
    ['궤도 요소 칸 수가 틀림', { ...good, overrides: { mars: [1, 0, 0] } }],
    [
      '이심률이 1 이상',
      { ...good, overrides: { mars: [1, 1.2, 0, 0, 0, 0, 0, 1] } },
    ],
    [
      '궤도 요소에 숫자가 아닌 값',
      { ...good, overrides: { mars: [1, 0, 0, 0, 'x', 0, 0, 1] } },
    ],
    ['사라진 천체 칸이 없음', { ...good, removed: null }],
    [
      '모르는 천체가 사라짐',
      { ...good, removed: { vulcan: [2030, 'ejected'] } },
    ],
    ['사라진 해가 범위 밖', { ...good, removed: { pluto: [1000, 'ejected'] } }],
    ['블랙홀 값이 참거짓이 아님', { ...good, bh: 'yes' }],
    ['지구 값 칸 수가 틀림', { ...good, earth: [15, 1, 1] }],
    ['지구 바다 비율이 1을 넘음', { ...good, earth: [15, 2, 1, 100, 1, 0, 0] }],
    ['충돌 겨울 냉각이 양수', { ...good, earth: [15, 1, 1, 100, 1, 0, 5] }],
    ['이정표가 배열이 아님', { ...good, milestones: 'first' }],
    ['이정표 이름이 너무 김', { ...good, milestones: ['x'.repeat(40)] }],
  ])('%s', (_, raw) => {
    expect(validateSnapshot(raw)).toBeNull()
  })

  it('너무 긴 주소와 JSON이 아닌 내용은 버린다', () => {
    expect(decodeSnapshot('a'.repeat(20_001))).toBeNull()
    expect(decodeSnapshot(btoa('not json'))).toBeNull()
  })
})
