import moreIcon from '../../assets/icons/more.svg'
import styles from './GoalCard.module.css'

/**
 * 진행 중인 목표 카드 (피그마 Card/GoalItem, node 4:32)
 * - 카드 탭 → onOpen (S-04로)
 * - ⋯ 탭 → onMore (G-01 목표 더보기 시트)
 */
export default function GoalCard({ summary, onOpen, onMore }) {
  return (
    <li className={styles.card}>
      <button type="button" className={styles.main} onClick={onOpen}>
        <span className={styles.title}>{summary.goal.title}</span>
        <span className={styles.next}>{summary.next}</span>
        <span className={styles.progress}>{summary.progress}</span>
      </button>
      <button type="button" className={styles.more} onClick={onMore} aria-label={`${summary.goal.title} 더보기`}>
        <img src={moreIcon} alt="" />
      </button>
    </li>
  )
}
