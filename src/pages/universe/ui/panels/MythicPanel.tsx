import { For, Show, createSignal } from 'solid-js'
import { locale } from '@/shared/i18n'
import type { Locale } from '@/shared/i18n'
import { Button, ChoiceGroup, SelectField, StatusMessage } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import { formatPercent } from '@/shared/lib'
import {
  ALIGNMENT_NAME,
  BEINGS,
  BEING_BY_ID,
  CALAMITIES,
  ELEMENT_NAME,
  FACTION_NAME,
  GROUP_NAME,
  SITES,
  SITE_BY_ID,
} from '../../model/mythic/catalog'
import type { Being, Calamity, SiteId } from '../../model/mythic/catalog'
import {
  areRivals,
  battleDays,
  favoured,
  planPulses,
  winChance,
} from '../../model/mythic/combat'
import { viewActions } from '../../model/view'
import { world, worldActions } from '../../model/world/store'
import {
  aftermathPreview,
  battleOf,
  ragingBattles,
} from '../../model/world/mythic'
import { formatDuration, josa, nameOf } from '../../model/world/text'
import { createActionMessage, pick, t } from '../i18n'
import type { MessageKey } from '../i18n'
import styles from './panels.module.css'

const RIVAL_SELECT_ID = 'mythic-rival'

/** 고르는 목록: 진영·지역별 묶음 */
const beingOptions = (exclude?: string): SelectOption[] =>
  BEINGS.filter((b) => b.id !== exclude).map((b) => ({
    value: b.id,
    label: pick(b.name),
    group: pick(GROUP_NAME[b.group]),
  }))

const who = (being: Being, l: Locale) =>
  l === 'ko' ? josa(being.name.ko, '이가') : being.name.en

/** 이긴 쪽이 남길 일 (삼킴이면 천체 이름까지) */
function aftermathText(being: Being, site: SiteId, l: Locale): string {
  const { calamity, victim } = aftermathPreview(world(), being, site)
  const result = victim
    ? t('mythic.devours', {
        body: l === 'ko' ? josa(nameOf(victim, l), '을를') : nameOf(victim, l),
      })
    : pick(CALAMITIES[calamity].name)
  return t('mythic.ifWins', { who: who(being, l), result })
}

/** 함께 일으킬 재해 이름 (겹치지 않게, 일어날 순서대로) */
function calamityList(a: Being, b: Being | null): string {
  const seen: Calamity[] = []
  for (const plan of planPulses(a, b, () => 0.5))
    if (!seen.includes(plan.calamity)) seen.push(plan.calamity)
  return seen.map((c) => pick(CALAMITIES[c].name)).join(', ')
}

/** 진행 중인 격돌·강림 한 개 */
function ActiveCard(props: {
  id: number
  onAnswer: (beingId: string) => void
}) {
  const l = () => locale()
  const battle = () => world().battles.find((b) => b.id === props.id)
  return (
    <Show when={battle()}>
      {(b) => {
        const a = () => BEING_BY_ID[b().a]
        const rival = () => (b().b ? BEING_BY_ID[b().b!] : null)
        const progress = () =>
          Math.min(
            1,
            Math.max(
              0,
              (world().year - b().startYear) /
                Math.max(1e-9, b().endYear - b().startYear),
            ),
          )
        return (
          <li class={styles.card}>
            <div class={styles.cardHead}>
              <span class={styles.cardTitle}>
                {rival()
                  ? t('mythic.vs', {
                      a: pick(a().name),
                      b: pick(rival()!.name),
                    })
                  : t('mythic.descent', { name: pick(a().name) })}
              </span>
              <span class={styles.tag}>
                {rival() ? t('mythic.matchup') : t('mythic.countdown')}
              </span>
            </div>
            <p class={styles.small}>
              {t('mythic.left', {
                site: pick(SITE_BY_ID[b().site].name),
                time: formatDuration(
                  Math.max(0, b().endYear - world().year),
                  l(),
                ),
              })}
            </p>
            <div class={styles.meter} aria-hidden="true">
              <span style={{ width: `${progress() * 100}%` }} />
            </div>
            <div class={styles.row}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => viewActions.selectIn('solar', `being:${a().id}`)}
              >
                {t('mythic.follow', { name: pick(a().name) })}
              </Button>
              <Show when={rival()}>
                {(r) => (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      viewActions.selectIn('solar', `being:${r().id}`)
                    }
                  >
                    {t('mythic.follow', { name: pick(r().name) })}
                  </Button>
                )}
              </Show>
              <Show when={!rival()}>
                <Button size="sm" onClick={() => props.onAnswer(a().id)}>
                  {t('mythic.answer', { name: pick(a().name) })}
                </Button>
              </Show>
            </div>
          </li>
        )
      }}
    </Show>
  )
}

