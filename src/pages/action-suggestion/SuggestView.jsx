import dotIcon from '../../assets/icons/dot.svg'
import sparkleIcon from '../../assets/icons/sparkle.svg'
import Button from '../../components/buttons/Button.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './SuggestView.module.css'

// 걸음 상태별 위쪽 라벨 (피그마 S-04 / S-04-1 / S-04-2)
const LABELS = {
  default: '지금 할 수 있는 아주 작은 행동',
  smaller: '조금 더 작게 바꿔봤어요',
  smallest: '이게 지금 찾은 가장 작은 걸음이에요',
}

/**
 * S-04 AI 행동 제안 (+ S-04-1 더 작게 바꾼 행동, S-04-2 가장 작은 걸음 도달)
 * - 버튼: 해봤어요(Primary) > 더 작게(Secondary) > 쉬어가기(Text)
 * - S-04-2에서는 [더 작게] 비활성
 */
export default function SuggestView({ goal, step, doneCount, completing, onBack, onDone, onSmaller, onPause }) {
  const variant = step.smallestReached ? 'smallest' : step.smallerCount > 0 ? 'smaller' : 'default'

  return (
    <div className={styles.page}>
      <TopBar title={`${doneCount + 1}번째 걸음`} onBack={onBack} />

      <div className={styles.goal}>
        <p className={styles.goalLabel}>현재 목표</p>
        <p className={styles.pill}>
          <img className={styles.dot} src={dotIcon} alt="" />
          <span className={styles.pillText}>{goal.title}</span>
        </p>
      </div>

      <div className={styles.content} aria-live="polite">
        <p className={styles.label}>{LABELS[variant]}</p>
        <h2 className={styles.action}>{step.action}</h2>
        <p className={styles.description}>{step.description}</p>
        <div className={styles.reason}>
          <img className={styles.reasonIcon} src={sparkleIcon} alt="" />
          <p className={styles.reasonText}>{step.reason}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <Button loading={completing} onClick={onDone}>
          해봤어요
        </Button>
        <Button variant="secondary" disabled={step.smallestReached} onClick={onSmaller}>
          더 작게
        </Button>
        <Button variant="text" className={styles.textButton} onClick={onPause}>
          쉬어가기
        </Button>
      </div>
    </div>
  )
}
