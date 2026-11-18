import { countChars, limitChars } from './charCount.js'
import styles from './TextArea.module.css'

const LINE_BREAKS = /\r?\n/g

/**
 * 여러 줄 입력 (피그마 Input/TextArea, node 12:191)
 * - 아래 오른쪽에 'n / max' 글자 수
 * - error: 테두리를 오류 색으로 (문구는 FormErrorMessage로 따로)
 * - onChange는 이벤트가 아니라 문자열을 넘겨줌
 * - allowLineBreak={false}: Enter 줄바꿈을 막고, 붙여넣은 줄바꿈은 공백으로 바꿈 (목표 이름처럼 한 줄 값)
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
  allowLineBreak = true,
  onKeyDown,
  ...rest
}) {
  function handleChange(event) {
    let next = event.target.value
    if (!allowLineBreak) next = next.replace(LINE_BREAKS, ' ')
    onChange?.(maxChars ? limitChars(next, maxChars) : next)
  }

  function handleKeyDown(event) {
    // 한글 입력 조합 중의 Enter는 건드리지 않음
    if (!allowLineBreak && event.key === 'Enter' && !event.nativeEvent.isComposing) event.preventDefault()
    onKeyDown?.(event)
  }

  const classNames = [styles.field, error && styles.error].filter(Boolean).join(' ')

  return (
    <div className={classNames}>
      <textarea
        id={id}
        className={styles.input}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
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
