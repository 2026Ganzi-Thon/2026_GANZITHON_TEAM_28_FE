import checkIcon from '../../assets/icons/check-small.svg'
import styles from './Chip.module.css'

/**
 * 단일 선택 칩 (피그마 Chip, node 4:26)
 * - 선택 상태는 색만이 아니라 체크 아이콘으로도 구분
 * - 보통은 ChipGroup으로 묶어서 씀 (하나만 선택 · 화살표 키 이동 · 라디오 그룹으로 읽힘)
 * - 단독으로 쓸 때는 감싸는 요소에 role="radiogroup" + 질문 제목을 aria-labelledby로
 */
export default function Chip({ label, selected = false, onClick, ...rest }) {
  const classNames = [styles.chip, selected && styles.selected].filter(Boolean).join(' ')

  return (
    <button type="button" className={classNames} role="radio" aria-checked={selected} onClick={onClick} {...rest}>
      {selected && <img className={styles.check} src={checkIcon} alt="" />}
      <span>{label}</span>
    </button>
  )
}
