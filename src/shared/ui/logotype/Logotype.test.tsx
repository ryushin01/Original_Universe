import { render, screen } from '@solidjs/testing-library'
import { Logotype } from './Logotype'

describe('Logotype', () => {
  it('글자 윤곽 그림을 이름이 있는 이미지로 낸다', () => {
    render(() => (
      <h1>
        <Logotype />
      </h1>
    ))
    expect(
      screen.getByRole('heading', { name: 'Original Universe' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Original Universe' })).toBeVisible()
  })

  it('장식용이면 보조 기술에서 숨긴다', () => {
    const { container } = render(() => <Logotype decorative />)
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('이름을 바꿀 수 있다', () => {
    render(() => <Logotype label="처음으로" />)
    expect(screen.getByRole('img', { name: '처음으로' })).toBeInTheDocument()
  })
})
