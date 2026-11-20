import { BEING_BY_ID } from '../model/mythic/catalog'
import { MEGAWEAPONS } from '../model/war/catalog'
import { fallenSide } from '../model/world/war'
import type { War } from '../model/world/types'
import { pick, t } from './i18n'

/** 한쪽 편의 신적 존재(결투에 졌으면 표시)와 대형 병기: '수르트 · 전쟁 거신병' */
function sideText(war: War, side: 'a' | 'b', year: number): string {
  const beingId = side === 'a' ? war.aBeing : war.bBeing
  const weaponId = side === 'a' ? war.aWeapon : war.bWeapon
  const parts: string[] = []
  if (beingId) {
    const name = pick(BEING_BY_ID[beingId].name)
    parts.push(
      fallenSide(war, year) === side ? `${name} (${t('war.fallen')})` : name,
    )
  }
  if (weaponId) parts.push(pick(MEGAWEAPONS[weaponId].name))
  return parts.join(' · ') || '—'
}

/** 두 편의 신적 존재·대형 병기 한 줄 (아무것도 없으면 null) */
export function championsLine(war: War, year: number): string | null {
  if (!war.aBeing && !war.bBeing && !war.aWeapon && !war.bWeapon) return null
  return t('war.vs', {
    a: sideText(war, 'a', year),
    b: sideText(war, 'b', year),
  })
}
