/**
 * 사용자 정보 API
 * 닉네임은 S-01(강서현 담당)에서 저장한다. 저장 방식을 맞추기 전까지는
 * localStorage '1mm.nickname'을 읽는 임시 구현 — 정해지면 함수 안쪽만 바꾼다.
 */
const NICKNAME_KEY = '1mm.nickname'

/** @returns {Promise<string>} 닉네임 (없으면 빈 문자열) */
export async function getNickname() {
  try {
    return (localStorage.getItem(NICKNAME_KEY) ?? '').trim()
  } catch {
    return ''
  }
}
