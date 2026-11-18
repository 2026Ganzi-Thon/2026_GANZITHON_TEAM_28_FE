import { recentRecordItems } from './records.js'

// 행동 기록 화면은 해봤어요(done)·쉬어가기(paused)만 보여줌
const ENTRY_STATUS = { TRY: 'done', REST: 'paused' }

/** S-06. 목표가 종료돼도 걸음 기록은 유지한다. 백엔드 GET /api/records (최근 3달) */
export async function listHistory({ signal } = {}) {
  const items = await recentRecordItems({ signal })
  const entries = items
    .filter((item) => ENTRY_STATUS[item.type])
    .map((item) => ({
      id: String(item.activityId),
      goalId: String(item.goalId),
      goalTitle: item.goalContent ?? '나의 목표',
      action: item.stepContent ?? '',
      status: ENTRY_STATUS[item.type],
      recordedAt: Date.parse(item.createdAt),
    }))
    .sort((a, b) => b.recordedAt - a.recordedAt)
  return { entries }
}
