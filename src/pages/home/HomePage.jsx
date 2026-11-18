import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHome } from '../../api/goals.js'
import { getNickname } from '../../api/user.js'
import arrowRightIcon from '../../assets/icons/arrow-right.svg'
import chevronRightIcon from '../../assets/icons/chevron-right.svg'
import emptyGoalsIcon from '../../assets/icons/empty-goals.svg'
import historyIcon from '../../assets/icons/history.svg'
import layersIcon from '../../assets/icons/layers.svg'
import plusIcon from '../../assets/icons/plus.svg'
import settingsIcon from '../../assets/icons/settings.svg'
import Button from '../../components/buttons/Button.jsx'
import ConfirmModal from '../../components/dialogs/ConfirmModal.jsx'
import OfflineBanner from '../../components/feedback/OfflineBanner.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import { useOnlineStatus } from '../../components/feedback/useOnlineStatus.js'
import GoalCard from './GoalCard.jsx'
import { GoalActionsSheet } from './GoalSheets.jsx'
import { continueCardText, summarizeGoal } from './goalSummary.js'
import styles from './HomePage.module.css'

// E-01 '예시 목표로 가볍게 시작하기'에서 S-03에 미리 채울 목표
const EXAMPLE_GOAL = '방 청소하기'

/**
 * S-02 홈 (백엔드 GET /api/goals: 진행 중 목표 1개 + 쉬어가는 목표 목록 + 개수)
 * - 목표가 없으면(신규·모두 마친 사용자): 메인 카드 '새 목표 시작하기'(+ 아이콘)
 * - 목표가 있으면: 메인 카드 '목표 이어가기' — 진행 중 목표, 없으면 가장 최근에 쉬어간 목표
 *   + 아래 흰 버튼 '+ 새 목표 시작하기' (팀 결정으로 피그마 S-02·S-02-1을 바꿈)
 *   쉬어가는 목표만 있으면 인사말은 S-02-1 문구
 * - 목록: 진행 중 목표 + 쉬어가는 목표. 쉬어가는 목표를 누르면 S-04에서 이어하기(resume)
 * - E-01 빈 상태 / O-01 오프라인 배너 / G-01 ⋯ 시트(목표 마무리하기) / G-04 개수 초과
 *   G-02 이름 바꾸기·G-03 지우기는 백엔드 API가 없어 이번에는 숨김
 */
