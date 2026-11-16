import { useId, useState } from 'react'
import { ENERGY_CHANGE_OPTIONS, ENERGY_OPTIONS, shiftEnergy } from '../../api/goalOptions.js'
import checkMutedIcon from '../../assets/icons/check-muted.svg'
import Button from '../../components/buttons/Button.jsx'
import OfflineBanner from '../../components/feedback/OfflineBanner.jsx'
import ChipGroup from '../../components/inputs/ChipGroup.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './StepDoneView.module.css'

/**
 * 걸음을 마친 뒤 화면 3가지 (같은 레이아웃)
 * - kind 'done'   : S-04-3 걸음 완료 · 다음 걸음
 * - kind 'wrapUp' : S-04-3a 목표 마무리 제안 (3걸음 이상, 목표당 1번)
 * - kind 'resume' : S-04-3b 다시 이어가기 (24시간 지나 tried가 된 걸음)
 */
export default function StepDoneView({
  kind,
  goal,
  step,
  doneCount,
  offline,
  retrying,
  onBack,
  onNext,
  onRetry,
  onHome,
  onEndGoal,
  onWrapUpFinish,
  onWrapUpMore,
}) {
  const energyTitleId = useId()
  // S-04-3은 '그대로예요'가 기본, S-04-3b는 지난번 에너지를 미리 고름
  const [energyChange, setEnergyChange] = useState('same')
  const [energy, setEnergy] = useState(goal.energy)

  const actionText = step.action.replace(/\s*\n\s*/g, ' ')
  const content = {
    done: {
      topTitle: '걸음 완료',
      chip: `해봤어요 · ${actionText}`,
      title: '좋아요,\n다음 걸음도 이어가 볼까요?',
      description: '방금의 1mm가 오늘을 조금 바꿨어요.\n이어가지 않아도 충분히 잘했어요.',
    },
    wrapUp: {
      topTitle: '걸음 완료',
      chip: `해봤어요 · ${actionText}`,
      title: `${goal.title},\n거의 다 온 것 같아요`,
      description: `지금까지 ${doneCount}걸음을 내디뎠어요.\n여기서 마무리해도, 한 걸음 더 해도 모두 좋아요.`,
    },
    resume: {
      topTitle: '다시 이어가기',
      chip: `시도했어요 · ${actionText}`,
      title: '다시 와줘서\n반가워요',
      description: '어제 걸음은 시도한 걸음으로 남겨뒀어요.\n오늘 에너지에 맞춰 새 걸음을 찾아볼게요.',
    },
  }[kind]

  function handleNext() {
    onNext(kind === 'resume' ? energy : shiftEnergy(goal.energy, energyChange))
  }

  return (
    <div className={styles.page}>
      <TopBar title={content.topTitle} onBack={onBack} />
      {offline && <OfflineBanner />}

      <div className={[styles.content, kind === 'resume' && styles.contentCompact].filter(Boolean).join(' ')}>
        <p className={styles.doneChip}>
          <img className={styles.doneIcon} src={checkMutedIcon} alt="" />
          <span className={styles.doneText}>{content.chip}</span>
        </p>

        <div className={styles.header}>
          <h2 className={styles.title}>{content.title}</h2>
          <p className={styles.description}>{content.description}</p>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressHead}>
            <p className={styles.progressTitle}>{goal.title}</p>
            <p className={styles.progressCount}>지금까지 {doneCount}걸음</p>
          </div>
          {kind !== 'wrapUp' && (
            <button type="button" className={styles.link} onClick={onEndGoal}>
              이 목표는 여기서 마무리할래요
            </button>
          )}
        </div>

        {kind !== 'wrapUp' && (
          <section className={styles.energy}>
            <div className={styles.question}>
              <h3 id={energyTitleId} className={styles.questionTitle}>
                {kind === 'resume' ? '오늘 에너지는 어때요?' : '지금 에너지는 어때요?'}
              </h3>
              <p className={styles.questionHint}>
                {kind === 'resume'
                  ? '하루가 지나서 처음부터 다시 여쭤볼게요'
                  : '달라졌다면 다음 걸음의 크기를 맞춰드릴게요'}
              </p>
            </div>
            {kind === 'resume' ? (
              <ChipGroup labelledBy={energyTitleId} options={ENERGY_OPTIONS} value={energy} onChange={setEnergy} />
            ) : (
              <ChipGroup
                labelledBy={energyTitleId}
                options={ENERGY_CHANGE_OPTIONS}
                value={energyChange}
                onChange={setEnergyChange}
              />
            )}
          </section>
        )}
      </div>

      <div className={[styles.bottom, kind === 'resume' && styles.bottomCompact].filter(Boolean).join(' ')}>
        {kind === 'done' && (
          <>
            <Button onClick={handleNext}>다음 걸음 받기</Button>
            <Button variant="text" className={styles.textButton} onClick={onHome}>
              오늘은 여기까지 할래요
            </Button>
          </>
        )}
        {kind === 'wrapUp' && (
          <>
            <Button onClick={onWrapUpFinish}>목표 마무리하기</Button>
            <Button variant="text" className={styles.textButton} onClick={onWrapUpMore}>
              한 걸음 더 해볼래요
            </Button>
          </>
        )}
        {kind === 'resume' && (
          <>
            <Button onClick={handleNext}>새 걸음 받기</Button>
            <Button variant="secondary" loading={retrying} onClick={onRetry}>
              어제 걸음 그대로 해보기
            </Button>
            <Button variant="text" className={styles.textButton} onClick={onHome}>
              오늘은 쉬어갈래요
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
