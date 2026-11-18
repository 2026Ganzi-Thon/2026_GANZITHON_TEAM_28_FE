/**
 * 백엔드 요청 공통 함수
 * - 기본 주소: VITE_API_BASE_URL (로컬은 .env.local, Vercel은 빈 값 → 상대경로 /api)
 * - 모든 요청에 X-User-Id 헤더 (POST /api/users로 받은 userId)
 * - 응답 형식 { isSuccess, code, message, result } 에서 result만 돌려줌
 * - 실패하면 ApiError(code, status) — 화면에서 code로 구분 (예: GOAL409_1, SHRINK409)
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const USER_ID_KEY = '1mm.userId'

export class ApiError extends Error {
  constructor(message, { code, status } = {}) {
    super(message || '요청에 실패했어요')
    this.name = status === 404 ? 'NotFoundError' : 'ApiError'
    this.code = code
    this.status = status
  }
}

export function getUserId() {
  try {
    return localStorage.getItem(USER_ID_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setUserId(userId) {
  try {
    if (userId) localStorage.setItem(USER_ID_KEY, String(userId))
    else localStorage.removeItem(USER_ID_KEY)
  } catch {
    // 저장 공간이 막힌 환경에서는 저장 없이 진행
  }
}

/**
 * @param {string} path 예: '/api/goals'
 * @param {{ method?: string, body?: unknown, query?: Record<string, string>, signal?: AbortSignal }} [options]
 * @returns {Promise<{ result: any, code: string }>}
 */
export async function request(path, { method = 'GET', body, query, signal } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  Object.entries(query ?? {}).forEach(([key, value]) => url.searchParams.set(key, value))

  const headers = { Accept: 'application/json' }
  const userId = getUserId()
  if (userId) headers['X-User-Id'] = userId
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('서버에 연결하지 못했어요', { code: 'NETWORK', status: 0 })
  }

  const data = await response.json().catch(() => null)

  // 저장된 userId가 없거나 유효하지 않음 → 시작 화면으로
  if (response.status === 401) {
    setUserId('')
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/onboarding')) {
      window.location.assign('/login')
    }
    throw new ApiError(data?.message ?? '다시 시작해 주세요', { code: data?.code, status: 401 })
  }

  if (!response.ok || data?.isSuccess === false) {
    throw new ApiError(data?.message, { code: data?.code, status: response.status })
  }
  return { result: data?.result, code: data?.code }
}
