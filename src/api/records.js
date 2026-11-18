/**
 * 행동 기록 API (백엔드 GET /api/records?month=YYYY-MM) — S-06 행동 기록, C-01 통계
 * 한 달치를 날짜별로 묶어서 줌 (기록 있는 날만)
 * Item.type: SHRINK(더 작게) · TRY(해봤어요) · REST(쉬어가기) · RESUME(이어하기) · COMPLETE · STOP
 */
import { request } from './client.js'

export function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** 한 달치 기록을 펼친 목록으로 */
export async function getMonthRecordItems(month, { signal } = {}) {
  const { result } = await request('/api/records', { query: { month }, signal })
  return (result?.days ?? []).flatMap((day) => day.records ?? [])
}

/** 이번 달부터 거슬러 몇 달치 기록 (기본 3달) */
export async function recentRecordItems({ months = 3, signal } = {}) {
  const now = new Date()
  const keys = Array.from({ length: months }, (_, index) => monthKey(new Date(now.getFullYear(), now.getMonth() - index, 1)))
  const lists = await Promise.all(keys.map((key) => getMonthRecordItems(key, { signal })))
  return lists.flat()
}
