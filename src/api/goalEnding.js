import { request } from './client.js'
import { endGoal } from './goals.js'

const END_TYPE = { completed: 'COMPLETED', released: 'STOPPED' }

/** S-07 목표 마무리 — 백엔드 PATCH /api/goals/:id/end. 화면 토스트에 쓰도록 목표 이름도 돌려줌 */
export async function finishGoal(goalId, status, { signal } = {}) {
  if (!END_TYPE[status]) throw new Error('마무리 방법을 골라 주세요')
  const { result } = await request(`/api/goals/${goalId}`, { signal })
  const ended = await endGoal(goalId, END_TYPE[status], { signal })
  return { ...ended, title: result.goalContent }
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
