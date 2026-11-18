/**
 * 입력 글자 수 규칙 (핸드오프 노트)
 * - 앞뒤 공백을 뺀 뒤 셈
 * - 이모지 하나 = 1자 (사람이 보는 글자 단위)
 */
const segmenter =
  typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('ko', { granularity: 'grapheme' }) : null

function splitGraphemes(text) {
  return segmenter ? Array.from(segmenter.segment(text), (s) => s.segment) : Array.from(text)
}

export function countChars(text) {
  return splitGraphemes(text.trim()).length
}

/** 앞뒤 공백을 뺀 글자 수가 max를 넘지 않게 자름 (붙여넣기 대비) */
export function limitChars(text, max) {
  if (!max || countChars(text) <= max) return text
  const leading = text.match(/^\s*/)[0]
  return leading + splitGraphemes(text.slice(leading.length)).slice(0, max).join('')
}
