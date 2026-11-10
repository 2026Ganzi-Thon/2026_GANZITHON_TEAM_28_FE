# 1mm 화면 목록과 페이지 경로 초안

피그마 화면 ID를 기준으로 정리했다. `goalId`는 목표의 식별자다.

| 피그마 ID | 화면 | 경로 초안 |
| --- | --- | --- |
| S-00 | 로그인 | `/login` |
| S-01 | 시작 및 닉네임 입력 | `/onboarding` |
| S-01-1 | AI 이용 안내 및 동의 | `/onboarding/ai-consent` |
| S-02 | 홈 | `/` |
| S-03 | 새 목표 | `/goals/new` |
| S-04 | AI 행동 제안 | `/goals/:goalId/action` |
| S-05 | 쉬어가기 | `/goals/:goalId/pause` |
| S-06 | 행동 기록 | `/history` |
| S-07 | 목표 종료 | `/goals/:goalId/end` |
| S-08 | 위기 상황 안내 | `/support` |
| S-09 | 설정 및 닉네임 수정 | `/settings` |

기록 날짜 선택(S-06-1, S-06-2), 로딩, 입력 오류, 확인 다이얼로그, 토스트는 해당 페이지 안의 상태로 관리한다.

MVP는 로그인 후 이용할 수 있다. 첫 로그인 시 닉네임 입력과 AI 이용 동의를 거쳐 홈으로 이동한다.
