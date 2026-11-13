import checkIcon from '../../assets/icons/check-small.svg'
import styles from './Chip.module.css'

/**
 * 단일 선택 칩 (피그마 Chip, node 4:26)
 * - 선택 상태는 색만이 아니라 체크 아이콘으로도 구분
 * - 여러 칩을 묶어 하나만 고르게 하는 건 쓰는 쪽에서 처리 (selected + onClick)
 */
export default function Chip({ label, selected = false, onClick }) {
  const classNames = [styles.chip, selected && styles.selected].filter(Boolean).join(' ')

  return (
    <button type="button" className={classNames} aria-pressed={selected} onClick={onClick}>
      {selected && <img className={styles.check} src={checkIcon} alt="" />}
      <span>{label}</span>
    </button>
  )
}
