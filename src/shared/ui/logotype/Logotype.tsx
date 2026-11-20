import { cn } from '@/shared/lib'
import { LOGOTYPE_HEIGHT, LOGOTYPE_PATH, LOGOTYPE_WIDTH } from './paths'
import styles from './Logotype.module.css'

interface LogotypeProps {
  /** 접근 가능한 이름 (기본: Original Universe) */
  label?: string
  /** 곁에 같은 이름의 글자가 있을 때: 보조 기술에서 숨김 */
  decorative?: boolean
  /** 처음 나타날 때 왼쪽부터 써 내려가듯 드러냄 (움직임 줄이기에서는 바로 보임) */
  write?: boolean
  class?: string
}

/** 필기체 로고: 'Original Universe' 글자 윤곽을 그린 그림 (scripts/build-logotype.mjs) */
export function Logotype(props: LogotypeProps) {
  return (
    <svg
      role={props.decorative ? undefined : 'img'}
      aria-label={
        props.decorative ? undefined : (props.label ?? 'Original Universe')
      }
      aria-hidden={props.decorative ? 'true' : undefined}
      viewBox={`0 0 ${LOGOTYPE_WIDTH} ${LOGOTYPE_HEIGHT}`}
      class={cn(styles.logotype, props.write && styles.write, props.class)}
    >
      <path d={LOGOTYPE_PATH} fill="currentColor" />
    </svg>
  )
}
