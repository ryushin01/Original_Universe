/** 싸움터(우주적 존재의 격돌·우주 대전)의 장면 위치와 크기 */
import { Vector3 } from 'three'
import type { BodyId } from '../../../model/solar/bodies'
import { bodyVisualRadius, sceneDistance } from '../../../model/solar/scale'
import type { DistanceMode } from '../../../model/solar/scale'
import type { SiteId } from '../../../model/mythic/catalog'
import { raDecToScene } from '../common'

/** 싸움터의 그림 크기 배율 (태양만 하게, 멀리 있는 싸움터는 크게 보이게) */
export const SITE_SCALE: Record<SiteId, number> = {
  sun: 1,
  earth: 1,
  mars: 1,
  jupiter: 1,
  kuiper: 2.6,
  deep: 120,
}

/** 은하 중심 방향 (궁수자리 A*) */
export const GALACTIC_CENTRE = raDecToScene(266.4, -28.9)

export interface SiteAnchors {
  positions: Map<BodyId, Vector3>
  sunRadius: number
  mode: DistanceMode
}

/** 싸움터의 가운데 (천체 곁이면 그 천체 바깥쪽 위) */
export function siteCenter(site: SiteId, anchors: SiteAnchors): Vector3 {
  const near = (id: BodyId) => {
    const p = anchors.positions.get(id)
    if (!p) return null
    const out = p.clone().normalize()
    return p
      .clone()
      .add(out.multiplyScalar(bodyVisualRadius(id) * 3 + 2.6))
      .add(new Vector3(0, 0.9, 0))
  }
  switch (site) {
    case 'sun':
      return new Vector3(Math.cos(3.5), 0.25, Math.sin(3.5))
        .normalize()
        .multiplyScalar(anchors.sunRadius * 1.6 + 3.6)
    case 'earth':
    case 'mars':
    case 'jupiter':
      return near(site) ?? new Vector3(0, 6, 0)
    case 'kuiper':
      return new Vector3(Math.cos(2.1), 0.12, Math.sin(2.1))
        .normalize()
        .multiplyScalar(sceneDistance(45, anchors.mode))
    case 'deep':
      return GALACTIC_CENTRE.clone().multiplyScalar(2600)
  }
}
