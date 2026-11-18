import { useId, useState } from 'react'
import { ENERGY_CHANGE_OPTIONS, shiftEnergy } from '../../api/goalOptions.js'
import checkMutedIcon from '../../assets/icons/check-muted.svg'
import Button from '../../components/buttons/Button.jsx'
import OfflineBanner from '../../components/feedback/OfflineBanner.jsx'
import ChipGroup from '../../components/inputs/ChipGroup.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './StepDoneView.module.css'

/**
 * 걸음을 마친 뒤 화면 (같은 레이아웃)
 * - kind 'done'   : S-04-3 걸음 완료 · 다음 걸음 (= 백엔드 '오늘은 여기까지' 상태)
 * - kind 'wrapUp' : S-04-3a 목표 마무리 제안 (백엔드가 [해봤어요] 응답에 isLastStep으로 알려줌)
 * - lastAction: 방금 해본 행동 — 새로고침 등으로 모르면 칩을 숨김
 * - 다음 걸음 에너지: 목표를 만들 때 고른 에너지 기준 ±1 (그대로예요 / 조금 생겼어요 / 더 지쳤어요)
 */
export default function StepDoneView({ kind, goal, lastAction, doneCount, offline, onBack, onNext, onHome, onEndGoal, onWrapUpFinish, onWrapUpMore }) {
  const energyTitleId = useId()
  const [energyChange, setEnergyChange] = useState('same')

  const content = {
    done: {
      title: '좋아요,\n다음 걸음도 이어가 볼까요?',
      description: '방금의 1mm가 오늘을 조금 바꿨어요.\n이어가지 않아도 충분히 잘했어요.',
    },
    wrapUp: {
      title: `${goal.title},\n거의 다 온 것 같아요`,
      description: `지금까지 ${doneCount}걸음을 내디뎠어요.\n여기서 마무리해도, 한 걸음 더 해도 모두 좋아요.`,
    },
  }[kind]

  return (
    <div className={styles.page}>
      <TopBar title="걸음 완료" onBack={onBack} />
      {offline && <OfflineBanner />}

      <div className={styles.content}>
        {lastAction && (
          <p className={styles.doneChip}>
            <img className={styles.doneIcon} src={checkMutedIcon} alt="" />
            <span className={styles.doneText}>해봤어요 · {lastAction.replace(/\s*\n\s*/g, ' ')}</span>
          </p>
        )}

        <div className={styles.header}>
          <h2 className={styles.title}>{content.title}</h2>
          <p className={styles.description}>{content.description}</p>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressHead}>
            <p className={styles.progressTitle}>{goal.title}</p>
            <p className={styles.progressCount}>지금까지 {doneCount}걸음</p>
          </div>
          {kind === 'done' && (
            <button type="button" className={styles.link} onClick={onEndGoal}>
              이 목표는 여기서 마무리할래요
            </button>
          )}
        </div>

        {kind === 'done' && (
          <section className={styles.energy}>
            <div className={styles.question}>
              <h3 id={energyTitleId} className={styles.questionTitle}>
                지금 에너지는 어때요?
              </h3>
              <p className={styles.questionHint}>달라졌다면 다음 걸음의 크기를 맞춰드릴게요</p>
            </div>
            <ChipGroup labelledBy={energyTitleId} options={ENERGY_CHANGE_OPTIONS} value={energyChange} onChange={setEnergyChange} />
          </section>
        )}
      </div>

      <div className={styles.bottom}>
        {kind === 'done' ? (
          <>
            <Button onClick={() => onNext(shiftEnergy(goal.energy, energyChange))}>다음 걸음 받기</Button>
            <Button variant="text" className={styles.textButton} onClick={onHome}>
              오늘은 여기까지 할래요
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onWrapUpFinish}>목표 마무리하기</Button>
            <Button variant="text" className={styles.textButton} onClick={onWrapUpMore}>
              한 걸음 더 해볼래요
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
