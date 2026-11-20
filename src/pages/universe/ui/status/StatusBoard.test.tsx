import { render, screen, within } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { initialWorld } from '../../model/world/engine'
import { jumpTo } from '../../model/world/actions'
import { yearAtSunAge } from '../../model/solar/sun'
import { __setWorldForTest } from '../../model/world/store'
import { StatusBoard } from './StatusBoard'

describe('StatusBoard', () => {
  it('오늘은 주계열성 태양과 거주 가능한 지구, 카르다쇼프 약 0.73', () => {
    __setWorldForTest(initialWorld(2026.87))
    render(() => <StatusBoard />)
    expect(screen.getByText('주계열성')).toBeInTheDocument()
    expect(screen.getByText('거주 가능')).toBeInTheDocument()
    const dt = screen.getByText('카르다쇼프 척도', { selector: 'dt' })
    expect(dt.nextElementSibling).toHaveTextContent('0.73')
  })

  it('카르다쇼프 척도를 펼치면 0~Ⅵ단계와 지금 자리, 다음 단계까지의 배수·해를 보여 준다', async () => {
    __setWorldForTest(initialWorld(2026.87))
    render(() => <StatusBoard />)
    const summary = screen.getByText('카르다쇼프 척도 자세히')
    expect(summary.tagName).toBe('SUMMARY')
    await userEvent.click(summary)
    expect(summary.closest('details')).toHaveAttribute('open')
    const ladder = screen.getByRole('list', { name: '카르다쇼프 척도 단계' })
    const items = within(ladder).getAllByRole('listitem')
    expect(items).toHaveLength(7)
    expect(items[0]).toHaveTextContent('Ⅵ단계 모든 다중우주')
    expect(
      within(ladder).getByText(/Ⅰ단계 행성 문명 · 10¹⁶ W/),
    ).toBeInTheDocument()
    // 지금은 0단계와 Ⅰ단계 사이 (0.73)
    const here = items.find((li) => li.getAttribute('aria-current') === 'true')!
    expect(here).toHaveTextContent('0단계 기준점')
    expect(here).toHaveTextContent('지금 0.73')
    expect(
      screen.getByText(/Ⅰ단계까지 에너지 \d+배\. .*\d{4}년쯤 닿습니다/),
    ).toBeInTheDocument()
    expect(screen.getByText(/원래 기준\(1964\): 4×10¹² W/)).toBeInTheDocument()
    expect(screen.getByText(/네오-카르다쇼프 척도/)).toBeInTheDocument()
  })

  it('적색 거성 태양이 지구를 삼키면 지구가 없다고 알린다', () => {
    __setWorldForTest(jumpTo(initialWorld(2026.87), yearAtSunAge(12.2)).state)
    render(() => <StatusBoard />)
    expect(screen.getByText('없음')).toBeInTheDocument()
    expect(screen.getByText(/헬륨을 태우는 거성/)).toBeInTheDocument()
  })
})
