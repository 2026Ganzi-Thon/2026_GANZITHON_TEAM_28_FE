import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ENERGY_OPTIONS, levelOf, summaryTags } from '../../api/goalOptions.js'
import { getGoal, restGoal, resumeGoal } from '../../api/goals.js'
import { requestNextStep, shrinkStep, tryStep } from '../../api/steps.js'
import moonIcon from '../../assets/icons/moon.svg'
import ConfirmModal from '../../components/dialogs/ConfirmModal.jsx'
import AiLoading from '../../components/feedback/AiLoading.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import { useAiRequest } from '../../components/feedback/useAiRequest.js'
import { useOnlineStatus } from '../../components/feedback/useOnlineStatus.js'
import StepDoneView from './StepDoneView.jsx'
import SuggestView from './SuggestView.jsx'

// S-04a 격려 토스트 (2.5초) 뒤에 S-04-3으로 넘어감
const CELEBRATE_MS = 2500

const SAVE_FAILED = '저장하지 못했어요. 잠시 후 다시 시도해 주세요'
const OFFLINE = '인터넷에 연결되면 다시 시도해 주세요'

/**
 * S-04 AI 행동 제안 화면 묶음 (/goals/:goalId/action) — 백엔드 목표 상세로 화면을 고름
 * - 지금 걸음(currentStep)이 있으면 S-04 (더 작게 했으면 S-04-1, 더 못 쪼개면 S-04-2)
 * - 지금 걸음이 없으면 '오늘은 여기까지' 상태 → S-04-3
 * - [해봤어요] 응답이 isLastStep이면 S-04-3a 마무리 제안
 * - 쉬어가는 목표로 들어오면 이어하기(resume) 후 보여줌 (기존 진행 중 목표는 백엔드가 자동으로 쉬어가기)
 */
export default function ActionPage() {
  const { goalId } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const ai = useAiRequest()
  const online = useOnlineStatus()

  const [data, setData] = useState(null) // { goal, step, doneCount }
  const [loadState, setLoadState] = useState('loading') // loading | ready | notFound | error
  const [busy, setBusy] = useState(null) // 'complete' | 'celebrate' | 'pause'
  const [pauseOpen, setPauseOpen] = useState(false)
  const [aiTags, setAiTags] = useState([])
  const [lastAction, setLastAction] = useState(null) // 방금 해본 행동 (S-04-3 칩)
  const [wrapUp, setWrapUp] = useState(false) // S-04-3a 마무리 제안
  const celebrateTimer = useRef(null)

  const load = useCallback(
    async (signal) => {
      try {
        let next = await getGoal(goalId, { signal })
        if (next.goal.resting) next = await resumeGoal(goalId, { signal })
        setData(next)
        setLoadState('ready')
      } catch (error) {
        if (signal?.aborted) return
        setLoadState(error.name === 'NotFoundError' || error.status === 404 ? 'notFound' : 'error')
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

  // S-04-3 '오늘은 여기까지' → 홈(S-02-2) + 토스트. 목표 상태는 바꾸지 않음
  function goHomeForToday() {
    navigate('/')
    showToast({ type: 'success', title: '오늘도 1mm 움직였어요', description: '다음 걸음은 준비되면 언제든 받을 수 있어요' })
  }

  // ----- S-04 -----
  async function handleDone(step) {
    if (busy) return
    if (!online) {
      showToast({ type: 'notice', title: OFFLINE })
      return
    }
    setBusy('complete')
    let tried
    try {
      tried = await tryStep(step.id)
    } catch {
      setBusy(null)
      showToast({ type: 'notice', title: SAVE_FAILED })
      return
    }
    // S-04a: 토스트 2.5초 동안 S-04에 머문 뒤 S-04-3(또는 S-04-3a)으로
    setBusy('celebrate')
    showToast({ type: 'success', title: '작은 시작을 해낸 것을 축하해요!', description: '1mm 움직인 오늘의 나, 정말 멋져요' })
    celebrateTimer.current = setTimeout(() => {
      setLastAction(step.action)
      setWrapUp(tried.isLastStep)
      setData((current) => ({ ...current, step: null, doneCount: tried.triedCount, goal: { ...current.goal, triedCount: tried.triedCount } }))
      setBusy(null)
    }, CELEBRATE_MS)
  }

  function handleSmaller(step) {
    if (busy) return
    // O-03: AI가 필요한 동작은 오프라인이면 Notice 토스트로 안내
    if (!online) {
      showToast({ type: 'notice', title: '인터넷에 연결되면 더 작게 나눠드릴게요' })
      return
    }
    setAiTags(summaryTags(data.goal))
    ai.run(
      (signal) =>
        shrinkStep(step.id, { signal }).catch((error) => {
          // 더 못 쪼개는 행동이면 오류 대신 S-04-2로
          if (error.code === 'SHRINK409') return { ...data, step: { ...step, smallestReached: true } }
          throw error
        }),
      (next) => setData(next),
    )
  }

  async function handlePauseConfirm() {
    if (!online) {
      setPauseOpen(false)
      showToast({ type: 'notice', title: OFFLINE })
      return
    }
    setBusy('pause')
    try {
      await restGoal(goalId)
      navigate(`/goals/${goalId}/pause`, { replace: true })
    } catch {
      setBusy(null)
      setPauseOpen(false)
      showToast({ type: 'notice', title: SAVE_FAILED })
    }
  }

  // ----- S-04-3 -----
  function handleNext(energy) {
    if (!online) {
      showToast({ type: 'notice', title: OFFLINE })
      return
    }
    setAiTags(summaryTags({ ...data.goal, energy }))
    ai.run(
      (signal) => requestNextStep(goalId, levelOf(ENERGY_OPTIONS, energy), { signal }),
      (next) => {
        setWrapUp(false)
        setData(next)
      },
    )
  }

  if (ai.state !== 'idle') return <AiLoading ai={ai} tags={aiTags} />

  if (loadState === 'loading') return <StatusScreen loading onBack={goHome} />

  if (loadState !== 'ready' || data.goal.status !== 'active') {
    const message =
      loadState === 'ready'
        ? { title: '이미 마무리한 목표예요', description: '홈에서 다른 목표를 이어가거나 새로 시작할 수 있어요.' }
        : loadState === 'notFound'
          ? { title: '목표를 찾을 수 없어요', description: '홈에서 진행 중인 목표를 다시 골라 주세요.' }
          : { title: '목표를 불러오지 못했어요', description: '잠시 후 다시 시도해 주세요.' }
    return <StatusScreen {...message} actionLabel="홈으로 가기" onAction={goHome} onBack={goHome} />
  }

  const { step, doneCount } = data

  if (step) {
    return (
      <>
        <SuggestView
          key={step.id}
          goal={data.goal}
          step={step}
          doneCount={doneCount}
          offline={!online}
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
          onPrimary={handlePauseConfirm}
          onDismiss={() => busy !== 'pause' && setPauseOpen(false)}
          primaryLoading={busy === 'pause'}
        />
      </>
    )
  }

  const kind = wrapUp ? 'wrapUp' : 'done'
  return (
    <StepDoneView
      key={kind}
      kind={kind}
      goal={data.goal}
      lastAction={lastAction}
      doneCount={doneCount}
      offline={!online}
      onBack={goHome}
      onNext={handleNext}
      onHome={goHomeForToday}
      onEndGoal={goEnd}
      onWrapUpFinish={goEnd}
      onWrapUpMore={() => setWrapUp(false)}
    />
  )
}
