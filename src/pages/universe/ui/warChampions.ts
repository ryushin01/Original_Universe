import { BEING_BY_ID } from '../model/mythic/catalog'
import { MEGAWEAPONS } from '../model/war/catalog'
import { fallenBeings } from '../model/world/war'
import type { War } from '../model/world/types'
import { pick, t } from './i18n'

/** 한쪽 편의 신적 존재들(결투에 졌으면 표시)과 대형 병기: '수르트 · 오딘 (쓰러짐) · 전쟁 거신병' */
function sideText(war: War, side: 'a' | 'b', fallen: Set<string>): string {
  const beings = side === 'a' ? war.aBeings : war.bBeings
  const weaponId = side === 'a' ? war.aWeapon : war.bWeapon
  const parts = beings.map((id) => {
    const name = pick(BEING_BY_ID[id].name)
    return fallen.has(id) ? `${name} (${t('war.fallen')})` : name
  })
  if (weaponId) parts.push(pick(MEGAWEAPONS[weaponId].name))
  return parts.join(' · ') || '—'
}

/** 두 편의 신적 존재·대형 병기 한 줄 (아무것도 없으면 null) */
export function championsLine(war: War, year: number): string | null {
  if (
    !war.aBeings.length &&
    !war.bBeings.length &&
    !war.aWeapon &&
    !war.bWeapon
  )
    return null
  const fallen = fallenBeings(war, year)
  return t('war.vs', {
    a: sideText(war, 'a', fallen),
    b: sideText(war, 'b', fallen),
  })
}
