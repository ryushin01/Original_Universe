import { For, Show } from 'solid-js'
import { locale } from '@/shared/i18n'
import { formatNumber, formatPower } from '@/shared/lib'
import {
  KARDASHEV_LANDMARKS,
  KARDASHEV_NOTES,
  KARDASHEV_TYPES,
  nextType,
  powerAt,
  yearsToReach,
} from '../../model/kardashev'
import { EARTH_POWER_CAP_W, POWER_GROWTH } from '../../model/world/selectors'
import { world } from '../../model/world/store'
import { pick, t } from '../i18n'
import styles from './status.module.css'

const NUMERALS = ['0', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ']

/**
 * 카르다쇼프 척도 자세히 (접기): 지금 값과 다음 단계까지의 배수·도달 해, 0~Ⅵ단계 사다리(지금 자리 표시),
 * 기준점, 역사·예측·한계·다른 척도
 */
export function KardashevDetails(props: { power: number; k: number | null }) {
  const l = locale
  const level = () => (props.k === null ? null : Math.floor(props.k))
  /** 배수: 10만 배 아래는 정수로, 넘으면 거듭제곱으로 */
  const factorText = (factor: number) =>
    factor < 1e5
      ? formatNumber(Math.round(factor), l(), 0)
      : formatPower(factor, 2)
  const next = () => (props.k === null ? null : nextType(props.k))
  /** 이 시뮬레이터의 성장(연 1.5%)으로 다음 단계에 닿는 해 (지구 한도를 넘는 단계면 null) */
  const eta = () => {
    const n = next()
    if (!n) return null
    const target = powerAt(n.level)
    if (target > EARTH_POWER_CAP_W) return null
    return Math.round(
      world().year + yearsToReach(props.power, target, POWER_GROWTH),
    )
  }
  return (
    <details class={styles.block}>
      <summary class={styles.heading}>{t('kardashev.title')}</summary>
      <p class={styles.small}>{t('kardashev.formula')}</p>
      <Show when={next()}>
        {(n) => (
          <p class={styles.small}>
            {eta() !== null
              ? t('kardashev.nextEta', {
                  type: NUMERALS[n().level],
                  factor: factorText(n().factor),
                  year: eta()!,
                })
              : t('kardashev.nextDyson', {
                  type: NUMERALS[n().level],
                  factor: factorText(n().factor),
                })}
          </p>
        )}
      </Show>
      <ol class={styles.ladder} aria-label={t('kardashev.ladder')}>
        <For each={[...KARDASHEV_TYPES].reverse()}>
          {(type) => {
            const here = () => level() === type.level
            return (
              <li
                aria-current={here() ? 'true' : undefined}
                classList={{ [styles.ladderHere]: here() }}
              >
                <p class={styles.ladderTitle}>
                  {t('kardashev.type', { n: type.numeral })} {pick(type.label)}
                  {type.watts ? ` · ${formatPower(type.watts, 1)} W` : ''}
                  <Show when={here()}>
                    {' '}
                    <span class={styles.tag}>
                      {t('kardashev.here', {
                        k: formatNumber(props.k ?? 0, l(), 2),
                      })}
                    </span>
                  </Show>
                </p>
                <p class={styles.small}>{pick(type.scope)}</p>
                <p class={styles.small}>{pick(type.examples)}</p>
                <Show when={type.original}>
                  {(watts) => (
                    <p class={styles.small}>
                      {t('kardashev.original', {
                        watts: formatPower(watts(), 1),
                      })}
                    </p>
                  )}
                </Show>
              </li>
            )
          }}
        </For>
      </ol>
      <h3 class={styles.heading}>{t('kardashev.landmarks')}</h3>
      <dl class={styles.list}>
        <For each={KARDASHEV_LANDMARKS}>
          {(mark) => (
            <>
              <dt>{pick(mark.label)}</dt>
              <dd>{formatNumber(mark.k, l(), 2)}</dd>
            </>
          )}
        </For>
      </dl>
      <For each={KARDASHEV_NOTES}>
        {(note) => <p class={styles.small}>{pick(note)}</p>}
      </For>
    </details>
  )
}