export default function HomePage() {
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const goalsRef = useRef(null)

  const [home, setHome] = useState(null) // { summaries, activeCount, maxCount, hasInProgress }
  const [nickname, setNickname] = useState('')
  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [sheetGoalId, setSheetGoalId] = useState(null)
  const [limitOpen, setLimitOpen] = useState(false)

  const load = useCallback(async (signal) => {
    try {
      const [data, name] = await Promise.all([getHome({ signal }), getNickname()])
      const resting = [...data.resting].sort((a, b) => (b.goal.restedAt ?? 0) - (a.goal.restedAt ?? 0))
      const items = data.inProgress ? [data.inProgress, ...resting] : resting
      setHome({
        summaries: items.map(summarizeGoal),
        activeCount: data.activeCount,
        maxCount: data.maxCount,
        hasInProgress: Boolean(data.inProgress),
      })
      setNickname(name)
      setLoadState('ready')
    } catch {
      if (signal?.aborted) return
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const summaries = home?.summaries ?? []
  const find = (goalId) => summaries.find((summary) => summary.goal.id === goalId)
  // 쉬어가는 목표도 S-04로 — S-04가 이어하기(resume)를 부름
  const openGoal = (goalId) => navigate(`/goals/${goalId}/action`)

  function startNewGoal(state) {
    if (home.activeCount >= home.maxCount) {
      setLimitOpen(true)
      return
    }
    navigate('/goals/new', state ? { state } : undefined)
  }

  if (loadState === 'loading') return <StatusScreen loading />
  if (loadState === 'error') {
    return (
      <StatusScreen
        title="목표를 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        actionLabel="다시 불러오기"
        onAction={() => {
          setLoadState('loading')
          load()
        }}
      />
    )
  }

  const latest = summaries[0] // 진행 중 목표, 없으면 가장 최근에 쉬어간 목표
  const paused = Boolean(latest) && !home.hasInProgress
  const greetingName = nickname ? `${nickname}님, ` : ''

  return (
    <div className={styles.page}>
      {!online && <OfflineBanner />}

      <div className={[styles.content, latest && styles.contentResume].filter(Boolean).join(' ')}>
        <header className={styles.header}>
          <div className={styles.greetingRow}>
            <p className={styles.greeting}>
              {greetingName}
              {paused ? '다시 와줘서 반가워요' : '오늘도 와줘서 고마워요'}
            </p>
            <button type="button" className={styles.iconButton} onClick={() => navigate('/settings')} aria-label="설정">
              <img src={settingsIcon} alt="" />
            </button>
          </div>
          <h1 className={styles.headline}>
            {paused ? '멈춘 곳에서 천천히\n다시 시작해 볼까요?' : '지금 상태에 맞춰\n목표를 작게 쪼개어 시작해 보세요'}
          </h1>
        </header>

        {latest ? (
          <>
            {/* 목표 이어가기: 진행 중(없으면 최근에 쉬어간) 목표의 S-04로 */}
            <MainCard
              title="목표 이어가기"
              {...continueCardText(latest)}
              onClick={() => openGoal(latest.goal.id)}
            />
            <Button variant="secondary" onClick={() => startNewGoal()}>
              +&nbsp;&nbsp;새 목표 시작하기
            </Button>
          </>
        ) : (
          <MainCard
            icon={plusIcon}
            title="새 목표 시작하기"
            description={'하고 싶은 일을 알려주시면\nAI가 지금 할 수 있는 가장 작은 걸음을 찾아드려요'}
            footer="1분이면 충분해요"
            onClick={() => startNewGoal()}
          />
        )}

        <section ref={goalsRef} className={styles.goals} aria-labelledby="home-goals-title">
          <div className={styles.sectionHeader}>
            <h2 id="home-goals-title" className={styles.sectionTitle}>
              진행 중인 목표
            </h2>
            <p className={styles.sectionCount}>{summaries.length}개</p>
          </div>

          {summaries.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <img src={emptyGoalsIcon} alt="" />
              </span>
              <div className={styles.emptyText}>
                <p className={styles.emptyTitle}>아직 진행 중인 목표가 없어요</p>
                <p className={styles.emptyDescription}>
                  {'거창하지 않아도 괜찮아요.\n오늘 떠오르는 작은 일 하나면 충분해요.'}
                </p>
              </div>
              <div className={styles.emptyAction}>
                <Button variant="secondary" onClick={() => startNewGoal({ exampleGoal: EXAMPLE_GOAL })}>
                  예시 목표로 가볍게 시작하기
                </Button>
              </div>
            </div>
          ) : (
            <ul className={styles.goalList}>
              {summaries.map((summary) => (
                <GoalCard
                  key={summary.goal.id}
                  summary={summary}
                  onOpen={() => openGoal(summary.goal.id)}
                  onMore={() => setSheetGoalId(summary.goal.id)}
                />
              ))}
            </ul>
          )}
        </section>

        {summaries.length > 0 && (
          <button type="button" className={styles.menuRow} onClick={() => navigate('/history')}>
            <span className={styles.menuIcon}>
              <img src={historyIcon} alt="" />
            </span>
            <span className={styles.menuText}>
              <span className={styles.menuTitle}>이전 행동 기록 보기</span>
              <span className={styles.menuDescription}>지금까지 내디딘 걸음을 천천히 돌아봐요</span>
            </span>
            <img src={chevronRightIcon} alt="" />
          </button>
        )}
      </div>

      {/* G-01: 목표 마무리하기만 (이름 바꾸기·지우기는 백엔드 API가 없어 숨김) */}
      <GoalActionsSheet
        summary={sheetGoalId ? find(sheetGoalId) : null}
        onClose={() => setSheetGoalId(null)}
        onEnd={() => navigate(`/goals/${sheetGoalId}/end`)}
      />

      {/* G-04: 목표 정리하기 → 진행 중인 목표 위치로 스크롤 */}
      <ConfirmModal
        open={limitOpen}
        icon={<img src={layersIcon} alt="" />}
        title={`지금은 목표가 ${home.maxCount}개예요`}
        description={'새 목표를 시작하려면 하나를 마무리하거나\n잠시 내려놓아 주세요. 여러 개를 한 번에\n하지 않아도 정말 괜찮아요.'}
        secondaryLabel="닫기"
        primaryLabel="목표 정리하기"
        onSecondary={() => setLimitOpen(false)}
        onPrimary={() => {
          setLimitOpen(false)
          goalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        onDismiss={() => setLimitOpen(false)}
      />
    </div>
  )
}

/** 메인 카드 (새 목표 시작하기 / 목표 이어가기) */
function MainCard({ icon, title, description, footer, onClick }) {
  return (
    <button type="button" className={styles.mainCard} onClick={onClick}>
      {icon && (
        <span className={styles.mainIcon}>
          <img src={icon} alt="" />
        </span>
      )}
      <span className={styles.mainText}>
        <span className={styles.mainTitle}>{title}</span>
        <span className={styles.mainDescription}>{description}</span>
      </span>
      <span className={styles.mainFooter}>
        <span className={styles.mainFooterText}>{footer}</span>
        <span className={styles.mainArrow}>
          <img src={arrowRightIcon} alt="" />
        </span>
      </span>
    </button>
  )
}
