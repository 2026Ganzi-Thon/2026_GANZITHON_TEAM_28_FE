/**
 * 목표 관련 API
 * 지금은 mock: 백엔드 API가 나오면 함수 안쪽만 실제 요청으로 바꾼다.
 * (API 기본 주소는 환경 변수로 분리할 예정)
 */

// mock 응답이 오기까지 걸리는 시간. 8초·15초 상태를 확인하려면 잠깐 늘려서 테스트
const MOCK_DELAY_MS = 2500

let mockGoalSeq = 0

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
    })
  })
}

/**
 * 새 목표를 만들고 AI 첫 걸음을 받는다 (S-03 → S-04)
 * @param {{ title: string, energy: string, burden: string }} input
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ id: string, title: string, energy: string, burden: string, status: 'active' }>}
 */
export async function createGoal({ title, energy, burden }, { signal } = {}) {
  await wait(MOCK_DELAY_MS, signal)
  mockGoalSeq += 1
  return { id: `mock-${mockGoalSeq}`, title, energy, burden, status: 'active' }
}
