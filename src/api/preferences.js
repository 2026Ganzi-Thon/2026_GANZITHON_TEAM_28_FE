import { request } from './client.js'
import { readDb } from './mockStore.js'

const PREFERENCES_KEY = '1mm.preferences'
const USER_ID_KEY = '1mm.userId'
const DEFAULT_REMINDER = { enabled: true, hour: 21, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] }

// 요일: 화면은 0(일)~6(토), 백엔드는 'SUN'~'SAT'
const DAY_CODES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** 알림 설정 — 백엔드 GET /api/users/me/notification ({ enabled, time 'HH:mm', days }) */
export async function getReminder({ signal } = {}) {
  try {
    const { result } = await request('/api/users/me/notification', { signal })
    // 처음 사용자는 { enabled:false, time:null, days:[] } — 켤 때 바로 쓰도록 기본 시간·요일로 채움
    const days = (result.days ?? []).map((code) => DAY_CODES.indexOf(code)).filter((day) => day >= 0)
    const [hour, minute] = String(result.time ?? '21:00').split(':').map(Number)
    return {
      enabled: Boolean(result.enabled),
      hour: Number.isFinite(hour) ? hour : DEFAULT_REMINDER.hour,
      minute: Number.isFinite(minute) ? minute : DEFAULT_REMINDER.minute,
      days: days.length ? days : [...DEFAULT_REMINDER.days],
    }
  } catch {
    // 못 불러오면 기본값으로 화면은 보여줌
    return { ...DEFAULT_REMINDER, days: [...DEFAULT_REMINDER.days] }
  }
}

export async function saveReminder(value) {
  if (value.enabled && !value.days.length) throw new Error('알림 받을 요일을 하나 이상 골라 주세요')
  const time = `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`
  await request('/api/users/me/notification', {
    method: 'PUT',
    body: { enabled: value.enabled, time, days: value.days.map((day) => DAY_CODES[day]) },
  })
}

export function getAccountSummary() {
  const db = readDb()
  return {
    goalCount: db.goals.filter((goal) => goal.status === 'active').length,
    stepCount: db.steps.filter((step) => step.status !== 'pending').length,
  }
}

export async function clearLocalRecords() {
  localStorage.removeItem('1mm.mock.v1')
}

/** 로그인 화면에서 선택한 공급자. 실제 인증 정보는 서버 연동 시 교체한다. */
export function getLoginProvider() {
  const providers = { kakao: '카카오', apple: 'Apple', google: 'Google' }
  return providers[localStorage.getItem('1mm.login.provider')] ?? ''
}

export async function leaveLocalAccount() {
  for (const key of ['1mm.mock.v1', '1mm.nickname', '1mm.consent', PREFERENCES_KEY, '1mm.login.provider', USER_ID_KEY]) {
    localStorage.removeItem(key)
  }
}

export async function exportRecords() {
  const file = new File([JSON.stringify(readDb(), null, 2)], '1mm-records.json', { type: 'application/json' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '1mm 행동 기록' })
      return true
    } catch (error) {
      if (error.name === 'AbortError') return false
    }
  }
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}

export function reminderSummary(reminder) {
  if (!reminder.enabled) return '꺼짐'
  const period = reminder.hour < 12 ? '오전' : '오후'
  const hour = reminder.hour % 12 || 12
  const minute = String(reminder.minute).padStart(2, '0')
  return `켜짐 · ${reminder.days.length === 7 ? '매일' : '주 ' + reminder.days.length + '일'} ${period} ${hour}:${minute}`
}
