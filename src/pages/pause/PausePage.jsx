import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getGoal } from '../../api/goals.js'
import checkSavedIcon from '../../assets/icons/check-saved.svg'
import sproutRestIllustration from '../../assets/icons/illustration-sprout-rest.svg'
import Button from '../../components/buttons/Button.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import styles from './PausePage.module.css'

/**
 * S-05 쉬어가기 (/goals/:goalId/pause)
 * - S-04b에서 [쉬어가기]로 목표를 쉬어가는 중(RESTING)으로 바꾼 뒤 들어오는 화면
 * - 쉬어가는 중이 아니면 S-04로 보냄
 * - 카드에는 멈춘 걸음(currentStep)과 몇 번째 걸음인지 보여줌
 */
export default function PausePage() {
  const { goalId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loadState, setLoadState] = useState('loading') // loading | ready | notFound | error

  useEffect(() => {
    const controller = new AbortController()
    getGoal(goalId, { signal: controller.signal })
      .then((result) => {
        setData(result)
        setLoadState('ready')
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setLoadState(error.name === 'NotFoundError' ? 'notFound' : 'error')
      })
    return () => controller.abort()
  }, [goalId])

  const goHome = () => navigate('/')

  if (loadState === 'loading') return <StatusScreen loading />

  if (loadState !== 'ready' || data.goal.status !== 'active') {
    const message =
      loadState === 'notFound'
        ? { title: '목표를 찾을 수 없어요', description: '홈에서 진행 중인 목표를 다시 골라 주세요.' }
        : loadState === 'error'
          ? { title: '목표를 불러오지 못했어요', description: '잠시 후 다시 시도해 주세요.' }
          : { title: '이미 마무리한 목표예요', description: '홈에서 다른 목표를 이어가거나 새로 시작할 수 있어요.' }
    return <StatusScreen {...message} actionLabel="홈으로 가기" onAction={goHome} />
  }

  if (!data.goal.resting) return <Navigate to={`/goals/${goalId}/action`} replace />

  const { step, doneCount } = data

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* 피그마 Illustration/Sprout-Rest — 장식용이라 스크린리더에서 읽지 않음 */}
        <img className={styles.illustration} src={sproutRestIllustration} alt="" aria-hidden="true" />

        <div className={styles.message}>
          <h1 className={styles.title}>{'괜찮아요,\n오늘은 여기까지도 충분해요'}</h1>
          <p className={styles.description}>{'언제든 다시 이어할 수 있도록\n지금 상태를 저장해 둘게요.'}</p>
        </div>

        <div className={styles.card}>
          <span className={styles.cardIcon}>
            <img src={checkSavedIcon} alt="" />
          </span>
          <div className={styles.cardText}>
            <p className={styles.cardMeta}>저장된 걸음 · {data.goal.title}</p>
            <p className={styles.cardAction}>{step?.action ?? '다음 걸음은 이어할 때 받아요'}</p>
            <p className={styles.cardSub}>{doneCount + 1}번째 걸음에서 쉬어가는 중이에요</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.bottomHint}>재촉하는 알림 없이 조용히 기다릴게요</p>
        <Button onClick={goHome}>홈으로 돌아가기</Button>
      </div>
    </div>
  )
}
