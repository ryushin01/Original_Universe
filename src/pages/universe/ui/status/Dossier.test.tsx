import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { FLYBY_PRESETS } from '../../model/hazards/flyby'
import { initialWorld } from '../../model/world/engine'
import { yearAtSunAge } from '../../model/solar/sun'
import { __setWorldForTest, worldActions } from '../../model/world/store'
import { viewActions } from '../../model/view'
import { Dossier } from './Dossier'

describe('Dossier', () => {
  beforeEach(() => {
    __setWorldForTest(initialWorld(2026.87))
    viewActions.setScale('solar')
    viewActions.select('earth', false)
  })

  it('고른 천체의 물리량과 탐사 단계를 보여 준다', () => {
    render(() => <Dossier />)
    expect(screen.getByText('지구', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('6,371 km')).toBeInTheDocument()
    expect(screen.getByText(/탐사 단계: 사람이 감/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '달' })).toBeInTheDocument()
  })

  it('목적지 바로 가기로 다른 천체를 고른다', async () => {
    render(() => <Dossier />)
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '목적지 바로 가기' }),
      'jupiter',
    )
    expect(screen.getByText('목성', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText(/갈릴레오·주노/)).toBeInTheDocument()
  })

  it('태양계를 지나가는 블랙홀도 고르고 정보를 본다', async () => {
    const preset = FLYBY_PRESETS.find((f) => f.id === 'black-hole')!
    worldActions.launchFlyby({ ...preset, presetId: preset.id })
    render(() => <Dossier />)
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '목적지 바로 가기' }),
      'intruder',
    )
    expect(
      screen.getByText('항성 블랙홀 (30 AU)', { selector: 'p' }),
    ).toBeInTheDocument()
    expect(screen.getByText('10 M☉')).toBeInTheDocument()
    expect(screen.getByText('다가오는 중')).toBeInTheDocument()
  })

  it('적색 거성이 된 태양은 커진 반지름과 줄어든 질량을 보여 준다', () => {
    __setWorldForTest(initialWorld(yearAtSunAge(12.167)))
    viewActions.select('sun', false)
    render(() => <Dossier />)
    // 오늘의 69.6만 km보다 수백 배 큼 (약 1.8억 km)
    expect(screen.getByText(/1\.78억 km/)).toBeInTheDocument()
    expect(screen.queryByText('69.6만 km')).not.toBeInTheDocument()
  })

  it('별 규모에서는 분광형과 폭발 버튼을 보여 준다', () => {
    viewActions.setScale('stars')
    viewActions.select('betelgeuse', false)
    render(() => <Dossier />)
    expect(screen.getByText('M1-2Ia')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '이 별을 폭발시키기' }),
    ).toBeInTheDocument()
  })

  it('시리우스를 고르면 별자리·동양 이름·동반성·전승을 함께 읽는다', async () => {
    viewActions.setScale('stars')
    render(() => <Dossier />)
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '목적지 바로 가기' }),
      'sirius',
    )
    expect(screen.getByText('A1V + DA2')).toBeInTheDocument()
    expect(await screen.findByText('큰개자리')).toBeInTheDocument()
    expect(screen.getByText(/천랑성 · 큰개자리 α/)).toBeInTheDocument()
    expect(
      screen.getByText(/시리우스 B: 지구만 한 백색 왜성/),
    ).toBeInTheDocument()
    expect(screen.getByText(/오리온의 사냥개/)).toBeInTheDocument()
  })

  it('반복 신성은 폭발 유형·폭발한 해·가장 밝을 때와 밝기 변화를 보여 준다', async () => {
    viewActions.setScale('galaxy')
    render(() => <Dossier />)
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '목적지 바로 가기' }),
      't-crb',
    )
    expect(screen.getByText('반복 신성')).toBeInTheDocument()
    expect(screen.getByText('1866년, 1946년')).toBeInTheDocument()
    expect(await screen.findByText(/몇 시간 만에 2~3등급/)).toBeInTheDocument()
  })

  it('조선 기록이 남은 케플러 초신성은 기록을 함께 보여 준다', async () => {
    viewActions.setScale('galaxy')
    viewActions.select('kepler', false)
    render(() => <Dossier />)
    expect(screen.getByText('Ia형 초신성 (백색 왜성 폭발)')).toBeInTheDocument()
    expect(await screen.findByText(/조선 관상감/)).toBeInTheDocument()
  })

  it('M87은 국부 은하군 밖 이웃 은하로 표시하고 중심 블랙홀 M87*을 알린다', async () => {
    viewActions.setScale('local')
    viewActions.select('m87', false)
    render(() => <Dossier />)
    expect(
      screen.getByText(/국부 은하군 밖의 이웃 은하/, { selector: 'p' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/M87\*: 태양의 약 65억 배/),
    ).toBeInTheDocument()
  })

  it('싸움터의 우주적 존재를 고르고 진영·권능·상대를 본다', async () => {
    worldActions.summon({ being: 'ra', rival: 'apep', site: 'sun' })
    render(() => <Dossier />)
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '목적지 바로 가기' }),
      'being:apep',
    )
    expect(screen.getByText('아펩', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText(/신수 · 이집트 신화/)).toBeInTheDocument()
    expect(screen.getByText('격돌 중')).toBeInTheDocument()
    // 이름은 두 언어로: 카드 제목 아래 영문, 목적지 목록은 '라 · Ra'
    expect(screen.getByText('Apep', { selector: 'p' })).toHaveAttribute(
      'lang',
      'en',
    )
    expect(screen.getByText('라')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '라 · Ra' })).toBeInTheDocument()
    // 전승 설명은 따로 받아 조금 뒤에 나옴
    expect(await screen.findByText(/소행성 아포피스/)).toBeInTheDocument()
  })
})
