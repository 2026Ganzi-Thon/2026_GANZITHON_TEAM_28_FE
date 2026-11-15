/**
 * 걸음 관련 API
 * 지금은 mock(localStorage): 백엔드 API가 나오면 함수 안쪽만 실제 요청으로 바꾼다.
 */
import { APP_CONFIG } from './config.js'
import { MOCK_AI_DELAY_MS, MOCK_DELAY_MS, addStep } from './goals.js'
import { suggestSmaller, suggestStep } from './mockAi.js'
import { NotFoundError, updateDb, wait } from './mockStore.js'

function findStep(db, stepId) {
  const step = db.steps.find((item) => item.id === stepId)
  if (!step) throw new NotFoundError('걸음을 찾을 수 없어요')
  return step
}

function findGoal(db, goalId) {
  const goal = db.goals.find((item) => item.id === goalId)
  if (!goal) throw new NotFoundError('목표를 찾을 수 없어요')
  return goal
}

/** [해봤어요] 걸음을 done으로 */
export async function completeStep(stepId, { signal } = {}) {
  await wait(MOCK_DELAY_MS, signal)
  updateDb((db) => {
    const step = findStep(db, stepId)
    step.status = 'done'
    step.completedAt = Date.now()
  })
}

/** [쉬어가기] 걸음을 paused로 (목표 상태는 바꾸지 않음) */
export async function pauseStep(stepId, { signal } = {}) {
  await wait(MOCK_DELAY_MS, signal)
  updateDb((db) => {
    const step = findStep(db, stepId)
    step.status = 'paused'
    step.pausedAt = Date.now()
  })
}

/** [더 작게] 같은 걸음을 한 단계 더 쪼갬 (AI) */
export async function requestSmallerStep(stepId, { signal } = {}) {
  await wait(MOCK_AI_DELAY_MS, signal)
  updateDb((db) => {
    const step = findStep(db, stepId)
    step.smallerCount += 1
    const smaller = suggestSmaller(step.smallerCount)
    step.action = smaller.action
    step.description = smaller.description
    step.reason = smaller.reason
    step.smallestReached = smaller.lastOne || step.smallerCount >= APP_CONFIG.smallerMaxCount
  })
}

/**
 * [다음 걸음 받기] / [새 걸음 받기] 새 걸음을 받음 (AI)
 * energy: 바뀐 에너지 값 (S-04-3은 shiftEnergy로 계산해서 넘김)
 */
export async function requestNextStep(goalId, { energy }, { signal } = {}) {
  await wait(MOCK_AI_DELAY_MS, signal)
  updateDb((db) => {
    const goal = findGoal(db, goalId)
    goal.energy = energy
    const stepCount = db.steps.filter((step) => step.goalId === goalId).length
    addStep(db, goal, suggestStep(goal, stepCount))
  })
}

/** [어제 걸음 그대로 해보기] tried 걸음과 같은 행동을 새 걸음으로 */
export async function retryStep(stepId, { signal } = {}) {
  await wait(MOCK_DELAY_MS, signal)
  updateDb((db) => {
    const step = findStep(db, stepId)
    const goal = findGoal(db, step.goalId)
    addStep(db, goal, step)
  })
}
