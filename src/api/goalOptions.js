/**
 * 에너지·부담 선택지 (문구는 피그마 S-03 · S-04-3 기준)
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

/** S-04-3 '지금 에너지는 어때요?' — 직전 에너지와 비교한 변화 */
export const ENERGY_CHANGE_OPTIONS = [
  { value: 'same', label: '그대로예요' },
  { value: 'up', label: '조금 생겼어요' },
  { value: 'down', label: '더 지쳤어요' },
]

export function labelOf(options, value) {
  return options.find((option) => option.value === value)?.label ?? ''
}

/** 에너지 변화(same/up/down)를 반영한 새 에너지 값 */
export function shiftEnergy(energy, change) {
  const index = ENERGY_OPTIONS.findIndex((option) => option.value === energy)
  if (index < 0 || change === 'same') return energy
  const next = Math.min(Math.max(index + (change === 'up' ? 1 : -1), 0), ENERGY_OPTIONS.length - 1)
  return ENERGY_OPTIONS[next].value
}

/** AI 로딩 화면의 입력 요약 태그 */
export function summaryTags({ title, energy, burden }) {
  return [title, `에너지 · ${labelOf(ENERGY_OPTIONS, energy)}`, `부담 · ${labelOf(BURDEN_OPTIONS, burden)}`]
}
