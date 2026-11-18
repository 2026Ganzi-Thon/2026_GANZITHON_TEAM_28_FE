/**
 * 사용자 API (백엔드: POST /api/users, GET·PATCH /api/users/me)
 * - 시작하기(S-01): createUser(닉네임) → userId를 저장해 이후 모든 요청 헤더(X-User-Id)에 씀
 * - 닉네임은 화면에서 바로 쓰도록 localStorage '1mm.nickname'에도 같이 저장 (홈 인사말·설정)
 */
import { getUserId, request, setUserId } from './client.js'

const NICKNAME_KEY = '1mm.nickname'

function saveLocalNickname(nickname) {
  try {
    localStorage.setItem(NICKNAME_KEY, nickname)
  } catch {
    // 저장 공간이 막힌 환경에서는 무시
  }
}

/** 시작하기(S-01): 사용자를 만들고 userId·닉네임 저장 */
export async function createUser(nickname) {
  const { result } = await request('/api/users', { method: 'POST', body: { nickname } })
  setUserId(result.userId)
  saveLocalNickname(result.nickname ?? nickname)
  return result
}

/** 닉네임 수정(S-09) */
export async function updateNickname(nickname) {
  const { result } = await request('/api/users/me', { method: 'PATCH', body: { nickname } })
  saveLocalNickname(result.nickname ?? nickname)
  return result
}

/** 재방문 시 저장된 userId가 유효한지 확인 (401이면 client가 시작 화면으로 보냄) */
export async function getMe({ signal } = {}) {
  const { result } = await request('/api/users/me', { signal })
  saveLocalNickname(result.nickname)
  return result
}

/** 시작한 사용자인지 (userId가 저장돼 있는지) */
export function hasUser() {
  return Boolean(getUserId())
}

/** @returns {Promise<string>} 닉네임 (없으면 빈 문자열) — 저장된 값을 먼저 쓰고, 없으면 서버에서 */
export async function getNickname() {
  try {
    const saved = (localStorage.getItem(NICKNAME_KEY) ?? '').trim()
    if (saved || !hasUser()) return saved
  } catch {
    return ''
  }
  try {
    return (await getMe()).nickname ?? ''
  } catch {
    return ''
  }
}
