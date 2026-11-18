import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listHistory } from '../../api/history.js'
import flower from '../../assets/icons/flower.svg'
import chevron from '../../assets/icons/chevron-right.svg'
import emptyHistory from '../../assets/assigned/empty-history.svg'
import Button from '../../components/buttons/Button.jsx'
import HistoryItem from '../../components/lists/HistoryItem.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import { dateKey, dateLabel, timeLabel, weekDays } from './historyDates.js'
import styles from './HistoryPage.module.css'

const STATUS_LABELS = { done: '해봤어요', tried: '시도했어요', paused: '쉬어갔어요' }
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const WEEK_NAMES = ['첫째', '둘째', '셋째', '넷째', '다섯째']

export default function HistoryPage() {
  const navigate = useNavigate()
  const sections = useRef({})
  const recordsRef = useRef(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)
  const [week, setWeek] = useState(() => new Date())
  const [selected, setSelected] = useState(() => dateKey(Date.now()))
  const today = dateKey(Date.now())
  const days = weekDays(week)

  useEffect(() => {
    const controller = new AbortController()
    setError(false)
    listHistory({ signal: controller.signal }).then(setData).catch(() => {
      if (!controller.signal.aborted) setError(true)
    })
    return () => controller.abort()
  }, [reload])

  if (error) return <StatusScreen title="기록을 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." actionLabel="다시 불러오기" onAction={() => setReload((value) => value + 1)} onBack={() => navigate('/')} />
  if (!data) return <StatusScreen loading />

  const weekKeys = days.map(dateKey)
  const entries = data.entries.filter((entry) => weekKeys.includes(dateKey(entry.recordedAt)))
  const groups = new Map()
  entries.forEach((entry) => {
    const key = dateKey(entry.recordedAt)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(entry)
  })
  const selectedEmpty = !groups.has(selected)
  const noRecords = data.entries.length === 0

  function selectDay(day) {
    const key = dateKey(day)
    setSelected(key)
    requestAnimationFrame(() => {
      const section = sections.current[key]
      const list = recordsRef.current
      if (list) list.scrollTo({ top: section ? section.offsetTop - list.offsetTop : 0, behavior: 'smooth' })
    })
  }

  function changeWeek(offset) {
    const next = new Date(days[0])
    next.setDate(next.getDate() + offset * 7)
    setWeek(next)
    setSelected(weekDays(next).some((day) => dateKey(day) === today) ? today : dateKey(next))
  }

  return (
    <div className={styles.page} data-assigned-page>
      <TopBar title="행동 기록" onBack={() => navigate('/')} />
      <div className={styles.content}>
        <header>
          <h2 className={styles.title}>{noRecords ? '아직 기록이 비어 있어도\n전혀 괜찮아요' : '해냈든 멈췄든,\n시도한 순간은 모두 소중해요'}</h2>
          <p className={styles.description}>{noRecords ? '첫 1mm를 내딛는 날, 이곳에 작은 기록이 하나씩 쌓여요.' : `이번 주에도 벌써 ${entries.length}번이나 움직였어요. 정말 잘하고 있어요.`}</p>
        </header>
        <button className={styles.garden} onClick={() => navigate('/garden')}>
          <img className={styles.flower} src={flower} alt="" />
          <span><span className={styles.gardenTitle}>1mm 정원</span><span className={styles.description}>{noRecords ? '첫 새싹이 피어날 자리가 준비돼 있어요' : '지금까지 피워낸 꽃들을 보러 가요'}</span></span>
          <img className={styles.chevron} src={chevron} alt="" />
        </button>
        <section className={styles.calendar} aria-label="주간 기록 달력">
          <div className={styles.weekHeader}>
            <button className={styles.arrow} aria-label="이전 주" onClick={() => changeWeek(-1)}><img className={styles.previous} src={chevron} alt="" /></button>
            <h3 className={styles.weekTitle}>{week.getFullYear()}년 {week.getMonth() + 1}월 {WEEK_NAMES[Math.ceil(week.getDate() / 7) - 1]} 주</h3>
            <button className={styles.arrow} aria-label="다음 주" onClick={() => changeWeek(1)}><img src={chevron} alt="" /></button>
          </div>
          <div className={styles.days}>
            {days.map((day, index) => {
              const key = dateKey(day)
              const hasRecord = groups.has(key)
              return (
                <div key={key} className={styles.day}>
                  <span className={styles.weekday}>{WEEKDAYS[index]}</span>
                  <button className={[styles.dayButton, selected === key && styles.selected, today === key && styles.today].filter(Boolean).join(' ')} aria-pressed={selected === key} aria-current={today === key ? 'date' : undefined} aria-label={`${dateLabel(day)}${hasRecord ? ', 기록 있음' : ', 기록 없음'}`} onClick={() => selectDay(day)}>
                    <span className={styles.dayNumber}>{day.getDate()}</span>
                  </button>
                  <span className={styles.dot} data-record={hasRecord} aria-hidden="true" />
                </div>
              )
            })}
          </div>
          {!noRecords && <p className={styles.legend}>• 작은 걸음을 시도한 날</p>}
        </section>
        <div className={styles.recordArea}>
          {selected !== today && !selectedEmpty && <p className={styles.scrollHint}>↑ 최근 기록 ({new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(entries[0].recordedAt)})은 위에 있어요</p>}
          <div className={styles.records} ref={recordsRef}>
          {noRecords ? (
            <div className={styles.emptyAll}>
              <img className={styles.emptyIcon} src={emptyHistory} alt="" />
              <h3>아직 남겨진 걸음이 없어요</h3>
              <p>완벽하게 해내지 않아도 돼요.<br />시도만 해도 소중한 기록이 돼요.</p>
            </div>
          ) : selectedEmpty && (
            <div className={styles.empty} role="status">
              <p>{data.entries.length ? `${dateLabel(new Date(`${selected}T12:00:00`))}은 쉬어간 날이에요` : '아직 남겨진 걸음이 없어요'}</p>
              <span>쉬는 날도 다음 걸음을 위한 준비예요.</span>
            </div>
          )}
          {Array.from(groups, ([key, records]) => (
            <section key={key} ref={(node) => { sections.current[key] = node }} className={styles.recordGroup}>
              <h3 className={styles.dateHeading}>{dateLabel(records[0].recordedAt)}{key === today ? ' · 오늘' : key === selected ? ' · 선택한 날' : ''}</h3>
              <ul className={styles.list}>
                {records.map((entry, index) => <HistoryItem key={entry.id} meta={`${entry.goalTitle} · ${timeLabel(entry.recordedAt)}`} action={entry.action} status={STATUS_LABELS[entry.status]} last={index === records.length - 1} />)}
              </ul>
            </section>
          ))}
          </div>
        </div>
      </div>
      {noRecords && <div className={styles.bottom}><Button className={styles.primaryButton} onClick={() => navigate('/goals/new')}>첫 걸음 시작하기</Button></div>}
    </div>
  )
}
