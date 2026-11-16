import { ErrorBoundary, onMount } from 'solid-js'
import type { JSX } from 'solid-js'
import { Button } from '@/shared/ui'
import { t } from '../i18n'
import styles from '../panels/panels.module.css'

interface SectionBoundaryProps {
  children: JSX.Element
  /** 영역 이름 (안내에 넣어 영역마다 다른 알림이 되게 함) */
  name: string
  /** 오류 안내를 화면 낭독기에 알림 (빈 문자열이면 지움) */
  onCrash: (message: string) => void
}

/**
 * 패널 한 곳을 그리다 예외가 나도 나머지 화면과 3D는 그대로 두고
 * 그 자리에 안내와 다시 시도 버튼을 보여 줍니다.
 */
export function SectionBoundary(props: SectionBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <SectionError
          error={error}
          name={props.name}
          onCrash={props.onCrash}
          retry={() => {
            props.onCrash('')
            reset()
          }}
        />
      )}
    >
      {props.children}
    </ErrorBoundary>
  )
}

function SectionError(props: {
  error: unknown
  name: string
  onCrash: (message: string) => void
  retry: () => void
}) {
  const message = () => t('page.error', { section: props.name })
  onMount(() => {
    // 원인을 찾을 수 있게 개발자 도구에 남김
    console.error(props.error)
    props.onCrash(message())
  })
  return (
    <div class={styles.card}>
      <p class={styles.danger}>{message()}</p>
      <div>
        <Button size="sm" onClick={() => props.retry()}>
          {t('page.retry')}
        </Button>
      </div>
    </div>
  )
}
