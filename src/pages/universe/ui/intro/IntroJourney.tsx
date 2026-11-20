import {
  For,
  Show,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
} from 'solid-js'
import { Button, Logotype } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { viewActions } from '../../model/view'
import { t } from '../i18n'
import { JOURNEY, stopElementId } from './journey'
import type { JourneyStop, StopId } from './journey'
import { activeStop, journeyActions, phase } from './journeyState'
import styles from './IntroJourney.module.css'

/** 빠르게 스크롤해 지나가는 구간으로는 카메라를 보내지 않음 (밀리초) */
const SETTLE_MS = 160

const pad = (n: number) => String(n).padStart(2, '0')

/** 구간의 천체(또는 규모 전체)로 카메라를 보냄 */
function flyTo(stop: JourneyStop) {
  if (stop.focus) viewActions.selectIn(stop.scale, stop.focus)
  else viewActions.setScale(stop.scale)
}

/**
 * 소개 둘러보기: 스크롤하면 지구 → 달 → 토성 → 해왕성 → 우리 은하 → 다시 지구로 카메라가 옮겨 가고,
 * 구간마다 천체 좌표 표지와 기능 소개가 나옵니다. 오른쪽 아래에서 구간을 오갈 수 있음
 */
export function IntroJourney(props: { onStart: () => void }) {
  let scroller!: HTMLDivElement
  const [enhanced, setEnhanced] = createSignal(false)
  const [seen, setSeen] = createSignal(new Set<StopId>(['earth']))
  const index = () => JOURNEY.findIndex((stop) => stop.id === activeStop())

  onMount(() => {
    setEnhanced(true)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = (entry.target as HTMLElement).dataset.stop as StopId
          journeyActions.setActiveStop(id)
          setSeen((before) => new Set(before).add(id))
        }
      },
      { root: scroller, threshold: 0.55 },
    )
    for (const section of scroller.querySelectorAll('section'))
      observer.observe(section)
    onCleanup(() => observer.disconnect())
  })

  createEffect(
    on(activeStop, (id) => {
      const stop = JOURNEY.find((item) => item.id === id)
      if (!stop) return
      const timer = setTimeout(() => flyTo(stop), SETTLE_MS)
      onCleanup(() => clearTimeout(timer))
    }),
  )

  const scrollToStop = (next: number) => {
    const stop = JOURNEY[next]
    if (!stop) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    document
      .getElementById(stopElementId(stop.id))
      ?.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' })
  }

  return (
    <div
      ref={scroller}
      class={cn(styles.journey, enhanced() && styles.enhanced)}
      inert={phase() === 'loading' ? true : undefined}
    >
      <For each={JOURNEY}>
        {(stop) => {
          const headingId = `${stopElementId(stop.id)}-title`
          return (
            <section
              id={stopElementId(stop.id)}
              data-stop={stop.id}
              tabIndex={-1}
              aria-labelledby={headingId}
              class={cn(
                styles.stop,
                stop.id === 'earth' && styles.hero,
                seen().has(stop.id) && styles.seen,
              )}
            >
              <div class={styles.copy}>
                <p class={styles.place}>{t(stop.place)}</p>
                <Show
                  when={stop.title}
                  fallback={
                    <h1 id={headingId} class={styles.logo}>
                      <span class="sr-only">Original Universe</span>
                      <Logotype decorative />
                    </h1>
                  }
                >
                  {(title) => (
                    <h2 id={headingId} class={styles.title}>
                      {t(title())}
                    </h2>
                  )}
                </Show>
                <p class={styles.body}>{t(stop.body)}</p>
                <Show when={stop.id === 'earth' || stop.id === 'reentry'}>
                  <div class={styles.actions}>
                    <Button variant="primary" chevron onClick={props.onStart}>
                      {t('page.start')}
                    </Button>
                    <Show when={stop.id === 'earth'}>
                      <a href={`#${stopElementId('moon')}`} class={styles.tour}>
                        {t('intro.tour')}
                        <svg viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M6 2v8M2.5 6.5 6 10l3.5-3.5" />
                        </svg>
                      </a>
                    </Show>
                  </div>
                </Show>
              </div>
            </section>
          )
        }}
      </For>
      <div class={styles.dock}>
        <button
          type="button"
          class={styles.step}
          aria-label={t('intro.prev')}
          disabled={index() <= 0}
          onClick={() => scrollToStop(index() - 1)}
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 7.5 6 4l3.5 3.5" />
          </svg>
        </button>
        <p class={styles.where} aria-live="polite">
          <span class={styles.count}>
            {t('intro.position', {
              index: pad(index() + 1),
              total: pad(JOURNEY.length),
            })}
          </span>
          <span>{t(JOURNEY[Math.max(0, index())].nav)}</span>
        </p>
        <button
          type="button"
          class={styles.step}
          aria-label={t('intro.next')}
          disabled={index() >= JOURNEY.length - 1}
          onClick={() => scrollToStop(index() + 1)}
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 4.5 6 8l3.5-3.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
