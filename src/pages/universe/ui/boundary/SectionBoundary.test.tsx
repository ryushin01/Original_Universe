import { createSignal } from 'solid-js'
import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { SectionBoundary } from './SectionBoundary'

describe('SectionBoundary', () => {
  it('안쪽에서 예외가 나면 안내와 다시 시도 버튼을 보여 주고, 다시 시도하면 다시 그린다', async () => {
    const [broken, setBroken] = createSignal(true)
    const crash = vi.fn()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Fragile() {
      if (broken()) throw new Error('boom')
      return <p>패널 내용</p>
    }
    render(() => (
      <>
        <p>바깥 내용</p>
        <SectionBoundary onCrash={crash}>
          <Fragile />
        </SectionBoundary>
      </>
    ))
    expect(screen.getByText('바깥 내용')).toBeInTheDocument()
    expect(screen.getByText(/문제가 생겼습니다/)).toBeInTheDocument()
    expect(crash).toHaveBeenLastCalledWith(
      expect.stringMatching(/문제가 생겼습니다/),
    )
    expect(error).toHaveBeenCalled()

    setBroken(false)
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(screen.getByText('패널 내용')).toBeInTheDocument()
    // 다시 그리면 화면 낭독기 알림도 지움
    expect(crash).toHaveBeenLastCalledWith('')
    error.mockRestore()
  })
})
