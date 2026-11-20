import { For } from 'solid-js'
import { LOCALES, locale, setLocale } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { t } from './i18n'
import styles from './UniversePage.module.css'

/** 한국어·영어 전환 (눌린 쪽이 지금 언어) */
export function LanguageSwitch() {
  return (
    <div role="group" aria-label={t('page.language')} class={styles.languages}>
      <For each={LOCALES}>
        {(value) => (
          <button
            type="button"
            lang={value}
            aria-pressed={locale() === value ? 'true' : 'false'}
            onClick={() => setLocale(value)}
            class={cn(styles.language, locale() === value && styles.languageOn)}
          >
            {value === 'ko' ? '한국어' : 'English'}
          </button>
        )}
      </For>
    </div>
  )
}
