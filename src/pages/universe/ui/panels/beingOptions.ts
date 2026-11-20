import type { SelectOption } from '@/shared/ui'
import { BEINGS, GROUP_NAME } from '../../model/mythic/catalog'
import { bothNames, pick } from '../i18n'

/** 우주적 존재를 고르는 목록: 진영·지역별 묶음 (exclude는 뺄 존재) */
export const beingOptions = (exclude?: string): SelectOption[] =>
  BEINGS.filter((b) => b.id !== exclude).map((b) => ({
    value: b.id,
    label: bothNames(b.name),
    group: pick(GROUP_NAME[b.group]),
  }))
