import { Show, createSignal } from 'solid-js'
import { locale } from '@/shared/i18n'
import { Button, ChoiceGroup, StatusMessage } from '@/shared/ui'
import { formatNumber } from '@/shared/lib'
import {
  CIV_LEVELS,
  CIV_LEVEL_BY_ID,
  civLevel,
  wasteHeatC,
} from '../../model/world/civilization'
import type { CivLevelId } from '../../model/world/civilization'
import { world, worldActions } from '../../model/world/store'
import { createActionMessage, pick, t } from '../i18n'
import styles from './panels.module.css'

/**
 * 문명 단계 (카르다쇼프 척도) 고르기: 단계를 올리면 그 단계의 구조물·함대가 나타나고
 * 내리면 사라짐. 지구에서 쓰는 에너지의 폐열·밤 불빛·예산도 함께 바뀜
 */
export function CivLevelPicker() {
  const l = locale
  const current = () => civLevel(world())?.id ?? 'today'
  const [choice, setChoice] = createSignal<CivLevelId>(current())
  const feedback = createActionMessage()
  const level = () => CIV_LEVEL_BY_ID[choice()]
  const inMission = () => world().mission?.status === 'running'
  const heat = () => {
    const power = level().earthPower
    return power ? wasteHeatC(power) : 0
  }
  const apply = () => feedback.report(worldActions.setCivLevel(choice()))
  return (
    <section aria-labelledby="civ-level-title" class={styles.panel}>
      <h3 id="civ-level-title" class={styles.caption}>
        {t('civ.title')}
      </h3>
      <p class={styles.small}>{t('civ.intro')}</p>
      <ChoiceGroup<CivLevelId>
        legend={t('civ.legend')}
        value={choice()}
        onChange={setChoice}
        columns={2}
        choices={CIV_LEVELS.map((c) => ({
          value: c.id,
          label: `${pick(c.name)} · ${formatNumber(c.k, l(), c.k < 1 ? 2 : 1)}`,
        }))}
      />
      <p class={styles.small}>{pick(level().summary)}</p>
      <Show when={heat() >= 0.05}>
        <p class={styles.small}>
          {t('civ.heat', { degrees: formatNumber(heat(), l(), 1) })}
        </p>
      </Show>
      <Button onClick={apply} disabled={inMission() || choice() === current()}>
        {choice() === current() ? t('civ.current') : t('civ.apply')}
      </Button>
      <StatusMessage message={feedback.message()} tone={feedback.tone()} />
    </section>
  )
}
