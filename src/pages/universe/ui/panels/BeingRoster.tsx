import { For, Show, createSignal } from 'solid-js'
import { Button, SelectField } from '@/shared/ui'
import {
  ALIGNMENT_NAME,
  BEING_BY_ID,
  ELEMENT_NAME,
  FACTION_NAME,
} from '../../model/mythic/catalog'
import type { Being } from '../../model/mythic/catalog'
import { MAX_BEINGS } from '../../model/war/combat'
import { pick, t } from '../i18n'
import { beingOptions } from './beingOptions'
import styles from './panels.module.css'

/** 진영·속성·권능·성향 한 줄 */
export const aboutBeing = (b: Being) =>
  `${t('mythic.about', {
    faction: pick(FACTION_NAME[b.faction]),
    element: pick(ELEMENT_NAME[b.element]),
    power: b.power,
  })} · ${pick(ALIGNMENT_NAME[b.alignment])}`

/**
 * 한 편에 가세할 신적 존재들: 내세운 순서대로(결투 짝도 이 순서) 보여 주고 빼거나 더함.
 * 상대 편에 선 존재는 고를 수 없고, 한 편에 MAX_BEINGS명까지
 */
export function BeingRoster(props: {
  legend: string
  /** 더할 존재를 고르는 목록의 이름 (두 편이 서로 다르게) */
  addLabel: string
  beings: string[]
  /** 상대 편에 선 존재 */
  taken: string[]
  onChange: (ids: string[]) => void
}) {
  const [choice, setChoice] = createSignal('')
  const full = () => props.beings.length >= MAX_BEINGS
  const options = () => [
    { value: '', label: t('war.pickBeing') },
    ...beingOptions().filter(
      (o) => !props.beings.includes(o.value) && !props.taken.includes(o.value),
    ),
  ]
  const add = () => {
    const id = choice()
    if (!id || full()) return
    props.onChange([...props.beings, id])
    setChoice('')
  }
  return (
    <fieldset class={styles.roster}>
      <legend class="label-caps">{props.legend}</legend>
      <Show
        when={props.beings.length > 0}
        fallback={<p class={styles.small}>{t('war.noBeing')}</p>}
      >
        <ol class={styles.rosterList}>
          <For each={props.beings}>
            {(id) => {
              const being = () => BEING_BY_ID[id]
              return (
                <li>
                  <span class={styles.rosterText}>
                    <span>{pick(being().name)}</span>
                    <span class={styles.small}>{aboutBeing(being())}</span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={t('war.removeBeing', {
                      name: pick(being().name),
                    })}
                    onClick={() =>
                      props.onChange(props.beings.filter((x) => x !== id))
                    }
                  >
                    {t('war.remove')}
                  </Button>
                </li>
              )
            }}
          </For>
        </ol>
      </Show>
      <Show
        when={!full()}
        fallback={
          <p class={styles.small}>{t('war.beingsFull', { n: MAX_BEINGS })}</p>
        }
      >
        <div class={styles.rosterAdd}>
          <SelectField
            label={props.addLabel}
            value={choice()}
            onChange={setChoice}
            options={options()}
            description={
              choice() ? aboutBeing(BEING_BY_ID[choice()]) : undefined
            }
          />
          <Button size="sm" onClick={add} disabled={!choice()}>
            {t('war.addBeing')}
          </Button>
        </div>
      </Show>
    </fieldset>
  )
}
