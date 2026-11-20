import { For } from 'solid-js'
import type { JSX } from 'solid-js'
import { Logotype } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { BASE, REPOSITORY_URL } from '@/shared/config'
import { t } from '../i18n'
import { JOURNEY, stopElementId } from './journey'
import { activeStop, phase } from './journeyState'
import styles from './IntroBar.module.css'

/** 소개 화면의 머리말: 왼쪽 위 로고, 구간 메뉴, 언어, 오른쪽 세로 링크 (불러오는 동안은 언어만) */
export function IntroBar(props: { languages: JSX.Element }) {
  const hidden = () => (phase() === 'loading' ? true : undefined)
  return (
    <header class={cn(styles.bar, hidden() && styles.loading)}>
      <a
        href={`#${stopElementId('earth')}`}
        class={styles.brand}
        aria-label={t('intro.home')}
        inert={hidden()}
      >
        <Logotype decorative />
      </a>
      <nav aria-label={t('intro.nav')} class={styles.nav} inert={hidden()}>
        <ul>
          <For each={JOURNEY}>
            {(stop) => (
              <li>
                <a
                  href={`#${stopElementId(stop.id)}`}
                  aria-current={activeStop() === stop.id ? 'true' : undefined}
                >
                  {t(stop.nav)}
                </a>
              </li>
            )}
          </For>
        </ul>
      </nav>
      <div class={styles.languages}>{props.languages}</div>
      <ul aria-label={t('intro.links')} class={styles.links} inert={hidden()}>
        <li>
          <a href={REPOSITORY_URL} aria-label={t('intro.repository')}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4.5l-4 15" />
            </svg>
          </a>
        </li>
        <li>
          <a href={`${BASE}storybook/`} aria-label={t('intro.storybook')}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3zM5 16.5a3 3 0 0 1 3-3h11M9 8h6" />
            </svg>
          </a>
        </li>
      </ul>
    </header>
  )
}
