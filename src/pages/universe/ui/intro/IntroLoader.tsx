import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { Logotype } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { sceneLoad } from '../viewport/sceneLoad'
import { t } from '../i18n'
import type { MessageKey } from '../i18n'
import { loadProgress, stageIndex } from './loading'
import styles from './IntroLoader.module.css'

const STAGES: MessageKey[] = [
  'intro.stage1',
  'intro.stage2',
  'intro.stage3',
  'intro.stage4',
  'intro.stage5',
  'intro.stage6',
  'intro.stage7',
  'intro.stage8',
]

/** 첫 장면을 그린 뒤 남은 텍스처를 이만큼만 기다림 (밀리초) */
const AFTER_READY_MS = 6000
/** 3D가 끝내 준비되지 않아도 둘러보기를 여는 시간 (밀리초) */
const LOAD_CAP_MS = 25_000

/**
 * 소개 화면의 불러오기: 로고, 한 줄 소개, 가는 진행선과 백분율, 준비 단계 문구, 건너뛰기.
 * 3D 장면을 다 받으면 `onDone`으로 둘러보기를 엶
 */
export function IntroLoader(props: {
  leaving: boolean
  onDone: () => void
  onSkip: () => void
}) {
  const [fonts, setFonts] = createSignal(false)
  const [shown, setShown] = createSignal(0)
  const target = () => loadProgress(sceneLoad(), fonts())
  const percent = () => Math.round(shown() * 100)

  onMount(() => {
    void document.fonts.ready.then(() => setFonts(true))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    // 보이는 진행률은 목표를 부드럽게 따라감 (줄어들지는 않음)
    let frame = 0
    const tick = () => {
      const goal = target()
      setShown((now) => {
        if (reduced.matches) return Math.max(now, goal)
        const next = now + (goal - now) * 0.08
        return goal - next < 0.004 ? Math.max(now, goal) : Math.max(now, next)
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const cap = setTimeout(props.onDone, LOAD_CAP_MS)
    onCleanup(() => {
      cancelAnimationFrame(frame)
      clearTimeout(cap)
    })
  })

  createEffect(() => {
    if (shown() >= 1) props.onDone()
  })
  createEffect(() => {
    if (sceneLoad().status !== 'ready') return
    const wait = setTimeout(props.onDone, AFTER_READY_MS)
    onCleanup(() => clearTimeout(wait))
  })

  const stage = () =>
    shown() >= 1
      ? t('intro.ready')
      : t(STAGES[stageIndex(shown(), STAGES.length)])

  return (
    <div class={cn(styles.loader, props.leaving && styles.leaving)}>
      <div class={styles.center}>
        <h1 class={styles.logo}>
          <span class="sr-only">Original Universe</span>
          <Logotype decorative write />
        </h1>
        <p class={styles.lead}>{t('intro.loaderLead')}</p>
        <progress
          class={styles.bar}
          max={100}
          value={percent()}
          aria-label={t('intro.progressLabel')}
        />
        <p class={styles.percent} aria-hidden="true">
          {t('intro.loading')} {percent()}%
        </p>
        <p class={styles.stage} aria-hidden="true">
          {stage()}
        </p>
      </div>
      <button type="button" class={styles.skip} onClick={() => props.onSkip()}>
        {t('intro.skip')}
      </button>
    </div>
  )
}
