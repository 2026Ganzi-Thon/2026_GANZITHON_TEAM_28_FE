import { limitChars } from './charCount.js'
import styles from './TextField.module.css'

/**
 * 한 줄 입력 (피그마 Input/TextField, node 42:733)
 * - onChange는 이벤트가 아니라 문자열을 넘겨줌
 * - maxChars: 앞뒤 공백 뺀 글자 수 상한 (이모지 1자)
 * - error: 테두리를 오류 색으로 (문구는 FormErrorMessage로 따로)
 */
export default function TextField({ value, onChange, maxChars, error = false, describedBy, ...rest }) {
  const classNames = [styles.field, error && styles.error].filter(Boolean).join(' ')

  return (
    <div className={classNames}>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(event) => onChange?.(limitChars(event.target.value, maxChars))}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        {...rest}
      />
    </div>
  )
}
