import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MythicPanel } from './MythicPanel'

const meta = {
  title: 'universe/panels/MythicPanel',
  component: MythicPanel,
} satisfies Meta<typeof MythicPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
