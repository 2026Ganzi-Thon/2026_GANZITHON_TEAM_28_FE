import { listGoals } from './goals.js'
import { readDb } from './mockStore.js'

/** S-06. 목표가 종료·삭제되어도 걸음 기록은 유지한다. */
export async function listHistory({ signal } = {}) {
  // 기존 API에서 오래된 pending 걸음을 정리한 뒤 같은 저장소를 읽는다.
  await listGoals({ signal })
  const db = readDb()
  const entries = db.steps.filter((step) => step.status !== 'pending').map((step) => ({
    ...step,
    goalTitle: db.goals.find((goal) => goal.id === step.goalId)?.title ?? '나의 목표',
    recordedAt: step.status === 'done' ? (step.completedAt ?? step.createdAt)
      : step.status === 'paused' ? (step.pausedAt ?? step.createdAt)
        : (step.triedAt ?? step.createdAt),
  })).sort((a, b) => b.recordedAt - a.recordedAt)
  return { entries }
}