/** 우주적 존재: 불러내 싸우게 하면 그 격돌이 우주적 재해를 일으킴 */
export function MythicPanel() {
  const [beingId, setBeingId] = createSignal('nodens')
  const [rivalId, setRivalId] = createSignal('nyarlathotep')
  const [siteId, setSiteId] = createSignal<SiteId>('earth')
  const feedback = createActionMessage()
  const l = () => locale()

  const being = () => BEING_BY_ID[beingId()]
  const rival = () => (rivalId() ? BEING_BY_ID[rivalId()] : null)
  /** 고른 존재가 홀로 강림해 있으면 그 강림 */
  const descent = () => {
    const battle = battleOf(world(), beingId())
    return battle && battle.b === null ? battle : undefined
  }
  const site = (): SiteId => descent()?.site ?? siteId()
  const odds = () => (rival() ? winChance(being(), rival()!) : 1)
  const edge = () => (rival() ? favoured(being(), rival()!) : null)

  const chooseBeing = (id: string) => {
    setBeingId(id)
    // 같은 존재끼리는 싸울 수 없으므로 맞설 존재를 비움
    if (rivalId() === id) setRivalId('')
  }

  /** 강림한 존재에게 맞서기: 그 존재를 고르고 맞설 존재 고르기로 초점을 옮김 */
  const answer = (id: string) => {
    chooseBeing(id)
    if (!rivalId()) setRivalId(BEINGS.find((b) => b.id !== id)!.id)
    document.getElementById(RIVAL_SELECT_ID)?.focus()
  }

  const launch = () => {
    // 강림한 존재를 고른 채 맞설 존재가 없으면 무엇을 할지 알려 줌
    if (descent() && !rival()) {
      // 이름은 지금 고른 존재로 정하고, 언어를 바꾸면 그 언어로 다시 나옴
      const name = being().name
      feedback.say(() => t('mythic.pickRival', { name: pick(name) }), false)
      return
    }
    feedback.report(
      worldActions.summon({
        being: beingId(),
        rival: rivalId() || null,
        site: site(),
      }),
    )
  }

  const about = (b: Being) =>
    t('mythic.about', {
      faction: pick(FACTION_NAME[b.faction]),
      element: pick(ELEMENT_NAME[b.element]),
      power: b.power,
    })

  const active = () => ragingBattles(world()).map((b) => b.id)

  return (
    <div class={styles.panel}>
      <p class={styles.intro}>{t('mythic.intro')}</p>
      <SelectField
        label={t('mythic.being')}
        value={beingId()}
        onChange={chooseBeing}
        options={beingOptions()}
        description={`${about(being())} · ${pick(ALIGNMENT_NAME[being().alignment])}. ${pick(being().lore)} (${pick(being().origin)})`}
      />
      <SelectField
        id={RIVAL_SELECT_ID}
        label={t('mythic.rival')}
        value={rivalId()}
        onChange={setRivalId}
        options={[
          { value: '', label: t('mythic.alone') },
          ...beingOptions(beingId()),
        ]}
        description={
          rival()
            ? `${about(rival()!)} · ${pick(ALIGNMENT_NAME[rival()!.alignment])}. ${pick(rival()!.lore)} (${pick(rival()!.origin)})`
            : undefined
        }
      />
      <Show
        when={!descent()}
        fallback={
          <p class={styles.small}>
            {t('mythic.siteFixed', { site: pick(SITE_BY_ID[site()].name) })}
          </p>
        }
      >
        <ChoiceGroup<SiteId>
          legend={t('mythic.site')}
          value={siteId()}
          onChange={setSiteId}
          columns={2}
          choices={SITES.map((s) => ({ value: s.id, label: pick(s.name) }))}
        />
      </Show>
      <dl class={styles.preview}>
        <Show
          when={rival()}
          fallback={
            <>
              <dt>{t('mythic.countdown')}</dt>
              <dd>{formatDuration(battleDays(being(), null) / 365.25, l())}</dd>
              <dt>{t('mythic.omens')}</dt>
              <dd>{calamityList(being(), null)}</dd>
              <dt>{t('mythic.ending')}</dt>
              <dd class={being().alignment === 'chaos' ? styles.danger : ''}>
                {aftermathText(being(), site(), l())}
              </dd>
            </>
          }
        >
          {(r) => (
            <>
              <dt>{t('mythic.matchup')}</dt>
              <dd>
                {t('mythic.vs', {
                  a: `${pick(being().name)} ${being().power}`,
                  b: `${pick(r().name)} ${r().power}`,
                })}
              </dd>
              <dt>{t('mythic.affinity')}</dt>
              <dd>
                {edge()
                  ? t(`mythic.affinity.${edge()!.kind}` as MessageKey, {
                      name: pick(edge()!.being.name),
                    })
                  : t('mythic.affinity.even')}
              </dd>
              <dt>{t('mythic.odds')}</dt>
              <dd>
                {t('mythic.oddsValue', {
                  name: pick(being().name),
                  percent: formatPercent(odds(), l()),
                })}
              </dd>
              <Show when={areRivals(being(), r())}>
                <dt>{t('mythic.legend')}</dt>
                <dd>{t('mythic.rivals')}</dd>
              </Show>
              <dt>{t('mythic.duration')}</dt>
              <dd>{formatDuration(battleDays(being(), r()) / 365.25, l())}</dd>
              <dt>{t('mythic.calamities')}</dt>
              <dd>{calamityList(being(), r())}</dd>
              <dt>{t('mythic.ending')}</dt>
              <dd>
                {aftermathText(being(), site(), l())}
                <br />
                {aftermathText(r(), site(), l())}
              </dd>
            </>
          )}
        </Show>
      </dl>
      <Button variant="danger" onClick={launch}>
        {descent()
          ? t('mythic.oppose')
          : rival()
            ? t('mythic.clash')
            : t('mythic.descend')}
      </Button>
      <StatusMessage message={feedback.message()} tone={feedback.tone()} />
      <Show when={active().length > 0}>
        <section aria-labelledby="mythic-active-title" class={styles.panel}>
          <h3 id="mythic-active-title" class={styles.caption}>
            {t('mythic.active')}
          </h3>
          <ul class={styles.cards}>
            <For each={active()}>
              {(id) => <ActiveCard id={id} onAnswer={answer} />}
            </For>
          </ul>
        </section>
      </Show>
    </div>
  )
}
