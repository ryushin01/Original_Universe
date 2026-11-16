import { render, screen, within } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { setLocale } from '@/shared/i18n'
import { initialWorld } from '../../model/world/engine'
import { __setWorldForTest, world } from '../../model/world/store'
import { selected, viewActions } from '../../model/view'
import { MythicPanel } from './MythicPanel'

describe('MythicPanel', () => {
  beforeEach(() => {
    setLocale('ko')
    __setWorldForTest(initialWorld(2026.87))
    viewActions.setScale('solar')
  })

  it('두 존재의 상성·승산·재해를 미리 보여 주고 격돌을 시작한다', async () => {
    render(() => <MythicPanel />)
    // 기본: 노덴스 대 니알라토텝 (빛이 혼돈을 봉인, 전승의 맞수)
    expect(
      screen.getByText('빛이 혼돈을 봉인: 노덴스 유리'),
    ).toBeInTheDocument()
    expect(screen.getByText('전승 속 맞수')).toBeInTheDocument()
    expect(screen.getByText(/노덴스 \d+%/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '격돌시키기' }))
    expect(world().battles).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      '노덴스와 니알라토텝이 격돌을 시작했습니다.',
    )
    const active = screen.getByRole('region', { name: '진행 중인 격돌·강림' })
    expect(within(active).getByText('노덴스 대 니알라토텝')).toBeInTheDocument()
    await userEvent.click(
      within(active).getByRole('button', { name: '니알라토텝 따라가기' }),
    )
    expect(selected()).toBe('being:nyarlathotep')
  })

  it('상대 없이 불러내면 강림하고, 맞서기로 그 자리에서 격돌로 바꾼다', async () => {
    render(() => <MythicPanel />)
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '불러낼 존재' }),
      'apep',
    )
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '맞설 존재' }),
      '',
    )
    await userEvent.click(screen.getByRole('radio', { name: '태양 곁' }))
    expect(screen.getByText('전조')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '강림시키기' }))
    expect(world().battles[0].b).toBeNull()

    // 강림한 아펩을 고른 채 맞설 존재가 없으면 고르라고 알림
    await userEvent.click(screen.getByRole('button', { name: '맞서게 하기' }))
    expect(screen.getAllByRole('status')[0]).toHaveTextContent(
      '아펩에게 맞설 존재를 고르세요.',
    )
    await userEvent.click(
      screen.getByRole('button', { name: '아펩에게 맞서기' }),
    )
    // 맞설 존재 고르기로 초점이 옮겨지고 싸움터는 강림한 곳으로 고정
    expect(screen.getByRole('combobox', { name: '맞설 존재' })).toHaveFocus()
    expect(
      screen.getByText('강림한 곳에서 맞섭니다: 태양 곁'),
    ).toBeInTheDocument()
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '맞설 존재' }),
      'ra',
    )
    await userEvent.click(screen.getByRole('button', { name: '맞서게 하기' }))
    expect(world().battles).toHaveLength(1)
    expect(world().battles[0].b).toBe('ra')
    expect(world().battles[0].site).toBe('sun')
  })

  it('거절된 불러내기는 오류 모양으로 알리고 영어로도 다시 나온다', async () => {
    render(() => <MythicPanel />)
    await userEvent.click(screen.getByRole('button', { name: '격돌시키기' }))
    await userEvent.click(screen.getByRole('button', { name: '격돌시키기' }))
    const status = screen.getAllByRole('status')[0]
    expect(status).toHaveTextContent('노덴스는 이미 싸움터에 나와 있습니다.')
    setLocale('en')
    expect(status).toHaveTextContent('Nodens is already on a battlefield.')
    setLocale('ko')
  })
})
