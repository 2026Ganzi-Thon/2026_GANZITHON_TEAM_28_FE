/**
 * 목표 API (백엔드 /api/goals)
 * 백엔드 구조: 진행 중(IN_PROGRESS) 목표는 항상 1개, 나머지는 쉬어가는 중(RESTING).
 *   새 목표를 만들거나 쉬던 목표를 이어하면 기존 진행 중 목표는 자동으로 쉬어가기가 됨.
 *   진행 중 + 쉬어가는 목표가 최대 개수(maxGoalCount)면 GOAL409_1.
 * 화면에서 쓰기 쉽게 백엔드 응답(Detail)을 아래 모양으로 바꿔서 돌려줌:
 *   { goal: { id, title, status, resting, energy, burden, energyLevel, burdenLevel, triedCount },
 *     step: { id, action, description, reason, smallerCount, smallestReached, ... } | null,
 *     doneCount, steps }
 */
import { request } from './client.js'
import { BURDEN_OPTIONS, ENERGY_OPTIONS, levelOf, valueOfLevel } from './goalOptions.js'
import { recentRecordItems } from './records.js'

// 백엔드 상태 → 화면 상태 (active·completed·released)
const STATUS = { IN_PROGRESS: 'active', RESTING: 'active', COMPLETED: 'completed', STOPPED: 'released' }

// 백엔드가 행동 설명을 주지 않아 피그마 문구로 보여줌 (S-04 / S-04-2)
const DESCRIPTION_DEFAULT = '1분이면 충분해요.\n완벽하게 하지 않아도 괜찮아요.'
const DESCRIPTION_SMALLEST = '이것도 버겁게 느껴진다면,\n오늘은 쉬어가는 것도 좋은 선택이에요.'

/** 백엔드 Detail → 화면용 모양 */
export function mapDetail(detail) {
  const doneCount = detail.triedCount ?? 0
  const current = detail.currentStep
  return {
    goal: {
      id: String(detail.goalId),
      title: detail.goalContent,
      status: STATUS[detail.goalStatus] ?? 'active',
      resting: detail.goalStatus === 'RESTING',
      energyLevel: detail.energyLevel,
      burdenLevel: detail.burdenLevel,
      energy: valueOfLevel(ENERGY_OPTIONS, detail.energyLevel),
      burden: valueOfLevel(BURDEN_OPTIONS, detail.burdenLevel),
      triedCount: doneCount,
    },
    step: current
      ? {
          id: String(current.stepId),
          action: current.content,
          reason: current.reason,
          description: current.canShrinkMore === false ? DESCRIPTION_SMALLEST : DESCRIPTION_DEFAULT,
          sequence: current.sequence,
          smallerCount: current.shrinkLevel ?? 0,
          smallestReached: current.canShrinkMore === false,
          isLastStep: Boolean(current.isLastStep),
          energyLevel: current.energy,
        }
      : null,
    doneCount,
    // 강서현 화면(S-07 등)이 걸음 목록으로 '해봤어요' 수를 세서, 같은 수만큼 채워 둠
    steps: Array.from({ length: doneCount }, () => ({ status: 'done' })),
  }
}

/**
 * 홈(S-02): 진행 중 목표 1개(없으면 null) + 쉬어가는 목표 목록 + 개수
 * @returns {Promise<{ inProgress: ReturnType<typeof mapDetail> | null, resting: Array, activeCount: number, maxCount: number }>}
 */
export async function getHome({ signal } = {}) {
  const { result } = await request('/api/goals', { signal })
  return {
    inProgress: result.inProgressGoal ? mapDetail(result.inProgressGoal) : null,
    resting: (result.restingGoals ?? []).map((item) => ({
      goal: {
        id: String(item.goalId),
        title: item.content,
        status: 'active',
        resting: true,
        triedCount: item.triedCount ?? 0,
        restedAt: item.restedAt ? Date.parse(item.restedAt) : null,
      },
      step: null,
      doneCount: item.triedCount ?? 0,
    })),
    activeCount: result.activeGoalCount ?? 0,
    maxCount: result.maxGoalCount ?? 3,
  }
}

/** S-03에서 G-04 안내를 띄울지: 진행 중 + 쉬어가는 목표 수와 최대 개수 */
export async function getGoalLimit({ signal } = {}) {
  const { activeCount, maxCount } = await getHome({ signal })
  return { activeCount, maxCount }
}

/**
 * 목표 생성(S-03) — AI 첫 걸음까지 응답 (몇 초 걸림)
 * - 위기 신호면 목표를 저장하지 않고 { crisis: true } → S-08
 * - 개수 초과면 ApiError(code GOAL409_1)
 */
export async function createGoal({ title, energy, burden }, { signal } = {}) {
  const { result, code } = await request('/api/goals', {
    method: 'POST',
    body: { content: title, energyLevel: levelOf(ENERGY_OPTIONS, energy), burdenLevel: levelOf(BURDEN_OPTIONS, burden) },
    signal,
  })
  if (code === 'CRISIS200' || result?.isCrisis) return { crisis: true }
  return mapDetail(result)
}

/**
 * 목표 상세(S-04 등). 마무리한 목표면 행동 기록에서 시작일·종료일·쉬어간 횟수를 채움 (C-01 통계용)
 */
export async function getGoal(goalId, { signal } = {}) {
  const { result } = await request(`/api/goals/${goalId}`, { signal })
  const data = mapDetail(result)
  if (data.goal.status !== 'active') await fillFinishedInfo(data, { signal })
  return data
}

async function fillFinishedInfo(data, { signal }) {
  try {
    const items = (await recentRecordItems({ signal })).filter((item) => String(item.goalId) === data.goal.id)
    if (items.length === 0) return
    const times = items.map((item) => Date.parse(item.createdAt)).sort((a, b) => a - b)
    data.goal.createdAt = times[0]
    data.goal.finishedAt = times.at(-1)
    // 쉬어간 기록을 걸음 목록에 붙여 둠 (goalMetrics가 pausedAt으로 셈)
    items
      .filter((item) => item.type === 'REST')
      .forEach((item) => data.steps.push({ status: 'paused', pausedAt: Date.parse(item.createdAt) }))
  } catch {
    // 통계를 못 채워도 화면은 보여줌
  }
}

/** 쉬던 목표 이어하기(S-02-1) — 기존 진행 중 목표는 자동으로 쉬어가기 */
export async function resumeGoal(goalId, { signal } = {}) {
  const { result } = await request(`/api/goals/${goalId}/resume`, { method: 'POST', signal })
  return mapDetail(result)
}

/** 쉬어가기(S-04b → S-05) */
export async function restGoal(goalId, { signal } = {}) {
  await request(`/api/goals/${goalId}/rest`, { method: 'PATCH', signal })
}

/** 목표 종료(S-07): type 'COMPLETED' | 'STOPPED' */
export async function endGoal(goalId, type, { signal } = {}) {
  const { result } = await request(`/api/goals/${goalId}/end`, { method: 'PATCH', body: { type }, signal })
  return { id: String(result.goalId), status: STATUS[result.goalStatus] ?? 'active' }
}
