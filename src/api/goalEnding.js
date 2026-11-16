import { MOCK_DELAY_MS } from './goals.js'
import { NotFoundError, updateDb, wait } from './mockStore.js'

/** 같은 마무리 요청은 기존 결과를 보존한다. */
export async function finishGoal(goalId, status, { signal } = {}) {
  if (!['completed', 'released'].includes(status)) throw new Error('마무리 방법을 골라 주세요')
  await wait(MOCK_DELAY_MS, signal)
  return updateDb((db) => {
    const goal = db.goals.find((item) => item.id === goalId)
    if (!goal || goal.status === 'deleted') throw new NotFoundError('목표를 찾을 수 없어요')
    if (goal.status !== 'active') return { ...goal }
    goal.status = status
    goal.finishedAt = Date.now()
    db.steps.filter((step) => step.goalId === goalId && step.status === 'pending').forEach((step) => {
      step.status = 'tried'
      step.triedAt = goal.finishedAt
    })
    return { ...goal }
  })
}

export function goalMetrics(goal, steps) {
  const started = new Date(goal.createdAt)
  const finished = new Date(goal.finishedAt ?? Date.now())
  const startDay = Date.UTC(started.getFullYear(), started.getMonth(), started.getDate())
  const finishDay = Date.UTC(finished.getFullYear(), finished.getMonth(), finished.getDate())
  return {
    count: steps.filter((step) => step.status === 'done').length,
    days: Math.max(1, Math.round((finishDay - startDay) / 86400000) + 1),
    pausedDays: new Set(steps.filter((step) => step.pausedAt).map((step) => new Date(step.pausedAt).toDateString())).size,
  }
}
