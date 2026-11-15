import { countChars, limitChars } from './charCount.js'
import styles from './TextArea.module.css'

/**
 * 여러 줄 입력 (피그마 Input/TextArea, node 12:191)
 * - 아래 오른쪽에 'n / max' 글자 수
 * - error: 테두리를 오류 색으로 (문구는 FormErrorMessage로 따로)
 * - onChange는 이벤트가 아니라 문자열을 넘겨줌
 */
export default function TextArea({
  id,
  value,
  onChange,
  maxChars,
  placeholder,
  error = false,
  describedBy,
  rows = 2,
  ...rest
}) {
  function handleChange(event) {
    const next = event.target.value
    onChange?.(maxChars ? limitChars(next, maxChars) : next)
  }

  const classNames = [styles.field, error && styles.error].filter(Boolean).join(' ')

  return (
    <div className={classNames}>
      <textarea
        id={id}
        className={styles.input}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {maxChars && (
        <p className={styles.counter} aria-hidden="true">
          {countChars(value)} / {maxChars}
        </p>
      )}
    </div>
  )
}
