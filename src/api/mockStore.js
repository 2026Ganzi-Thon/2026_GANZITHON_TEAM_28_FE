/**
 * mock 저장소 (백엔드 API가 나오기 전까지만 사용)
 * 목표·걸음을 localStorage에 저장해서 새로고침해도 남게 한다.
 * 실제 API로 바꿀 때 이 파일은 지운다.
 */
const STORAGE_KEY = '1mm.mock.v1'

function emptyDb() {
  return { seq: 0, goals: [], steps: [] }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : emptyDb()
  } catch {
    return emptyDb()
  }
}

function save(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // 저장 공간이 막힌 환경(시크릿 모드 등)에서는 저장 없이 진행
  }
}

/** db를 읽어 fn으로 바꾸고 저장한 뒤, fn의 결과를 돌려줌 */
export function updateDb(fn) {
  const db = load()
  const result = fn(db)
  save(db)
  return result
}

export function nextId(db, prefix) {
  db.seq += 1
  return `${prefix}-${db.seq}`
}

/** 네트워크 지연 흉내. signal로 취소할 수 있음 */
export function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
    })
  })
}

export class NotFoundError extends Error {
  constructor(message = '찾을 수 없어요') {
    super(message)
    this.name = 'NotFoundError'
  }
}
