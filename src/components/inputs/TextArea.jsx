import styles from './TextArea.module.css'

const segmenter =
  typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('ko', { granularity: 'grapheme' }) : null

/** 글자를 사람이 보는 단위로 나눔 (이모지 하나 = 1자) */
function splitGraphemes(text) {
  return segmenter ? Array.from(segmenter.segment(text), (s) => s.segment) : Array.from(text)
}

/** 핸드오프 규칙: 앞뒤 공백을 뺀 뒤 글자 수를 셈 */
export function countChars(text) {
  return splitGraphemes(text.trim()).length
}

/** 앞뒤 공백을 뺀 글자 수가 max를 넘지 않게 자름 (붙여넣기 대비) */
function limitChars(text, max) {
  if (countChars(text) <= max) return text
  const leading = text.match(/^\s*/)[0]
  return leading + splitGraphemes(text.slice(leading.length)).slice(0, max).join('')
}

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
