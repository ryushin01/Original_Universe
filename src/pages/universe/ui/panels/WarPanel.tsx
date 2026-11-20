import { For, Show, createMemo, createSignal } from 'solid-js'
import { locale } from '@/shared/i18n'
import { Button, ChoiceGroup, SelectField, StatusMessage } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import { formatPercent } from '@/shared/lib'
import { SITES, SITE_BY_ID } from '../../model/mythic/catalog'
import type { SiteId } from '../../model/mythic/catalog'
import {
  FACTIONS,
  FACTION_BY_ID,
  FLEET_SIZES,
  FLEET_SIZE_IDS,
  MOTIFS,
  SPECIALS,
  WEAPONS,
  fleetOf,
  fleetPower,
} from '../../model/war/catalog'
import type { Faction, FactionId, FleetSize } from '../../model/war/catalog'
import { specialApplies, warDays, warOdds } from '../../model/war/combat'
import { viewActions } from '../../model/view'
import { warSceneId } from '../../model/objects'
import { world, worldActions } from '../../model/world/store'
import {
  hasSpecial,
  ragingWars,
  superweaponTargets,
  warMotifs,
  warStrength,
  warSupport,
} from '../../model/world/war'
import { formatDuration } from '../../model/world/text'
import { bothNames, createActionMessage, pick, t } from '../i18n'
import { BODIES } from '../../model/solar/bodies'
import styles from './panels.module.css'

const factionOptions = (): SelectOption[] =>
  FACTIONS.map((f) => ({ value: f.id, label: pick(f.name) }))

/** '우주항공모함 2 · 우주전함 4 · …' */
const fleetText = (faction: Faction, size: FleetSize) =>
  fleetOf(faction, size)
    .map((x) => `${pick(x.cls.name)} ${x.count}`)
    .join(' · ')

/** 진행 중인 우주 대전 카드: 두 세력의 남은 전력과 끝나기까지 남은 시간 */
function ActiveWar(props: { id: number }) {
  const l = locale
  const war = () => world().wars.find((w) => w.id === props.id)
  return (
    <Show when={war()}>
      {(w) => {
        const a = () => FACTION_BY_ID[w().a]
        const b = () => FACTION_BY_ID[w().b]
        const strength = () => warStrength(w(), world().year)
        const meter = (value: number, color: string) => (
          <div class={styles.meter} aria-hidden="true">
            <span
              style={{
                width: `${Math.min(1, value) * 100}%`,
                'background-color': color,
              }}
            />
          </div>
        )
        return (
          <li class={styles.card}>
            <div class={styles.cardHead}>
              <span class={styles.cardTitle}>
                {t('war.vs', { a: pick(a().name), b: pick(b().name) })}
              </span>
              <span class={styles.tag}>{pick(FLEET_SIZES[w().size].name)}</span>
            </div>
            <p class={styles.small}>
              {t('war.left', {
                site: pick(SITE_BY_ID[w().site].name),
                time: formatDuration(
                  Math.max(0, w().endYear - world().year),
                  l(),
                ),
              })}
            </p>
            <p class={styles.small}>
              {t('war.strength', {
                name: pick(a().name),
                percent: formatPercent(strength().a, l()),
              })}
            </p>
            {meter(strength().a, a().color)}
            <p class={styles.small}>
              {t('war.strength', {
                name: pick(b().name),
                percent: formatPercent(strength().b, l()),
              })}
            </p>
            {meter(strength().b, b().color)}
            <div class={styles.row}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  viewActions.selectIn('solar', warSceneId(w().id))
                }
              >
                {t('war.follow')}
              </Button>
            </div>
          </li>
        )
      }}
    </Show>
  )
}

