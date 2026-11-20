import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Logotype } from './Logotype'

const meta = {
  title: 'shared/Logotype',
  component: Logotype,
  decorators: [
    (Story) => (
      <div style={{ width: '360px', color: 'var(--ice)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Logotype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 처음 나타날 때 써 내려가는 모습 */
export const Write: Story = { args: { write: true } }
