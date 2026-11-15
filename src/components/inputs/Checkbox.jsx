import checkTinyIcon from '../../assets/icons/check-tiny.svg'
import styles from './Checkbox.module.css'

/**
 * 체크박스 + 글자 한 줄 (피그마 Control/Checkbox, node 52:1096)
 * - 터치 영역은 행 전체(최소 44px) — 글자를 눌러도 체크됨
 * - 실제 <input type="checkbox">를 써서 스크린리더·키보드(Space)가 그대로 동작
 *
 * 사용법:
 *   <Checkbox checked={agree} onChange={setAgree}>[필수] AI 걸음 추천을 위한 입력 정보 처리 동의</Checkbox>
 */
export default function Checkbox({ checked = false, onChange, disabled = false, children, ...rest }) {
  return (
    <label className={[styles.row, disabled && styles.disabled].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        {...rest}
      />
      <span className={[styles.box, checked && styles.checked].filter(Boolean).join(' ')} aria-hidden="true">
        {checked && <img src={checkTinyIcon} alt="" />}
      </span>
      {children && <span className={styles.label}>{children}</span>}
    </label>
  )
}
