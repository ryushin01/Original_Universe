import { Show, createSignal } from 'solid-js'
import { IntroJourney } from './IntroJourney'
import { IntroLoader } from './IntroLoader'
import { stopElementId } from './journey'
import { journeyActions, phase } from './journeyState'

/** 불러오기 화면이 사라지는 시간 (IntroLoader.module.css의 전환과 같음, 밀리초) */
const LEAVE_MS = 700

/** 소개 화면: 3D를 불러오는 동안 불러오기 화면, 다 받으면 스크롤 둘러보기 */
export function Intro(props: { onStart: () => void }) {
  let loader: HTMLDivElement | undefined
  const [leaving, setLeaving] = createSignal(false)

  const done = () => {
    if (leaving()) return
    setLeaving(true)
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    setTimeout(
      () => {
        // 건너뛰기 버튼에 있던 초점은 사라지므로 첫 구간으로 옮김
        const hadFocus = loader?.contains(document.activeElement)
        journeyActions.setPhase('journey')
        if (hadFocus)
          document
            .getElementById(stopElementId('earth'))
            ?.focus({ preventScroll: true })
      },
      reduced ? 0 : LEAVE_MS,
    )
  }

  return (
    <>
      <IntroJourney onStart={props.onStart} />
      <Show when={phase() === 'loading'}>
        <div ref={loader}>
          <IntroLoader
            leaving={leaving()}
            onDone={done}
            onSkip={props.onStart}
          />
        </div>
      </Show>
    </>
  )
}
