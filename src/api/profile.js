import { createUser, hasUser, updateNickname } from './user.js'

export { getNickname } from './user.js'

const NICKNAME_KEY = '1mm.nickname'
const CONSENT_KEY = '1mm.consent'

/** 기존 홈 화면이 읽는 닉네임 저장 키와 맞춘다. */
export async function saveNickname(nickname) {
  const value = nickname.trim()
  if (!value) throw new Error('닉네임을 입력해 주세요')
  // 처음이면 백엔드 사용자 생성(userId 발급), 이미 있으면 닉네임만 수정
  if (hasUser()) await updateNickname(value)
  else await createUser(value)
  localStorage.setItem(NICKNAME_KEY, value)
}

export function getAiConsent() {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) ?? 'null')
  } catch {
    return null
  }
}

export async function saveAiConsent(optional) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ required: true, optional, agreedAt: Date.now() }))
}
