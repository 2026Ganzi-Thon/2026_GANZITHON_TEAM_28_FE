/**
 * 홈 목표 카드(L-01) 문구 규칙
 * ① pending(24시간 이내) → S-04 같은 걸음
 * ② tried(24시간 지남)   → S-04-3b
 * ③ done(오늘은 마무리)  → S-04-3
 * ④ paused(쉬어가는 중)  → S-04 멈춘 걸음
 * 어느 상태든 /goals/:id/action 으로 보내면 S-04가 알맞은 화면을 고름
 */

/** 'N걸음 내디뎠어요' (done만 셈). 0걸음은 실패처럼 보이지 않게 다른 문구 */
export function doneLabel(doneCount) {
  return doneCount > 0 ? `${doneCount}걸음 내디뎠어요` : '아직 첫 걸음 전이에요'
}

function oneLine(text) {
  return text.replace(/\s*\n\s*/g, ' ')
}

export function summarizeGoal({ goal, steps }) {
  const current = steps.at(-1)
  const doneCount = steps.filter((step) => step.status === 'done').length

  let next = '다음 걸음 받기 · 준비되면 눌러주세요'
  let progress = `${doneLabel(doneCount)} · 오늘은 마무리`

  if (current?.status === 'pending') {
    next = `다음 한 걸음 · ${oneLine(current.action)}`
    progress = doneLabel(doneCount)
  } else if (current?.status === 'tried') {
    next = '어제 걸음은 ‘시도했어요’로 남겨뒀어요'
    progress = `${doneLabel(doneCount)} · 새 걸음 받기`
  } else if (current?.status === 'paused') {
    next = `멈춘 걸음 · ${oneLine(current.action)}`
    progress = doneCount > 0 ? `${doneCount}걸음 · 쉬어가는 중` : '첫 걸음 전 · 쉬어가는 중'
  }

  return { goal, current, doneCount, next, progress }
}

/**
 * 홈 메인 카드 '목표 이어가기' 문구 (진행 중인 목표가 있을 때 · 가장 최근에 움직인 목표 1개)
 * - description 1줄: 지금 할 걸음 / 2줄: 목표 이름 · 몇 번째 걸음
 * - footer: 카드 진행 문구와 같음 (예: '1걸음 내디뎠어요', '2걸음 · 쉬어가는 중')
 */
export function continueCardText(summary) {
  const { goal, current, doneCount } = summary
  let line1 = '다음 걸음 받기 · 준비되면 눌러주세요'
  let line2 = `${goal.title} · 지금까지 ${doneCount}걸음`

  if (current?.status === 'pending' || current?.status === 'paused') {
    line1 = oneLine(current.action)
    line2 =
      current.status === 'paused'
        ? `${goal.title} · ${doneCount + 1}번째 걸음에서 쉬어갔어요`
        : `${goal.title} · ${doneCount + 1}번째 걸음`
  } else if (current?.status === 'tried') {
    line1 = '어제 걸음은 ‘시도했어요’로 남겨뒀어요'
    line2 = `${goal.title} · 오늘 에너지에 맞춰 새 걸음을 받아요`
  }

  return { description: `${line1}\n${line2}`, footer: summary.progress }
}
