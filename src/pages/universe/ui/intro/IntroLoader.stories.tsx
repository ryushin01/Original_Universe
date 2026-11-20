import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { IntroLoader } from './IntroLoader'

const meta = {
  title: 'universe/IntroLoader',
  component: IntroLoader,
  args: { leaving: false, onDone: () => {}, onSkip: () => {} },
} satisfies Meta<typeof IntroLoader>

export default meta
type Story = StoryObj<typeof meta>

/** 3D 없이 보는 불러오기 화면 (첫 화면·글꼴 단계에서 멈춤) */
export const Default: Story = {}
