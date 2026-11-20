import { render, screen, within } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { initialWorld } from '../../model/world/engine'
import { __setWorldForTest, world } from '../../model/world/store'
import { BuildPanel } from './BuildPanel'

describe('BuildPanel', () => {
  beforeEach(() => __setWorldForTest(initialWorld(2026.87)))

  it('예산 안의 구조물은 짓고, 선행 조건이 없으면 이유를 알린다', async () => {
    render(() => <BuildPanel />)
    await userEvent.click(
      screen.getByRole('button', { name: '우주 기상 경보 위성 짓기' }),
    )
    expect(world().structures.map((s) => s.kind)).toEqual(['sentinel'])
    expect(
      screen.getByRole('button', { name: '화성 테라포밍 짓기' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: '화성 테라포밍 짓기' }),
    ).toHaveAccessibleDescription(/화성 자기장 방패/)
  })

  it('바로 완공을 켜면 즉시 완공한다', async () => {
    render(() => <BuildPanel />)
    await userEvent.click(screen.getByRole('checkbox', { name: /바로 완공/ }))
    await userEvent.click(
      screen.getByRole('button', { name: '행성 방위 요격망 짓기' }),
    )
    expect(world().structures[0].done).toBe(true)
  })

  it('문명 단계를 Ⅱ단계로 올리면 다이슨 구 등이 바로 서고, 지금으로 되돌릴 수 있다', async () => {
    render(() => <BuildPanel />)
    const section = screen.getByRole('region', {
      name: '문명 단계 (카르다쇼프 척도)',
    })
    // 지금 단계는 고를 필요 없음
    expect(
      within(section).getByRole('button', { name: '지금 단계' }),
    ).toBeDisabled()
    await userEvent.click(
      within(section).getByRole('radio', { name: /Ⅱ단계 항성 문명/ }),
    )
    expect(
      within(section).getByText(/다이슨 스웜과 다이슨 구가 태양을 감싸고/),
    ).toBeInTheDocument()
    expect(within(section).getByText(/약 5\.\d°C 오릅니다/)).toBeInTheDocument()
    await userEvent.click(
      within(section).getByRole('button', { name: '이 단계로 바꾸기' }),
    )
    expect(world().civ.level).toBe('type2')
    expect(world().structures.map((s) => s.kind)).toContain('dyson-sphere')
    expect(within(section).getByRole('status')).toHaveTextContent(
      '문명 단계: Ⅱ단계 항성 문명 (2.0)',
    )
    await userEvent.click(within(section).getByRole('radio', { name: /지금/ }))
    await userEvent.click(
      within(section).getByRole('button', { name: '이 단계로 바꾸기' }),
    )
    expect(world().civ).toEqual({ level: null, granted: [] })
    expect(world().structures).toHaveLength(0)
  })
})
