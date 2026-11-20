import { For, Show, createEffect, createSignal, onMount } from 'solid-js'
import { isServer } from 'solid-js/web'
import { syncLocale } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { REPOSITORY_URL } from '@/shared/config'
import { intro, viewActions } from '../model/view'
import { startAtNow } from '../model/world/store'
import { t } from './i18n'
import { useClock } from './useClock'
import { Intro } from './intro/Intro'
import { IntroBar } from './intro/IntroBar'
import { stopElementId } from './intro/journey'
import { phase } from './intro/journeyState'
import { LanguageSwitch } from './LanguageSwitch'
import { Viewport } from './viewport/Viewport'
import { ScaleLadder } from './scale/ScaleLadder'
import { DestinationStrip } from './destinations/DestinationStrip'
import { ControlPanel } from './panels/ControlPanel'
import { TimeControls } from './status/TimeControls'
import { Dossier } from './status/Dossier'
import { MissionPanel } from './status/MissionPanel'
import { StatusBoard } from './status/StatusBoard'
import { EventLog } from './status/EventLog'
import { ScenarioShare, openSharedScenario } from './status/ScenarioShare'
import { SectionBoundary } from './boundary/SectionBoundary'
import styles from './UniversePage.module.css'

const MOBILE_LINKS = [
  { href: '#stage', label: 'page.viewport' },
  { href: '#controls', label: 'page.controls' },
  { href: '#status', label: 'page.status' },
] as const

export function UniversePage() {
  useClock()
  onMount(() => {
    syncLocale()
    startAtNow()
    // 공유 링크로 열면 소개 화면 없이 바로 그 장면으로
    if (openSharedScenario()) viewActions.closeIntro()
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      const base = import.meta.env.BASE_URL
      navigator.serviceWorker
        .register(`${base}sw.js`, { scope: base })
        .catch(() => {})
    }
  })
  createEffect(() => {
    if (!isServer) document.title = `ORIGINAL UNIVERSE · ${t('page.tagline')}`
  })

  const inertDuringIntro = () => (intro() ? true : undefined)
  /** 패널을 그리다 난 오류 안내 (알림 영역은 처음부터 두고 내용만 바꿈) */
  const [crash, setCrash] = createSignal('')

  const start = () => {
    // 둘러보기에서 옮겨 간 카메라를 태양계 전체 모습으로 되돌리고 지구를 고른 채로 시작
    viewActions.setScale('solar')
    viewActions.select('earth', false)
    viewActions.closeIntro()
    // 소개가 사라진 뒤 우주 관리 패널로 초점을 옮김
    queueMicrotask(() =>
      document.getElementById('controls')?.focus({ preventScroll: true }),
    )
  }

  return (
    <div class={cn(styles.page, intro() && styles.introOn)}>
      <Show when={!intro()}>
        <a href="#controls" class={styles.skip}>
          {t('page.skip')}
        </a>
      </Show>
      <Show when={intro() && phase() === 'journey'}>
        <a href={`#${stopElementId('earth')}`} class={styles.skip}>
          {t('intro.toContent')}
        </a>
      </Show>
      <Show
        when={intro()}
        fallback={
          <header class={styles.header}>
            <div class={styles.brand}>
              <h1 class={styles.title}>Original Universe</h1>
              <p class={styles.tagline}>{t('page.tagline')}</p>
            </div>
            <LanguageSwitch />
          </header>
        }
      >
        <IntroBar languages={<LanguageSwitch />} />
      </Show>

      {/* 소개 화면 동안 main 랜드마크는 남기고 시뮬레이터 영역만 inert */}
      <main class={styles.main}>
        <Show when={intro()}>
          <Intro onStart={start} />
        </Show>
        <section
          id="stage"
          aria-labelledby="stage-title"
          class={styles.stage}
          inert={inertDuringIntro()}
        >
          <h2 id="stage-title" class="sr-only">
            {t('page.viewport')}
          </h2>
          <SectionBoundary name={t('page.viewport')} onCrash={setCrash}>
            <Viewport hintId="viewport-hint" controls={!intro()} />
          </SectionBoundary>
          <p id="viewport-hint" class={styles.hint}>
            {t('viewport.hint')}
          </p>
        </section>
        <div class={styles.ladder} inert={inertDuringIntro()}>
          <ScaleLadder />
        </div>
        <div class={styles.destinations} inert={inertDuringIntro()}>
          <DestinationStrip />
        </div>
        <div class={styles.panels} inert={inertDuringIntro()}>
          <section
            id="controls"
            tabIndex={-1}
            aria-labelledby="controls-title"
            class={cn(styles.panel, styles.left)}
          >
            <h2 id="controls-title" class={styles.panelTitle}>
              {t('page.controls')}
            </h2>
            <SectionBoundary name={t('page.controls')} onCrash={setCrash}>
              <ControlPanel />
            </SectionBoundary>
          </section>
          <section
            id="status"
            tabIndex={-1}
            aria-labelledby="status-title"
            class={cn(styles.panel, styles.right)}
          >
            <h2 id="status-title" class={styles.panelTitle}>
              {t('page.status')}
            </h2>
            <SectionBoundary name={t('page.status')} onCrash={setCrash}>
              <TimeControls />
              <Dossier />
              <MissionPanel />
              <StatusBoard />
              <EventLog />
              <ScenarioShare />
            </SectionBoundary>
            {/* 외부 자료의 출처는 README에 밝히고, 화면에는 그곳으로 가는 링크만 둠 */}
            <p class={styles.credits}>
              {/* 저장하지 않은 시뮬레이션이 사라지지 않도록 새 탭으로 (글자로 미리 알림) */}
              <a
                href={`${REPOSITORY_URL}#출처`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('page.credits')}
              </a>
            </p>
          </section>
        </div>
        <p role="alert" class="sr-only">
          {crash()}
        </p>
      </main>
      <nav
        aria-label={t('page.mobileNav')}
        class={styles.mobileNav}
        inert={inertDuringIntro()}
      >
        <ul>
          <For each={MOBILE_LINKS}>
            {(link) => (
              <li>
                <a href={link.href}>{t(link.label)}</a>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </div>
  )
}
