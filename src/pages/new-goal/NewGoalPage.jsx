import { useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_CONFIG } from '../../api/config.js'
import { BURDEN_OPTIONS, ENERGY_OPTIONS, summaryTags } from '../../api/goalOptions.js'
import { createGoal } from '../../api/goals.js'
import Button from '../../components/buttons/Button.jsx'
import AiLoading from '../../components/feedback/AiLoading.jsx'
import { useAiRequest } from '../../components/feedback/useAiRequest.js'
import Chip from '../../components/inputs/Chip.jsx'
import FormErrorMessage from '../../components/inputs/FormErrorMessage.jsx'
import TextArea from '../../components/inputs/TextArea.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './NewGoalPage.module.css'

/**
 * S-03 목표 입력 화면
 * 입력 → AI 로딩(E-03, 8초 뒤 E-03a) → 성공 시 S-04로 이동
 *                └ 실패·15초 초과 → E-04 모달 (취소하면 입력 유지)
 * 버튼: 에너지·부담 칩을 둘 다 골라야 활성. 목표가 비어 있으면 누를 때 E-05 오류.
 */
export default function NewGoalPage() {
  const navigate = useNavigate()
  const ai = useAiRequest()
  const ids = { goal: useId(), goalError: useId(), energy: useId(), burden: useId() }
  const goalInputRef = useRef(null)

  const [goal, setGoal] = useState('')
  const [energy, setEnergy] = useState(null)
  const [burden, setBurden] = useState(null)
  const [showGoalError, setShowGoalError] = useState(false)

  function handleSubmit() {
    if (goal.trim() === '') {
      setShowGoalError(true)
      goalInputRef.current?.focus()
      return
    }
    const input = { title: goal.trim(), energy, burden }
    ai.run(
      (signal) => createGoal(input, { signal }),
      (created) => navigate(`/goals/${created.id}/action`, { replace: true }),
    )
  }

  function handleGoalChange(next) {
    setGoal(next)
    setShowGoalError(false)
  }

  function handleBack() {
    // 앱 안에서 들어왔으면 뒤로, 주소로 바로 들어왔으면 홈으로
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  if (ai.state !== 'idle') {
    return <AiLoading ai={ai} tags={summaryTags({ title: goal.trim(), energy, burden })} />
  }

  return (
    <div className={styles.page}>
      <TopBar title="새 목표" onBack={handleBack} />

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.question}>
            <label htmlFor={ids.goal} className={styles.questionTitle}>
              어떤 일을 해보고 싶으세요?
            </label>
            <p className={styles.questionHint}>작고 사소한 일이어도 괜찮아요</p>
          </div>
          <TextArea
            ref={goalInputRef}
            id={ids.goal}
            value={goal}
            onChange={handleGoalChange}
            maxChars={APP_CONFIG.goalMaxChars}
            placeholder="예) 방 청소하기, 과제 시작하기"
            error={showGoalError}
            describedBy={showGoalError ? ids.goalError : undefined}
          />
          {showGoalError && (
            <FormErrorMessage id={ids.goalError}>현재 어떤 목표를 하고 싶은지 알려주세요</FormErrorMessage>
          )}
        </section>

        <ChipQuestion
          id={ids.energy}
          title="지금 에너지는 어느 정도인가요?"
          hint="정답은 없어요. 느껴지는 그대로 골라주세요"
          options={ENERGY_OPTIONS}
          value={energy}
          onChange={setEnergy}
        />

        <ChipQuestion
          id={ids.burden}
          title="이 일이 얼마나 부담스럽게 느껴지나요?"
          hint="솔직하게 골라주실수록 더 작게 쪼개드릴게요"
          options={BURDEN_OPTIONS}
          value={burden}
          onChange={setBurden}
        />
      </div>

      <div className={styles.bottom}>
        <p className={styles.bottomHint}>마음이 바뀌면 언제든 다시 고를 수 있어요</p>
        <Button disabled={!energy || !burden} onClick={handleSubmit}>
          AI에게 행동 추천받기
        </Button>
      </div>
    </div>
  )
}

/** 질문 제목 + 단일 선택 칩 묶음 */
function ChipQuestion({ id, title, hint, options, value, onChange }) {
  return (
    <section className={styles.section} role="group" aria-labelledby={id}>
      <div className={styles.question}>
        <h2 id={id} className={styles.questionTitle}>
          {title}
        </h2>
        <p className={styles.questionHint}>{hint}</p>
      </div>
      <div className={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </section>
  )
}
