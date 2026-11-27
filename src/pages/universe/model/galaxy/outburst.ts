import { both } from '@/shared/i18n'
import type { Text } from '@/shared/i18n'
import type { OutburstType } from './catalog'

/** 폭발 유형 이름 (정보 카드에서만 써서 3D 워커에 싣지 않음) */
export const OUTBURST_TYPE_NAME: Record<OutburstType, Text> = {
  snIa: both(
    'Ia형 초신성 (백색 왜성 폭발)',
    'Type Ia supernova (white-dwarf explosion)',
  ),
  snII: both('II형 초신성 (중력 붕괴)', 'Type II supernova (core collapse)'),
  snIIb: both('IIb형 초신성 (중력 붕괴)', 'Type IIb supernova (core collapse)'),
  snCore: both('중력 붕괴 초신성', 'Core-collapse supernova'),
  classicalNova: both('고전 신성', 'Classical nova'),
  recurrentNova: both('반복 신성', 'Recurrent nova'),
}
