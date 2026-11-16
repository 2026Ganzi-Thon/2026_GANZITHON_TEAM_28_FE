import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getGoal } from '../../api/goals.js'
import { goalMetrics } from '../../api/goalEnding.js'
import flower from '../../assets/assigned/completion-flower.svg'
import gardenFlower from '../../assets/assigned/garden-flower.svg'
import chevron from '../../assets/icons/chevron-right.svg'
import Button from '../../components/buttons/Button.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import styles from './GoalCompletedPage.module.css'

/** C-01. S-07 완료 후 새로고침해도 같은 목표의 결과를 보여준다. */
export default function GoalCompletedPage() {
  const { goalId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    setError(false)
    getGoal(goalId, { signal: controller.signal }).then(setData).catch(() => {
      if (!controller.signal.aborted) setError(true)
    })
    return () => controller.abort()
  }, [goalId])

  if (error) return <StatusScreen title="목표를 찾을 수 없어요" actionLabel="홈으로 가기" onAction={() => navigate('/')} />
  if (!data) return <StatusScreen loading />
  if (data.goal.status !== 'completed') return <Navigate to={`/goals/${goalId}/end`} replace />
  const { count, days, pausedDays } = goalMetrics(data.goal, data.steps)

  return (
    <div className={styles.page} data-assigned-page>
      <div className={styles.content}>
        <img className={styles.flower} src={flower} alt="" />
        <h1 className={styles.title}>{`‘${data.goal.title}’를\n끝까지 해냈어요`}</h1>
        <p className={styles.description}>작은 걸음이 모여 여기까지 왔어요.<br />오늘의 나를 꼭 칭찬해 주세요.</p>
        <dl className={styles.stats}>
          <div><dt>내디딘 걸음</dt><dd>{count}걸음</dd></div>
          <div><dt>함께한 기간</dt><dd>{days}일</dd></div>
          <div><dt>쉬어간 날</dt><dd>{pausedDays}번</dd></div>
        </dl>
        <button className={styles.gardenLink} onClick={() => navigate('/garden')}>
          <img src={gardenFlower} alt="" />
          <span>1mm 정원에 꽃 한 송이가 피었어요 · 보러 가기</span>
          <img className={styles.chevron} src={chevron} alt="" />
        </button>
        <p className={styles.hint}>쉬어간 날도 목표를 이루는 과정이었어요</p>
      </div>
      <div className={styles.bottom}>
        <Button className={styles.primaryButton} onClick={() => navigate('/goals/new')}>새로운 목표 시작하기</Button>
        <Button className={styles.textButton} variant="text" onClick={() => navigate('/')}>홈으로 돌아가기</Button>
      </div>
    </div>
  )
}
