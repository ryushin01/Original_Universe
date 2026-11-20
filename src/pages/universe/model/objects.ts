import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'
import { BODIES, BODY_IDS } from './solar/bodies'
import type { BodyId } from './solar/bodies'
import { STARS } from './stars/catalog'
import { GALAXY_OBJECTS } from './galaxy/catalog'
import { LOCAL_GALAXIES } from './local/catalog'
import { COSMIC_STRUCTURES } from './cosmic/catalog'
import type { ScaleId } from './view'
import { BEING_BY_ID } from './mythic/catalog'
import { FACTION_BY_ID } from './war/catalog'
import type { FactionId } from './war/catalog'

export interface SceneObject {
  id: string
  name: Text
}

const SUN: SceneObject = { id: 'sun', name: both('태양', 'Sun') }

const ALL: Record<ScaleId, SceneObject[]> = {
  solar: BODY_IDS.map((id) => ({ id, name: BODIES[id].name })),
  stars: [SUN, ...STARS.map((s) => ({ id: s.id, name: s.name }))],
  galaxy: GALAXY_OBJECTS.map((o) => ({ id: o.id, name: o.name })),
  local: LOCAL_GALAXIES.map((g) => ({ id: g.id, name: g.name })),
  cosmic: COSMIC_STRUCTURES.map((s) => ({ id: s.id, name: s.name })),
}

const STRIP: Record<ScaleId, string[]> = {
  solar: [
    'sun',
    'mercury',
    'venus',
    'earth',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'ceres',
    'halley',
    'apophis',
  ] satisfies BodyId[],
  stars: [
    'sun',
    'alpha-centauri',
    'proxima',
    'barnard',
    'sirius',
    'epsilon-eridani',
    'tau-ceti',
    'vega',
    'arcturus',
    'trappist1',
    'gliese710',
    'betelgeuse',
    'rigel',
  ],
  galaxy: GALAXY_OBJECTS.map((o) => o.id),
  local: [
    'milky-way',
    'andromeda',
    'triangulum',
    'lmc',
    'smc',
    'm32',
    'm110',
    'ngc6822',
    'ic1613',
    'ic10',
    'sagittarius-dsph',
    'fornax',
  ],
  cosmic: [
    'local-group',
    'virgo-cluster',
    'local-void',
    'laniakea',
    'great-attractor',
    'perseus-pisces',
    'coma-cluster',
    'shapley',
    'bootes-void',
    'sloan-great-wall',
    'hcb-great-wall',
    'cmb',
  ],
}

export const objectsOf = (scale: ScaleId) => ALL[scale]

export function destinationsOf(scale: ScaleId): SceneObject[] {
  const byId = new Map(ALL[scale].map((o) => [o.id, o]))
  return STRIP[scale]
    .map((id) => byId.get(id))
    .filter((o): o is SceneObject => Boolean(o))
}

export const objectName = (scale: ScaleId, id: string): Text | undefined =>
  ALL[scale].find((o) => o.id === id)?.name

/** 3D에서 고르는 우주적 존재의 id (`being:<존재 id>`) */
export const BEING_PREFIX = 'being:'
export const beingSceneId = (beingId: string) => `${BEING_PREFIX}${beingId}`
export const beingIdOf = (sceneId: string): string | null =>
  sceneId.startsWith(BEING_PREFIX) ? sceneId.slice(BEING_PREFIX.length) : null

const beingObjects = new Map<string, SceneObject>()

/** 우주적 존재의 이름표 대상 (같은 존재는 같은 객체라 이름표 DOM을 다시 만들지 않음) */
export function beingObject(beingId: string): SceneObject {
  let object = beingObjects.get(beingId)
  if (!object) {
    object = {
      id: beingSceneId(beingId),
      name: BEING_BY_ID[beingId].name,
    }
    beingObjects.set(beingId, object)
  }
  return object
}

/** 3D에서 고르는 우주 대전의 id (`war:<전쟁 번호>`) */
export const WAR_PREFIX = 'war:'
export const warSceneId = (warId: number) => `${WAR_PREFIX}${warId}`
export const warIdOf = (sceneId: string): number | null =>
  sceneId.startsWith(WAR_PREFIX)
    ? Number(sceneId.slice(WAR_PREFIX.length))
    : null

const warObjects = new Map<number, SceneObject>()

/** 우주 대전의 이름표 대상: '연방 대 제국' */
export function warObject(war: {
  id: number
  a: FactionId
  b: FactionId
}): SceneObject {
  let object = warObjects.get(war.id)
  if (!object) {
    const a = FACTION_BY_ID[war.a].short
    const b = FACTION_BY_ID[war.b].short
    object = {
      id: warSceneId(war.id),
      name: both(`${a.ko} 대 ${b.ko}`, `${a.en} vs ${b.en}`),
    }
    warObjects.set(war.id, object)
  }
  return object
}
