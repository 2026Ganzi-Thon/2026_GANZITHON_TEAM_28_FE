/**
 * 목표 관련 API
 * 지금은 mock(localStorage): 백엔드 API가 나오면 함수 안쪽만 실제 요청으로 바꾼다.
 * (API 기본 주소는 환경 변수로 분리할 예정)
 */
import { APP_CONFIG } from './config.js'
import { suggestStep } from './mockAi.js'
import { NotFoundError, nextId, updateDb, wait } from './mockStore.js'

// mock 응답 지연. 8초·15초 상태를 확인하려면 잠깐 늘려서 테스트
export const MOCK_AI_DELAY_MS = 2500
export const MOCK_DELAY_MS = 300

/** 걸음 하나를 만들어 db에 넣음 (mock 내부용) */
export function addStep(db, goal, content) {
  const step = {
    id: nextId(db, 'step'),
    goalId: goal.id,
    action: content.action,
    description: content.description,
    reason: content.reason,
    status: 'pending', // pending | done | paused | tried
    smallerCount: 0,
    smallestReached: false,
    createdAt: Date.now(),
    completedAt: null,
  }
  db.steps.push(step)
  return step
}

/** 핸드오프 규칙: pending 걸음이 24시간 지나면 tried (paused는 제외) */
function expireSteps(db) {
  const limit = APP_CONFIG.stepExpireHours * 60 * 60 * 1000
  db.steps.forEach((step) => {
    if (step.status === 'pending' && Date.now() - step.createdAt > limit) step.status = 'tried'
  })
}

/**
 * 새 목표를 만들고 AI 첫 걸음을 받는다 (S-03 → S-04)
 * @returns {Promise<Goal>}
 */
export async function createGoal({ title, energy, burden }, { signal } = {}) {
  await wait(MOCK_AI_DELAY_MS, signal)
  return updateDb((db) => {
    const goal = {
      id: nextId(db, 'goal'),
      title,
      energy,
      burden,
      status: 'active', // active | completed | released | deleted
      wrapUpOffered: false,
      createdAt: Date.now(),
    }
    db.goals.push(goal)
    addStep(db, goal, suggestStep(goal, 0))
    return goal
  })
}

/**
 * 목표 하나와 그 걸음 목록 (오래된 순)
 * @returns {Promise<{ goal: Goal, steps: Step[] }>}
 */
export async function getGoal(goalId, { signal } = {}) {
  await wait(MOCK_DELAY_MS, signal)
  return updateDb((db) => {
    expireSteps(db)
    const goal = db.goals.find((item) => item.id === goalId)
    if (!goal || goal.status === 'deleted') throw new NotFoundError('목표를 찾을 수 없어요')
    const steps = db.steps.filter((step) => step.goalId === goalId)
    return { goal: { ...goal }, steps: steps.map((step) => ({ ...step })) }
  })
}

/** AI 마무리 제안을 보여줬다고 기록 (목표당 1번만) */
export async function markWrapUpOffered(goalId) {
  await wait(MOCK_DELAY_MS)
  updateDb((db) => {
    const goal = db.goals.find((item) => item.id === goalId)
    if (goal) goal.wrapUpOffered = true
  })
}
