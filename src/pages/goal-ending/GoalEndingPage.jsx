import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getGoal } from '../../api/goals.js'
import { finishGoal } from '../../api/goalEnding.js'
import info from '../../assets/assigned/notice-info.svg'
import Button from '../../components/buttons/Button.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import RadioCard from '../../components/inputs/RadioCard.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './GoalEndingPage.module.css'

export default function GoalEndingPage() {
  const { goalId } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const submitting = useRef(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [choice, setChoice] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    setError(null)
    setChoice(null)
    getGoal(goalId, { signal: controller.signal }).then(setData).catch((reason) => {
      if (!controller.signal.aborted) setError(reason.name)
    })
    return () => controller.abort()
  }, [goalId])

  const goHome = () => navigate('/')
  const goBack = () => navigate(`/goals/${goalId}/action`)

  async function finish() {
    if (!choice || submitting.current) return
    submitting.current = true
    setBusy(true)
    try {
      const goal = await finishGoal(goalId, choice)
      if (goal.status === 'completed') navigate(`/goals/${goalId}/completed`, { replace: true })
      else {
        navigate('/', { replace: true })
        showToast({ type: 'success', title: `‘${goal.title}’를 내려놓았어요`, description: `시도한 ${doneCount}걸음은 행동 기록에 그대로 남아 있어요` })
      }
    } catch {
      showToast({ type: 'notice', title: '저장하지 못했어요. 잠시 후 다시 시도해 주세요' })
    }
    submitting.current = false
    setBusy(false)
  }

  if (error) return <StatusScreen title={error === 'NotFoundError' ? '목표를 찾을 수 없어요' : '목표를 불러오지 못했어요'} description="홈에서 목표를 다시 골라 주세요." actionLabel="홈으로 가기" onAction={goHome} />
  if (!data) return <StatusScreen loading />
  if (data.goal.status === 'completed') return <Navigate to={`/goals/${goalId}/completed`} replace />
  if (data.goal.status !== 'active') return <StatusScreen title="이미 마무리한 목표예요" description="시도한 걸음은 행동 기록에 남아 있어요." actionLabel="행동 기록 보기" onAction={() => navigate('/history')} />
  const doneCount = data.steps.filter((step) => step.status === 'done').length

  return (
    <div className={styles.page} data-assigned-page>
      <TopBar title="목표 마무리" onBack={goBack} />
      <div className={styles.content}>
        <header>
          <p className={styles.tag}>• {data.goal.title}</p>
          <h2 className={styles.title}>{'이 목표를\n어떻게 마무리할까요?'}</h2>
          <p className={styles.description}>지금까지 {doneCount}걸음을 내디뎠어요.</p>
        </header>
        <div className={styles.options} role="radiogroup" aria-label="목표 마무리 방법">
          <RadioCard name="goal-ending" value="completed" checked={choice === 'completed'} onChange={setChoice} disabled={busy} title="끝까지 해냈어요" description="목표를 완료로 기록하고 마무리할게요" />
          <RadioCard name="goal-ending" value="released" checked={choice === 'released'} onChange={setChoice} disabled={busy} title="여기서 그만둘래요" description="지금 나에게 맞지 않았을 뿐, 실패가 아니에요" />
        </div>
        <div className={styles.notice}><img src={info} alt="" /><p>중단해도 괜찮아요. 시도했던 {doneCount}걸음의 기록은 사라지지 않고 ‘행동 기록’에 그대로 남아 있어요.</p></div>
      </div>
      <div className={styles.bottom}>
        {!choice && <p className={styles.hint}>마무리 방법을 하나 골라주세요</p>}
        <Button className={styles.primaryButton} disabled={!choice} loading={busy} onClick={finish}>마무리하기</Button>
        <Button className={styles.textButton} variant="text" disabled={busy} onClick={goBack}>다음에 정할게요</Button>
      </div>
    </div>
  )
}
