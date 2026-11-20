import { render, screen, within } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { setLocale } from '@/shared/i18n'
import { initialWorld } from '../../model/world/engine'
import { __setWorldForTest, world } from '../../model/world/store'
import { selected, viewActions } from '../../model/view'
import { WarPanel } from './WarPanel'

describe('WarPanel', () => {
  beforeEach(() => {
    setLocale('ko')
    __setWorldForTest({ ...initialWorld(2026.87), budget: 1e4 })
    viewActions.setScale('solar')
  })

  it('기본 대진(악시스 대 더 얼라이언스)의 전력·주포·특수 작전·소재를 보여 주고 개전한다', async () => {
    render(() => <WarPanel />)
    expect(
      screen.getByText(/악시스 \d+ 대 더 얼라이언스 \d+/),
    ).toBeInTheDocument()
    expect(
      screen.getByText('적색 레이저 포 대 청색 레이저 포'),
    ).toBeInTheDocument()
    expect(screen.getByText(/워프 기습 · 붉은 일제 사격/)).toBeInTheDocument()
    expect(
      screen.getByText(/푸른 방어막 진형 · 함재기 출격/),
    ).toBeInTheDocument()
    const motifs = screen.getByRole('region', {
      name: /스페이스 오페라 소재 \d+가지/,
    })
    expect(within(motifs).getByText('우주항공모함')).toBeInTheDocument()
    expect(within(motifs).getByText('워프')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '개전' }))
    expect(world().wars).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      '개전했습니다: 악시스 대 더 얼라이언스',
    )
    const active = screen.getByRole('region', { name: '진행 중인 우주 대전' })
    expect(within(active).getAllByText(/전력 100%/)).toHaveLength(2)
    await userEvent.click(
      within(active).getByRole('button', { name: '전장 따라가기' }),
    )
    expect(selected()).toBe(`war:${world().wars[0].id}`)
  })

  it('행성 파괴포가 있는 세력이면 표적을 고르게 하고, 같은 세력끼리는 고를 수 없다', async () => {
    render(() => <WarPanel />)
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '맞설 세력' }),
      'empire',
    )
    await userEvent.click(screen.getByRole('radio', { name: '목성 곁' }))
    const target = screen.getByRole('combobox', { name: '행성 파괴포 표적' })
    expect(within(target).getByRole('option', { name: '유로파 · Europa' }))
    // 지구는 표적으로 고를 수 없음
    await userEvent.click(screen.getByRole('radio', { name: '지구 곁' }))
    expect(
      within(
        screen.getByRole('combobox', { name: '행성 파괴포 표적' }),
      ).queryByRole('option', { name: /지구/ }),
    ).toBeNull()
    // 맞설 세력 목록에는 공격 세력이 없음
    const b = screen.getByRole('combobox', { name: '맞설 세력' })
    expect(within(b).queryByRole('option', { name: '악시스' })).toBeNull()
  })
})