/** 우주 대전 (스페이스 오페라 모드): 두 세력·함대 규모·전장을 고르고 개전 */
export function WarPanel() {
  const l = locale
  const [aId, setAId] = createSignal<FactionId>('axis')
  const [bId, setBId] = createSignal<FactionId>('alliance')
  const [size, setSize] = createSignal<FleetSize>('fleet')
  const [site, setSite] = createSignal<SiteId>('earth')
  const [target, setTarget] = createSignal('')
  const feedback = createActionMessage()

  const a = () => FACTION_BY_ID[aId()]
  const b = () => FACTION_BY_ID[bId()]
  const support = () => warSupport(world(), site())
  const odds = createMemo(() => warOdds(aId(), bId(), size(), support()))
  const killer = () =>
    hasSpecial(aId(), 'planet-killer') || hasSpecial(bId(), 'planet-killer')
  const targets = () => superweaponTargets(world(), site())
  /** 전장을 바꾸면 그 전장에 없는 표적은 비움 */
  const chosenTarget = () =>
    targets().includes(target() as never) ? target() : ''

  const chooseA = (id: string) => {
    setAId(id as FactionId)
    if (id === bId()) setBId(FACTIONS.find((f) => f.id !== id)!.id)
  }
  const chooseB = (id: string) => {
    setBId(id as FactionId)
    if (id === aId()) setAId(FACTIONS.find((f) => f.id !== id)!.id)
  }

  const specialsText = (faction: Faction) =>
    faction.specials
      .filter((id) => specialApplies(id, support()))
      .map((id) => pick(SPECIALS[id].name))
      .join(' · ') || '—'

  const declare = () =>
    feedback.report(
      worldActions.declareWar({
        a: aId(),
        b: bId(),
        site: site(),
        size: size(),
        target: killer() && chosenTarget() ? chosenTarget() : null,
      }),
    )

  const motifs = () => warMotifs(aId(), bId())

  return (
    <div class={styles.panel}>
      <p class={styles.intro}>{t('war.intro')}</p>
      <SelectField
        label={t('war.a')}
        value={aId()}
        onChange={chooseA}
        options={factionOptions()}
        description={pick(a().summary)}
      />
      <SelectField
        label={t('war.b')}
        value={bId()}
        onChange={chooseB}
        options={factionOptions().filter((o) => o.value !== aId())}
        description={pick(b().summary)}
      />
      <ChoiceGroup<FleetSize>
        legend={t('war.size')}
        value={size()}
        onChange={setSize}
        columns={2}
        choices={FLEET_SIZE_IDS.map((id) => ({
          value: id,
          label: pick(FLEET_SIZES[id].name),
        }))}
      />
      <ChoiceGroup<SiteId>
        legend={t('war.site')}
        value={site()}
        onChange={setSite}
        columns={2}
        choices={SITES.map((s) => ({ value: s.id, label: pick(s.name) }))}
      />
      <Show when={killer() && targets().length > 0}>
        <SelectField
          label={t('war.target')}
          value={chosenTarget()}
          onChange={setTarget}
          options={[
            { value: '', label: t('war.noTarget') },
            ...targets().map((id) => ({
              value: id,
              label: bothNames(BODIES[id].name),
            })),
          ]}
          description={t('war.targetHint')}
        />
      </Show>
      <dl class={styles.preview}>
        <dt>{t('war.power')}</dt>
        <dd>
          {t('war.vs', {
            a: `${pick(a().name)} ${Math.round(fleetPower(a(), size()))}`,
            b: `${pick(b().name)} ${Math.round(fleetPower(b(), size()))}`,
          })}
        </dd>
        <dt>{t('war.fleet')}</dt>
        <dd>
          {fleetText(a(), size())}
          <br />
          {fleetText(b(), size())}
        </dd>
        <dt>{t('war.weapons')}</dt>
        <dd>
          {t('war.vs', {
            a: pick(WEAPONS[a().weapon].name),
            b: pick(WEAPONS[b().weapon].name),
          })}
        </dd>
        <dt>{t('war.specials')}</dt>
        <dd>
          {specialsText(a())}
          <br />
          {specialsText(b())}
        </dd>
        <dt>{t('war.support')}</dt>
        <dd>
          {t('war.supportValue', {
            count: support().megastructures,
            colonies: support().colonies ? t('war.yes') : t('war.no'),
          })}
        </dd>
        <dt>{t('war.odds')}</dt>
        <dd>
          {t('war.oddsValue', {
            name: pick(a().name),
            percent: formatPercent(odds(), l()),
          })}
        </dd>
        <dt>{t('war.duration')}</dt>
        <dd>
          {formatDuration(
            warDays(fleetPower(a(), size()) + fleetPower(b(), size())) / 365.25,
            l(),
          )}
        </dd>
      </dl>
      <section aria-labelledby="war-motifs-title" class={styles.panel}>
        <h3 id="war-motifs-title" class={styles.caption}>
          {t('war.motifs', { count: motifs().length })}
        </h3>
        <ul class={styles.chips}>
          <For each={motifs()}>{(id) => <li>{pick(MOTIFS[id])}</li>}</For>
        </ul>
      </section>
      <Button variant="danger" onClick={declare}>
        {t('war.declare')}
      </Button>
      <StatusMessage message={feedback.message()} tone={feedback.tone()} />
      <Show when={ragingWars(world()).length > 0}>
        <section aria-labelledby="war-active-title" class={styles.panel}>
          <h3 id="war-active-title" class={styles.caption}>
            {t('war.active')}
          </h3>
          <ul class={styles.cards}>
            <For each={ragingWars(world()).map((w) => w.id)}>
              {(id) => <ActiveWar id={id} />}
            </For>
          </ul>
        </section>
      </Show>
    </div>
  )
}
