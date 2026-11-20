import { createSignal } from 'solid-js'
import type { StopId } from './journey'

/** loading: 불러오기 화면, journey: 스크롤 둘러보기 */
const [phase, setPhase] = createSignal<'loading' | 'journey'>('loading')
/** 화면에 머문 구간 */
const [activeStop, setActiveStop] = createSignal<StopId>('earth')

export { phase, activeStop }

export const journeyActions = { setPhase, setActiveStop }
