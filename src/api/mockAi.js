/**
 * mock AI 응답 (백엔드 API가 나오기 전까지만 사용)
 * 실제로는 서버의 AI가 목표·에너지·부담을 보고 행동을 만든다.
 * 여기서는 피그마 예시(방 청소하기)를 바탕으로 정해 둔 문구를 돌려준다.
 */
import { BURDEN_OPTIONS, ENERGY_OPTIONS, labelOf } from './goalOptions.js'

const STEP_ACTIONS = [
  { action: '책상 위에 있는 쓰레기 1개만 버리기', description: '1분이면 충분해요.\n완벽하게 하지 않아도 괜찮아요.' },
  { action: '바닥에 있는 옷 1벌만 의자에 걸어두기', description: '개지 않아도 돼요.\n걸어두기만 해도 충분해요.' },
  { action: '창문을 열고 30초 동안 바람 쐬기', description: '정리하지 않아도 괜찮아요.\n공기만 바꿔도 한 걸음이에요.' },
  { action: '컵 1개만 싱크대로 옮기기', description: '씻지 않아도 돼요.\n옮기기만 해도 충분해요.' },
  { action: '책상 위 물건 3개만 한쪽으로 모으기', description: '어디에 둘지 고민하지 않아도 돼요.\n모으기만 해볼까요?' },
]

const SMALLER_ACTIONS = [
  {
    action: '책상 위 쓰레기 1개를 손에 쥐어보기',
    description: '버리지 않아도 괜찮아요.\n손에 쥐는 것까지만 해도 충분해요.',
    reason: '‘버리기’가 부담스러울 수 있어서 ‘쥐어보기’까지만 나눴어요',
  },
  {
    action: '책상 앞에 1분만 앉아보기',
    description: '아무것도 하지 않아도 돼요.\n앉아 있기만 해도 충분해요.',
    reason: '움직이기 전에 자리부터 잡는 걸로 더 작게 나눴어요',
  },
  {
    action: '책상 쪽을 한 번 바라보기',
    description: '이것도 버겁게 느껴진다면,\n오늘은 쉬어가는 것도 좋은 선택이에요.',
    reason: '더 작게 나누기는 어려워요. 다른 일로 시작하고 싶다면 목표를 바꿔도 괜찮아요',
  },
]

function reasonFor({ energy, burden }) {
  return `에너지 ‘${labelOf(ENERGY_OPTIONS, energy)}’, 부담 ‘${labelOf(BURDEN_OPTIONS, burden)}’에 맞춰 가장 작게 골랐어요`
}

/** stepIndex번째(0부터) 걸음의 행동 */
export function suggestStep(goal, stepIndex) {
  const base = STEP_ACTIONS[stepIndex % STEP_ACTIONS.length]
  return { ...base, reason: reasonFor(goal) }
}

/** smallerCount번째(1부터) [더 작게] 결과. lastOne이면 AI가 더 못 쪼갠다고 판단한 것 */
export function suggestSmaller(smallerCount) {
  const index = Math.min(smallerCount, SMALLER_ACTIONS.length) - 1
  return { ...SMALLER_ACTIONS[index], lastOne: index === SMALLER_ACTIONS.length - 1 }
}
