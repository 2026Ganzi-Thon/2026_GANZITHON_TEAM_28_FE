import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { APP_CONFIG } from '../../api/config.js'
import { summaryTags } from '../../api/goalOptions.js'
import { getGoal, markWrapUpOffered } from '../../api/goals.js'
import { completeStep, pauseStep, requestNextStep, requestSmallerStep, retryStep } from '../../api/steps.js'
import moonIcon from '../../assets/icons/moon.svg'
import Button from '../../components/buttons/Button.jsx'
import ConfirmModal from '../../components/dialogs/ConfirmModal.jsx'
import AiLoading from '../../components/feedback/AiLoading.jsx'
import Spinner from '../../components/feedback/Spinner.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import { useAiRequest } from '../../components/feedback/useAiRequest.js'
import TopBar from '../../components/navigation/TopBar.jsx'
import StepDoneView from './StepDoneView.jsx'
import SuggestView from './SuggestView.jsx'
import styles from './ActionPage.module.css'

// S-04a 격려 토스트 (2.5초) 뒤에 S-04-3으로 넘어감
const CELEBRATE_MS = 2500

/**
 * 목표·걸음 상태로 보여줄 화면을 고름 (홈 카드 L-01도 이 주소로만 보내면 됨)
 * - pending·paused 걸음 → S-04 (더 작게 횟수에 따라 S-04-1 / S-04-2)
 * - tried 걸음 → S-04-3b
 * - 마지막 걸음이 done → S-04-3, 조건이 맞으면 S-04-3a
 */
function deriveView({ goal, steps }) {
  const current = steps.at(-1)
  const doneCount = steps.filter((step) => step.status === 'done').length
  if (goal.status !== 'active') return { view: 'closed', doneCount }
  if (!current) return { view: 'error', doneCount }
  if (current.status === 'pending' || current.status === 'paused') return { view: 'suggest', step: current, doneCount }
  if (current.status === 'tried') return { view: 'resume', step: current, doneCount }
  if (doneCount >= APP_CONFIG.wrapUpMinSteps && !goal.wrapUpOffered) return { view: 'wrapUp', step: current, doneCount }
  return { view: 'done', step: current, doneCount }
}

