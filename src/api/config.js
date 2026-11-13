/**
 * 서버 설정값 (핸드오프 노트: 하드코딩 금지)
 * 지금은 기본값만 두고, 백엔드 API가 나오면 서버에서 받아온 값으로 바꾼다.
 */
export const APP_CONFIG = {
  goalMaxChars: 50, // 목표 입력 최대 글자 수
  aiLoadingSlowMs: 8000, // 이 시간이 지나면 로딩 문구 교체 (E-03a)
  aiLoadingTimeoutMs: 15000, // 이 시간이 지나면 오류 모달 (E-04)
}
