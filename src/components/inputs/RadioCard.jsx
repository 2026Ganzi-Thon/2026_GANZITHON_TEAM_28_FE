import radioOnIcon from '../../assets/icons/radio-on.svg'
import styles from './RadioCard.module.css'

/**
 * 선택지 카드 (피그마 Option/RadioCard, node 7:93) — S-07 목표 종료 등
 * - 실제 <input type="radio">를 써서 같은 name끼리 하나만 선택, 화살표 키 이동도 됨
 * - 묶음은 <div role="radiogroup" aria-labelledby="질문 제목 id">로 감싸 주세요
 *
 * 사용법:
 *   <RadioCard name="end" value="completed" checked={choice === 'completed'} onChange={setChoice}
 *     title="끝까지 해냈어요" description="목표를 완료로 기록할게요" />
 */
export default function RadioCard({ name, value, checked = false, onChange, title, description, disabled = false }) {
  return (
    <label className={[styles.card, checked && styles.selected, disabled && styles.disabled].filter(Boolean).join(' ')}>
      <input
        type="radio"
        className={styles.input}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.(value)}
      />
      <span className={[styles.radio, checked && styles.radioOn].filter(Boolean).join(' ')} aria-hidden="true">
        {checked && <img src={radioOnIcon} alt="" />}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
    </label>
  )
}
