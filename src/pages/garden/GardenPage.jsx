import { useEffect, useId, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getGarden, seasonKey, seasonLabel } from '../../api/garden.js'
import { goalMetrics } from '../../api/goalEnding.js'
import plant from '../../assets/assigned/garden-plant.svg'
import pebble from '../../assets/assigned/garden-pebble.svg'
import sprout from '../../assets/assigned/garden-sprout.svg'
import chevron from '../../assets/icons/chevron-right.svg'
import Button from '../../components/buttons/Button.jsx'
import BottomSheet from '../../components/dialogs/BottomSheet.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './GardenPage.module.css'

const ART = { completed: plant, released: pebble, active: sprout }
const SPOTS = [{ x: 56, y: 66 }, { x: 136, y: 74 }, { x: 216, y: 70 }, { x: 292, y: 65 }, { x: 86, y: 156 }, { x: 166, y: 164 }, { x: 246, y: 152 }, { x: 312, y: 160 }, { x: 52, y: 236 }, { x: 132, y: 242 }, { x: 212, y: 232 }, { x: 290, y: 246 }]

export default function GardenPage({ archive = false }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const titleId = useId()
  const [items, setItems] = useState(null)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState(null)
  const currentSeason = seasonKey(Date.now())
  const shownSeason = params.get('season') ?? currentSeason

  useEffect(() => {
    const controller = new AbortController()
    getGarden({ signal: controller.signal }).then(setItems).catch(() => {
      if (!controller.signal.aborted) setError(true)
    })
    return () => controller.abort()
  }, [])

  if (error) return <StatusScreen title="정원을 불러오지 못했어요" actionLabel="행동 기록 보기" onAction={() => navigate('/history')} />
  if (!items) return <StatusScreen loading />
  const seasons = Array.from(new Set([currentSeason, ...items.map((item) => item.season)])).sort().reverse()
  const visible = items.filter((item) => item.season === shownSeason)
  const finished = visible.filter((item) => item.goal.status !== 'active')
  const metrics = selected ? goalMetrics(selected.goal, selected.steps) : null
  const seasonIndex = seasons.indexOf(shownSeason)

  return (
    <div className={styles.page} data-assigned-page>
      <TopBar title={archive ? '지난 정원 보기' : '1mm 정원'} onBack={() => navigate(archive ? '/garden' : '/history')} />
      <div className={styles.content}>
        <header><h2 className={styles.title}>{archive ? '지금까지 가꾼 정원이에요' : finished.length ? '작은 걸음이 모여\n피어난 정원이에요' : '첫 새싹을 심었어요'}</h2><p className={styles.description}>{archive ? '계절마다 다른 이야기가 담겨 있어요' : finished.length ? '모든 시도와 멈춤을, 조용히 간직할게요.' : '다음의 이야기가 천천히 이곳에 피어 있어요.'}</p></header>
        {archive ? (
          <div className={styles.archiveGrid}>{seasons.map((season) => {
            const gardenItems = items.filter((item) => item.season === season)
            return <button key={season} className={styles.archiveCard} onClick={() => navigate(`/garden?season=${season}`)}><GardenBoard items={gardenItems} small /><span>{seasonLabel(season)}</span><small>{gardenItems.filter((item) => item.goal.status === 'completed').length}송이 · {gardenItems.filter((item) => item.goal.status === 'released').length}돌</small></button>
          })}</div>
        ) : (
          <>
            <div className={styles.season}><button aria-label="이전 정원" disabled={seasonIndex >= seasons.length - 1} onClick={() => setParams({ season: seasons[seasonIndex + 1] })}><img className={styles.previous} src={chevron} alt="" /></button><span>{seasonLabel(shownSeason)}</span><button aria-label="다음 정원" disabled={seasonIndex <= 0} onClick={() => setParams({ season: seasons[seasonIndex - 1] })}><img src={chevron} alt="" /></button></div>
            <GardenBoard items={visible} onSelect={setSelected} />
            <div className={styles.legend}><span><img src={plant} alt="" />끝까지 해낸 목표</span><span><img src={sprout} alt="" />가꾸는 중</span><span><img src={pebble} alt="" />내려놓은 목표</span></div>
            {finished.length > 0 && <button className={styles.archiveLink} onClick={() => navigate('/garden/archive')}>지난 정원 보기</button>}
            <p className={styles.hint}>{finished.length ? '꽃이나 새싹을 누르면 그때의 이야기를 볼 수 있어요' : '작은 걸음이 모이면 이곳에 꽃이 피어날 거예요'}</p>
          </>
        )}
      </div>
      <BottomSheet open={selected !== null} onClose={() => setSelected(null)} labelledBy={titleId} className={styles.sheet}>
        {selected && <>
          <img className={styles.detailArt} src={ART[selected.goal.status]} alt="" />
          <div className={styles.sheetText}><h2 id={titleId} tabIndex={-1}>{selected.goal.title}</h2><p>{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(selected.goal.finishedAt ?? selected.goal.createdAt)}{selected.goal.status === 'completed' ? '에 피운 꽃' : selected.goal.status === 'released' ? '에 내려놓은 목표' : '부터 가꾸는 중'}</p></div>
          {selected.goal.status === 'completed' ? <dl className={styles.stats}><div><dt>내디딘 걸음</dt><dd>{metrics.count}걸음</dd></div><div><dt>함께한 기간</dt><dd>{metrics.days}일</dd></div><div><dt>쉬어간 날</dt><dd>{metrics.pausedDays}번</dd></div></dl> : <p className={styles.description}>지금 나에게 맞지 않았을 뿐, 실패가 아니에요.<br />시도한 걸음은 기록에 남아 있어요.</p>}
          <Button className={styles.button} variant="secondary" onClick={() => navigate('/history')}>행동 기록 보러 가기</Button><Button className={styles.button} variant="text" onClick={() => setSelected(null)}>닫기</Button>
        </>}
      </BottomSheet>
    </div>
  )
}

function GardenBoard({ items, onSelect, small = false }) {
  return <div className={[styles.board, small && styles.smallBoard].filter(Boolean).join(' ')}>
    {SPOTS.map((spot, index) => {
      const item = items[index]
      const art = item ? ART[item.goal.status] : index === 0 && !items.length ? sprout : null
      const position = { left: `${spot.x / 345 * 100}%`, top: `${spot.y / 300 * 100}%` }
      return art ? <button key={item?.goal.id ?? index} className={styles.plant} style={position} disabled={!item || small} aria-label={item?.goal.title ?? '첫 새싹'} onClick={() => onSelect?.(item)}><img src={art} alt="" /></button> : <span key={index} className={styles.soil} style={position} />
    })}
  </div>
}
