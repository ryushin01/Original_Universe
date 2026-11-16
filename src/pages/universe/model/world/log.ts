import type { Text } from '@/shared/i18n'
import type { Tone, WorldState } from './types'

/** 사건 기록에 남기는 최대 줄 수 */
export const MAX_EVENTS = 80

/** 사건 기록에 한 줄 더함 */
export function log(
  state: WorldState,
  text: Text,
  tone: Tone = 'info',
): WorldState {
  const event = { id: state.nextId, year: state.year, text, tone }
  return {
    ...state,
    events: [event, ...state.events].slice(0, MAX_EVENTS),
    nextId: state.nextId + 1,
  }
}

/** 한 번만 알릴 이정표를 표시 */
export const markMilestone = (state: WorldState, id: string): WorldState => ({
  ...state,
  milestones: [...state.milestones, id],
})
