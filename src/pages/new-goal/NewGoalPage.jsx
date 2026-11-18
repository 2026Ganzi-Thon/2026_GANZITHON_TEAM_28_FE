import { useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { APP_CONFIG } from '../../api/config.js'
import { BURDEN_OPTIONS, ENERGY_OPTIONS, summaryTags } from '../../api/goalOptions.js'
import { createGoal, getGoalLimit } from '../../api/goals.js'
import layersIcon from '../../assets/icons/layers.svg'
import Button from '../../components/buttons/Button.jsx'
import ConfirmModal from '../../components/dialogs/ConfirmModal.jsx'
import AiLoading from '../../components/feedback/AiLoading.jsx'
import OfflineBanner from '../../components/feedback/OfflineBanner.jsx'
import { useAiRequest } from '../../components/feedback/useAiRequest.js'
import { useOnlineStatus } from '../../components/feedback/useOnlineStatus.js'
import ChipGroup from '../../components/inputs/ChipGroup.jsx'
import FormErrorMessage from '../../components/inputs/FormErrorMessage.jsx'
import TextArea from '../../components/inputs/TextArea.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './NewGoalPage.module.css'

/**
 * S-03 목표 입력 화면
 * 입력 → AI 로딩(E-03, 8초 뒤 E-03a) → 성공 시 S-04로 이동
 *                └ 실패·15초 초과 → E-04 모달 (취소하면 입력 유지)
 * 버튼: 에너지·부담 칩을 둘 다 골라야 활성. 목표가 비어 있으면 누를 때 E-05 오류.
 * O-02: 오프라인이면 배너 + [추천받기] 비활성 (입력 내용은 유지)
 * 홈 E-01 '예시 목표로 가볍게 시작하기'로 들어오면 목표 칸을 미리 채움 (state.exampleGoal)
 * 위기 신호 응답(CRISIS200)이면 S-08(/support)로
 * 진행 중인 목표가 이미 최대 개수면 추천받기 대신 G-04 안내 (주소로 바로 들어온 경우 대비)
 */
export default function NewGoalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const ai = useAiRequest()
  const online = useOnlineStatus()
  const ids = { goal: useId(), goalError: useId(), energy: useId(), burden: useId() }
  const goalInputRef = useRef(null)

  const [goal, setGoal] = useState(() => location.state?.exampleGoal ?? '')
  const [energy, setEnergy] = useState(null)
  const [burden, setBurden] = useState(null)
  const [showGoalError, setShowGoalError] = useState(false)
  const [limitOpen, setLimitOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const [maxCount, setMaxCount] = useState(APP_CONFIG.maxActiveGoals)

  async function handleSubmit() {
    if (checking) return
    if (goal.trim() === '') {
      setShowGoalError(true)
      goalInputRef.current?.focus()
      return
    }
    setChecking(true)
    // 개수 확인을 못 해도 진행 — 서버가 초과면 GOAL409_1로 다시 막아 줌
    const limit = await getGoalLimit().catch(() => null)
    setChecking(false)
    if (limit) setMaxCount(limit.maxCount)
    if (limit && limit.activeCount >= limit.maxCount) {
      setLimitOpen(true)
      return
    }
    const input = { title: goal.trim(), energy, burden }
    ai.run(
      (signal) =>
        createGoal(input, { signal }).catch((error) => {
          // 개수 초과는 E-04 대신 G-04 안내
          if (error.code === 'GOAL409_1') return { limit: true }
          throw error
        }),
      (created) => {
        if (created.crisis) navigate('/support', { replace: true })
        else if (created.limit) setLimitOpen(true)
        else navigate(`/goals/${created.goal.id}/action`, { replace: true })
      },
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
      {!online && <OfflineBanner />}

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
            allowLineBreak={false}
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
        <p className={styles.bottomHint}>
          {online ? '마음이 바뀌면 언제든 다시 고를 수 있어요' : '인터넷에 연결되면 바로 추천받을 수 있어요'}
        </p>
        <Button disabled={!online || !energy || !burden} loading={checking} onClick={handleSubmit}>
          AI에게 행동 추천받기
        </Button>
      </div>

      {/* G-04: 목표 정리하기 → 홈의 진행 중인 목표로 */}
      <ConfirmModal
        open={limitOpen}
        icon={<img src={layersIcon} alt="" />}
        title={`지금은 목표가 ${maxCount}개예요`}
        description={`새 목표를 시작하려면 하나를 마무리하거나\n잠시 내려놓아 주세요. 여러 개를 한 번에\n하지 않아도 정말 괜찮아요.`}
        secondaryLabel="닫기"
        primaryLabel="목표 정리하기"
        onSecondary={() => setLimitOpen(false)}
        onPrimary={() => navigate('/')}
        onDismiss={() => setLimitOpen(false)}
      />
    </div>
  )
}

/** 질문 제목 + 단일 선택 칩 묶음 */
function ChipQuestion({ id, title, hint, options, value, onChange }) {
  return (
    <section className={styles.section}>
      <div className={styles.question}>
        <h2 id={id} className={styles.questionTitle}>
          {title}
        </h2>
        <p className={styles.questionHint}>{hint}</p>
      </div>
      <ChipGroup labelledBy={id} options={options} value={value} onChange={onChange} />
    </section>
  )
}