/** S-04 AI 행동 제안 화면 묶음 (/goals/:goalId/action) */
export default function ActionPage() {
  const { goalId } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const ai = useAiRequest()

  const [data, setData] = useState(null) // { goal, steps }
  const [loadState, setLoadState] = useState('loading') // loading | ready | notFound | error
  const [busy, setBusy] = useState(null) // 'complete' | 'celebrate' | 'pause' | 'retry' | 'wrapUp'
  const [pauseOpen, setPauseOpen] = useState(false)
  const [aiTags, setAiTags] = useState([])
  const celebrateTimer = useRef(null)

  const load = useCallback(
    async (signal) => {
      try {
        setData(await getGoal(goalId, { signal }))
        setLoadState('ready')
      } catch (error) {
        if (signal?.aborted) return
        setLoadState(error.name === 'NotFoundError' ? 'notFound' : 'error')
      }
    },
    [goalId],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  useEffect(() => () => clearTimeout(celebrateTimer.current), [])

  const goHome = () => navigate('/')
  const goEnd = () => navigate(`/goals/${goalId}/end`)

  function showSaveError() {
    showToast({ type: 'notice', title: '저장하지 못했어요', description: '잠시 후 다시 시도해 주세요' })
  }

  /** AI 요청 후 최신 목표 상태까지 받아서 화면 갱신 */
  function runAi(tags, request) {
    setAiTags(tags)
    ai.run(
      (signal) => request(signal).then(() => getGoal(goalId, { signal })),
      (next) => setData(next),
    )
  }

  // ----- S-04 -----
  async function handleDone(step) {
    if (busy) return
    setBusy('complete')
    try {
      await completeStep(step.id)
    } catch {
      setBusy(null)
      showSaveError()
      return
    }
    // S-04a: 토스트 2.5초 동안 S-04에 머문 뒤 S-04-3으로
    setBusy('celebrate')
    showToast({ type: 'success', title: '작은 시작을 해낸 것을 축하해요!', description: '1mm 움직인 오늘의 나, 정말 멋져요' })
    celebrateTimer.current = setTimeout(async () => {
      await load()
      setBusy(null)
    }, CELEBRATE_MS)
  }

  function handleSmaller(step) {
    if (busy) return
    runAi(summaryTags(data.goal), (signal) => requestSmallerStep(step.id, { signal }))
  }

  async function handlePauseConfirm(step) {
    setBusy('pause')
    try {
      await pauseStep(step.id)
      navigate(`/goals/${goalId}/pause`)
    } catch {
      setBusy(null)
      setPauseOpen(false)
      showSaveError()
    }
  }

  // ----- S-04-3 / S-04-3b -----
  function handleNext(energy) {
    runAi(summaryTags({ ...data.goal, energy }), (signal) => requestNextStep(goalId, { energy }, { signal }))
  }

  async function handleRetry(step) {
    if (busy) return
    setBusy('retry')
    try {
      await retryStep(step.id)
      await load()
    } catch {
      showSaveError()
    }
    setBusy(null)
  }

  // ----- S-04-3a: 목표당 1번만 -----
  async function handleWrapUp(finish) {
    if (busy) return
    setBusy('wrapUp')
    try {
      await markWrapUpOffered(goalId)
    } catch {
      // 기록에 실패해도 사용자의 선택은 그대로 진행
    }
    if (finish) {
      goEnd()
      return
    }
    await load()
    setBusy(null)
  }

  if (ai.state !== 'idle') return <AiLoading ai={ai} tags={aiTags} />

  if (loadState === 'loading') {
    return (
      <div className={styles.status}>
        <TopBar title="" onBack={goHome} />
        <div className={styles.statusBody} role="status" aria-label="불러오는 중">
          <Spinner />
        </div>
      </div>
    )
  }

  const derived = loadState === 'ready' ? deriveView(data) : null
  if (!derived || derived.view === 'closed' || derived.view === 'error') {
    const message =
      derived?.view === 'closed'
        ? { title: '이미 마무리한 목표예요', description: '홈에서 다른 목표를 이어가거나 새로 시작할 수 있어요.' }
        : loadState === 'notFound'
          ? { title: '목표를 찾을 수 없어요', description: '홈에서 진행 중인 목표를 다시 골라 주세요.' }
          : { title: '목표를 불러오지 못했어요', description: '잠시 후 다시 시도해 주세요.' }
    return (
      <div className={styles.status}>
        <TopBar title="" onBack={goHome} />
        <div className={styles.statusBody}>
          <p className={styles.statusTitle}>{message.title}</p>
          <p className={styles.statusDescription}>{message.description}</p>
        </div>
        <div className={styles.statusActions}>
          <Button onClick={goHome}>홈으로 가기</Button>
        </div>
      </div>
    )
  }

  const { view, step, doneCount } = derived

  if (view === 'suggest') {
    return (
      <>
        <SuggestView
          key={step.id}
          goal={data.goal}
          step={step}
          doneCount={doneCount}
          completing={busy === 'complete'}
          onBack={goHome}
          onDone={() => handleDone(step)}
          onSmaller={() => handleSmaller(step)}
          onPause={() => !busy && setPauseOpen(true)}
        />
        {/* S-04b: 딤 탭 = 계속하기 */}
        <ConfirmModal
          open={pauseOpen}
          icon={<img src={moonIcon} alt="" />}
          title="정말 쉬어갈까요?"
          description={'지금까지의 기록은 안전하게 저장돼요.\n준비되면 언제든 이 걸음부터 이어갈 수 있어요.'}
          secondaryLabel="계속하기"
          primaryLabel="쉬어가기"
          onSecondary={() => setPauseOpen(false)}
          onPrimary={() => handlePauseConfirm(step)}
          onDismiss={() => busy !== 'pause' && setPauseOpen(false)}
          primaryLoading={busy === 'pause'}
        />
      </>
    )
  }

  return (
    <StepDoneView
      key={`${view}-${step.id}`}
      kind={view}
      goal={data.goal}
      step={step}
      doneCount={doneCount}
      retrying={busy === 'retry'}
      onBack={goHome}
      onNext={handleNext}
      onRetry={() => handleRetry(step)}
      onHome={goHome}
      onEndGoal={goEnd}
      onWrapUpFinish={() => handleWrapUp(true)}
      onWrapUpMore={() => handleWrapUp(false)}
    />
  )
}
