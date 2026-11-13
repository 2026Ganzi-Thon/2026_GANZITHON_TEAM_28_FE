import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_CONFIG } from '../../api/config.js'
import { createGoal } from '../../api/goals.js'
import refreshIcon from '../../assets/icons/refresh.svg'
import Button from '../../components/buttons/Button.jsx'
import ConfirmModal from '../../components/dialogs/ConfirmModal.jsx'
import Chip from '../../components/inputs/Chip.jsx'
import FormErrorMessage from '../../components/inputs/FormErrorMessage.jsx'
import TextArea from '../../components/inputs/TextArea.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import AiLoading from './AiLoading.jsx'
import { BURDEN_OPTIONS, ENERGY_OPTIONS, labelOf } from './options.js'
import styles from './NewGoalPage.module.css'

/**
 * S-03 목표 입력 화면
 * 화면 상태: 'form'(입력) → 'loading'(E-03, 8초 뒤 E-03a) → 성공 시 S-04로 이동
 *                                     └ 실패·15초 초과 → 'error'(E-04 모달, 입력 유지)
 * 버튼: 에너지·부담 칩을 둘 다 골라야 활성. 목표가 비어 있으면 누를 때 E-05 오류.
 */
export default function NewGoalPage() {
  const navigate = useNavigate()
  const ids = { goal: useId(), goalError: useId(), energy: useId(), burden: useId() }
  const goalInputRef = useRef(null)

  const [goal, setGoal] = useState('')
  const [energy, setEnergy] = useState(null)
  const [burden, setBurden] = useState(null)
  const [showGoalError, setShowGoalError] = useState(false)

  const [phase, setPhase] = useState('form') // 'form' | 'loading' | 'error'
  const [slow, setSlow] = useState(false)
  const requestRef = useRef(null) // { controller, timers }

  function stopRequest() {
    const request = requestRef.current
    if (!request) return
    request.timers.forEach(clearTimeout)
    request.controller.abort()
    requestRef.current = null
  }

  // 화면을 떠나면 진행 중인 요청 정리
  useEffect(() => stopRequest, [])

  function startRequest() {
    stopRequest()
    setSlow(false)
    setPhase('loading')

    const controller = new AbortController()
    const timers = [
      setTimeout(() => setSlow(true), APP_CONFIG.aiLoadingSlowMs),
      setTimeout(() => {
        stopRequest()
        setPhase('error')
      }, APP_CONFIG.aiLoadingTimeoutMs),
    ]
    requestRef.current = { controller, timers }

    createGoal({ title: goal.trim(), energy, burden }, { signal: controller.signal })
      .then((created) => {
        if (requestRef.current?.controller !== controller) return
        timers.forEach(clearTimeout)
        requestRef.current = null
        navigate(`/goals/${created.id}/action`, { state: { goal: created } })
      })
      .catch(() => {
        if (controller.signal.aborted) return
        stopRequest()
        setPhase('error')
      })
  }

  function backToForm() {
    stopRequest()
    setPhase('form')
  }

  function handleSubmit() {
    if (goal.trim() === '') {
      setShowGoalError(true)
      goalInputRef.current?.focus()
      return
    }
    startRequest()
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

  if (phase !== 'form') {
    const tags = [
      goal.trim(),
      `에너지 · ${labelOf(ENERGY_OPTIONS, energy)}`,
      `부담 · ${labelOf(BURDEN_OPTIONS, burden)}`,
    ]
    return (
      <div className={styles.page}>
        <AiLoading tags={tags} slow={slow} onCancel={backToForm} />
        {/* E-04: 취소 → 입력 유지한 채 S-03 / 다시 시도 → 로딩 재개 */}
        <ConfirmModal
          open={phase === 'error'}
          icon={<img src={refreshIcon} alt="" />}
          title="앗, 행동을 가져오다 멈췄어요"
          description={'다시 시도할까요?\n입력하신 내용은 그대로 남아 있어요.'}
          secondaryLabel="취소"
          primaryLabel="다시 시도"
          onSecondary={backToForm}
          onPrimary={startRequest}
          onDismiss={backToForm}
        />
      </div>
    )
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
