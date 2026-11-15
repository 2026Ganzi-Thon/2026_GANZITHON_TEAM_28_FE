import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_CONFIG } from '../../api/config.js'
import { deleteGoal, listGoals, renameGoal } from '../../api/goals.js'
import { getNickname } from '../../api/user.js'
import arrowRightIcon from '../../assets/icons/arrow-right.svg'
import chevronRightIcon from '../../assets/icons/chevron-right.svg'
import emptyGoalsIcon from '../../assets/icons/empty-goals.svg'
import historyIcon from '../../assets/icons/history.svg'
import layersIcon from '../../assets/icons/layers.svg'
import plusIcon from '../../assets/icons/plus.svg'
import settingsIcon from '../../assets/icons/settings.svg'
import trashIcon from '../../assets/icons/trash.svg'
import Button from '../../components/buttons/Button.jsx'
import ConfirmModal from '../../components/dialogs/ConfirmModal.jsx'
import OfflineBanner from '../../components/feedback/OfflineBanner.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import { useOnlineStatus } from '../../components/feedback/useOnlineStatus.js'
import GoalCard from './GoalCard.jsx'
import { GoalActionsSheet, RenameGoalSheet } from './GoalSheets.jsx'
import { continueCardText, summarizeGoal } from './goalSummary.js'
import styles from './HomePage.module.css'

// 토스트 문구 (피그마 T-01 Toast Catalog)
const SAVE_FAILED = '저장하지 못했어요. 잠시 후 다시 시도해 주세요'

// E-01 '예시 목표로 가볍게 시작하기'에서 S-03에 미리 채울 목표
const EXAMPLE_GOAL = '방 청소하기'

/**
 * S-02 홈
 * - 진행 중인 목표가 없으면(신규·모두 마친 사용자): 메인 카드 '새 목표 시작하기'(+ 아이콘)
 * - 진행 중인 목표가 있으면: 가장 최근에 움직인 목표로 메인 카드 '목표 이어가기'
 *   (왼쪽 위 아이콘 없이 오른쪽 아래 흰 화살표만 — 화살표가 두 개로 겹쳐 보이지 않게)
 *   + 아래 흰 버튼 '+ 새 목표 시작하기' (팀 결정으로 피그마 S-02·S-02-1을 바꿈)
 *   가장 최근 목표가 쉬어가는 중이면 인사말은 S-02-1 문구
 * - E-01: 진행 중인 목표가 0개
 * - O-01: 오프라인이면 상단 배너
 * - G-01 ⋯ 시트 / G-02 이름 바꾸기 / G-03 지우기 확인 / G-04 목표 3개 초과
 */
export default function HomePage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const online = useOnlineStatus()
  const goalsRef = useRef(null)

  const [summaries, setSummaries] = useState(null)
  const [nickname, setNickname] = useState('')
  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [sheet, setSheet] = useState(null) // { type: 'actions' | 'rename', goalId }
  const [modal, setModal] = useState(null) // { type: 'delete', goalId } | { type: 'limit' }
  const [busy, setBusy] = useState(null) // 'rename' | 'delete'

  const load = useCallback(async (signal) => {
    try {
      const [goals, name] = await Promise.all([listGoals({ signal }), getNickname()])
      setSummaries(goals.map(summarizeGoal))
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

  const find = (goalId) => summaries?.find((summary) => summary.goal.id === goalId)
  const openGoal = (goalId) => navigate(`/goals/${goalId}/action`)

  function startNewGoal(state) {
    if (summaries.length >= APP_CONFIG.maxActiveGoals) {
      setModal({ type: 'limit' })
      return
    }
    navigate('/goals/new', state ? { state } : undefined)
  }

  async function handleRename(title) {
    const { goalId } = sheet
    setBusy('rename')
    try {
      await renameGoal(goalId, title)
      setSheet(null)
      showToast({ type: 'simple', title: '목표 이름을 바꿨어요' })
      await load()
    } catch {
      showToast({ type: 'notice', title: SAVE_FAILED })
    }
    setBusy(null)
  }

  async function handleDelete() {
    if (busy) return
    const { goalId } = modal
    setBusy('delete')
    try {
      await deleteGoal(goalId)
      setModal(null)
      showToast({ type: 'success', title: '목표를 지웠어요', description: '걸음 기록은 행동 기록에 남아 있어요' })
      await load()
    } catch {
      showToast({ type: 'notice', title: SAVE_FAILED })
    }
    setBusy(null)
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

  const latest = summaries[0] // listGoals가 최근에 움직인 순으로 줌
  const paused = latest?.current?.status === 'paused'
  const greetingName = nickname ? `${nickname}님, ` : ''
  const deleteTarget = modal?.type === 'delete' ? find(modal.goalId) : null

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
            {/* 목표 이어가기: 가장 최근에 움직인 목표의 S-04로 */}
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
                  onMore={() => setSheet({ type: 'actions', goalId: summary.goal.id })}
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

      {/* G-01 */}
      <GoalActionsSheet
        summary={sheet?.type === 'actions' ? find(sheet.goalId) : null}
        onClose={() => setSheet(null)}
        onEnd={() => navigate(`/goals/${sheet.goalId}/end`)}
        onRename={() => setSheet({ type: 'rename', goalId: sheet.goalId })}
        onDelete={() => {
          setModal({ type: 'delete', goalId: sheet.goalId })
          setSheet(null)
        }}
      />

      {/* G-02 */}
      <RenameGoalSheet
        summary={sheet?.type === 'rename' ? find(sheet.goalId) : null}
        saving={busy === 'rename'}
        onClose={() => busy !== 'rename' && setSheet(null)}
        onSave={handleRename}
      />

      {/* G-03: 안전한 선택(그대로 둘게요)이 Primary. 딤·Esc = 그대로 둘게요 */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        icon={<img src={trashIcon} alt="" />}
        title="이 목표를 지울까요?"
        description={`‘${deleteTarget?.goal.title ?? ''}’가 진행 중인 목표에서 사라져요.\n내디딘 걸음 기록은 행동 기록에 남아 있어요.`}
        secondaryLabel="지우기"
        secondaryTone="danger"
        primaryLabel="그대로 둘게요"
        onSecondary={handleDelete}
        onPrimary={() => setModal(null)}
        onDismiss={() => busy !== 'delete' && setModal(null)}
      />

      {/* G-04: 목표 정리하기 → 진행 중인 목표 위치로 스크롤 */}
      <ConfirmModal
        open={modal?.type === 'limit'}
        icon={<img src={layersIcon} alt="" />}
        title={`지금은 목표가 ${APP_CONFIG.maxActiveGoals}개예요`}
        description={'새 목표를 시작하려면 하나를 마무리하거나\n잠시 내려놓아 주세요. 여러 개를 한 번에\n하지 않아도 정말 괜찮아요.'}
        secondaryLabel="닫기"
        primaryLabel="목표 정리하기"
        onSecondary={() => setModal(null)}
        onPrimary={() => {
          setModal(null)
          goalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        onDismiss={() => setModal(null)}
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
