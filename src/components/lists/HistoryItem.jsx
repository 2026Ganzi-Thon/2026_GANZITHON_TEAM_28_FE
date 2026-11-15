import dotIcon from '../../assets/icons/dot-history.svg'
import styles from './HistoryItem.module.css'

/**
 * 행동 기록 한 줄 (피그마 List/HistoryItem, node 7:73) — S-06 행동 기록
 * - 왼쪽 세로선 + 점, 오른쪽에 시간·목표 / 행동 / 상태 태그
 * - 상태 태그는 해봤어요·시도했어요·쉬어갔어요 모두 같은 중립 스타일 (실패를 구분하지 않음)
 * - <li>로 그려지니 <ul>(또는 <ol>) 안에 넣어 주세요. 마지막 항목은 last로 선을 숨길 수 있어요
 *
 * 사용법:
 *   <ul className="...">
 *     <HistoryItem meta="방 청소하기 · 오후 3:12" action="책상 위에 있는 쓰레기 1개만 버리기" status="해봤어요" />
 *   </ul>
 */
export default function HistoryItem({ meta, action, status, last = false }) {
  return (
    <li className={styles.item}>
      <span className={styles.rail} aria-hidden="true">
        <img src={dotIcon} alt="" />
        {!last && <span className={styles.line} />}
      </span>
      <div className={styles.content}>
        <p className={styles.meta}>{meta}</p>
        <p className={styles.action}>{action}</p>
        {status && <span className={styles.tag}>{status}</span>}
      </div>
    </li>
  )
}
