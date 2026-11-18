/**
 * 걸음 API (백엔드 /api/steps, /api/goals/{id}/next-step)
 */
import { request } from './client.js'
import { mapDetail } from './goals.js'

/**
 * [해봤어요] 시도 기록 (AI 호출 없음)
 * @returns {Promise<{ isLastStep: boolean, triedCount: number }>} isLastStep이면 마무리 제안(S-04-3a), 아니면 S-04-3
 */
export async function tryStep(stepId, { signal } = {}) {
  const { result } = await request(`/api/steps/${stepId}/try`, { method: 'POST', signal })
  return { isLastStep: Boolean(result?.isLastStep), triedCount: result?.triedCount ?? 0 }
}

/**
 * [더 작게] 같은 걸음을 더 쉬운 행동으로 (AI) — 더 못 쪼개면 ApiError(code SHRINK409)
 */
export async function shrinkStep(stepId, { signal } = {}) {
  const { result } = await request(`/api/steps/${stepId}/shrink`, { method: 'POST', signal })
  return mapDetail(result)
}

/**
 * [다음 걸음 받기] 에너지를 다시 골라 다음 행동 (AI)
 * energyLevel: 1~4, 목표를 만들 때 고른 값 ±1 안에서 (벗어나면 ENERGY400)
 */
export async function requestNextStep(goalId, energyLevel, { signal } = {}) {
  const { result } = await request(`/api/goals/${goalId}/next-step`, { method: 'POST', body: { energy: energyLevel }, signal })
  return mapDetail(result)
}
