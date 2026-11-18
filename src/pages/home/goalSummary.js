/**
 * 홈 목표 카드(L-01) 문구 규칙 — 백엔드 구조 기준
 * ① 진행 중 · 지금 걸음 있음      → '다음 한 걸음 · {행동}'          → S-04
 * ② 진행 중 · 지금 걸음 없음      → '다음 걸음 받기 · 준비되면 …'    → S-04-3 (오늘은 여기까지 상태)
 * ③ 쉬어가는 중                    → '멈춘 걸음부터 이어할 수 있어요' → S-04 (이어하기)
 * 어느 상태든 /goals/:id/action 으로 보내면 S-04가 알맞은 화면을 고름
 * (피그마의 '걸음 시간 지남(24시간)' 상태는 백엔드에 없어 쓰지 않음)
 */

/** 'N걸음 내디뎠어요' (해봤어요 수). 0걸음은 실패처럼 보이지 않게 다른 문구 */
export function doneLabel(doneCount) {
  return doneCount > 0 ? `${doneCount}걸음 내디뎠어요` : '아직 첫 걸음 전이에요'
}

function oneLine(text) {
  return text.replace(/\s*\n\s*/g, ' ')
}

/** @param {{ goal, step, doneCount }} item goals.js getHome의 진행 중·쉬어가는 목표 */
export function summarizeGoal({ goal, step, doneCount }) {
  let next = '다음 걸음 받기 · 준비되면 눌러주세요'
  let progress = `${doneLabel(doneCount)} · 오늘은 마무리`

  if (goal.resting) {
    next = '멈춘 걸음부터 이어할 수 있어요'
    progress = doneCount > 0 ? `${doneCount}걸음 · 쉬어가는 중` : '첫 걸음 전 · 쉬어가는 중'
  } else if (step) {
    next = `다음 한 걸음 · ${oneLine(step.action)}`
    progress = doneLabel(doneCount)
  }

  return { goal, current: step, doneCount, next, progress }
}

/**
 * 홈 메인 카드 '목표 이어가기' 문구
 * - description 1줄: 지금 할 걸음 / 2줄: 목표 이름 · 몇 번째 걸음
 * - footer: 카드 진행 문구와 같음 (예: '1걸음 내디뎠어요', '2걸음 · 쉬어가는 중')
 */
export function continueCardText(summary) {
  const { goal, current, doneCount } = summary
  let line1 = '다음 걸음 받기 · 준비되면 눌러주세요'
  let line2 = `${goal.title} · 지금까지 ${doneCount}걸음`

  if (goal.resting) {
    line1 = '멈춘 걸음부터 이어할 수 있어요'
    line2 = `${goal.title} · ${doneCount + 1}번째 걸음에서 쉬어갔어요`
  } else if (current) {
    line1 = oneLine(current.action)
    line2 = `${goal.title} · ${doneCount + 1}번째 걸음`
  }

  return { description: `${line1}\n${line2}`, footer: summary.progress }
}
