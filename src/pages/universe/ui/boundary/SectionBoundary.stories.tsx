import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { SectionBoundary } from './SectionBoundary'

function Broken(): never {
  throw new Error('스토리에서 일부러 낸 오류')
}

const meta = {
  title: 'universe/SectionBoundary',
  component: SectionBoundary,
  args: { onCrash: () => {}, children: undefined },
} satisfies Meta<typeof SectionBoundary>

export default meta
type Story = StoryObj<typeof meta>

/** 안쪽 패널이 정상일 때는 그대로 보여 줌 */
export const Default: Story = {
  render: (args) => (
    <SectionBoundary onCrash={args.onCrash}>
      <p>패널 내용</p>
    </SectionBoundary>
  ),
}

/** 안쪽에서 예외가 나면 안내와 다시 시도 버튼 */
export const Crashed: Story = {
  render: (args) => (
    <SectionBoundary onCrash={args.onCrash}>
      <Broken />
    </SectionBoundary>
  ),
}
