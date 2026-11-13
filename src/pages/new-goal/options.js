/**
 * S-03 칩 선택지 (문구는 피그마 S-03 기준)
 * value는 임시 키 — 백엔드와 API 값 이름을 맞추면 바꾼다.
 */
export const ENERGY_OPTIONS = [
  { value: 'drained', label: '완전히 방전됨' },
  { value: 'low', label: '조금 남아 있음' },
  { value: 'normal', label: '보통이에요' },
  { value: 'good', label: '꽤 괜찮아요' },
]

export const BURDEN_OPTIONS = [
  { value: 'overwhelmed', label: '너무 막막해요' },
  { value: 'heavy', label: '꽤 부담돼요' },
  { value: 'slight', label: '약간 부담돼요' },
  { value: 'doable', label: '해볼 만해요' },
]

export function labelOf(options, value) {
  return options.find((option) => option.value === value)?.label ?? ''
}
