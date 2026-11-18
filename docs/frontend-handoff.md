# 1mm 프론트엔드 통합

## 실행과 빌드

```sh
pnpm install
pnpm dev
pnpm build
```

기본 주소 `/`가 통합 홈입니다. 진입 파일은 `index.html`이 불러오는 `src/app.jsx`입니다. 팀원의 화면·공통 컴포넌트·API 파일을 가져와 사용하며 통합을 위해 공용 `index.html`의 스크립트 경로를 변경했습니다.

## 화면 경로

| 경로 | 화면 |
| --- | --- |
| `/` | 홈 |
| `/login` | 로그인 |
| `/onboarding` | 닉네임 입력 |
| `/onboarding/ai-consent` | AI 이용 안내 및 동의 |
| `/goals/new` | 목표 입력 |
| `/goals/:goalId/action` | 행동 제안 및 걸음 완료 |
| `/goals/:goalId/pause` | 쉬어가기 |
| `/goals/:goalId/end` | 목표 마무리 |
| `/goals/:goalId/completed` | 목표 완료 결과 |
| `/history` | 행동 기록 |
| `/garden` | 정원 |
| `/garden/archive` | 지난 정원 |
| `/settings` | 설정 |
| `/settings/withdrawal` | 계정 탈퇴 |
| `/settings/reminder` | 알림 설정 |
| `/support` | 위기 상황 안내 |

운영 호스팅에서는 위 경로를 직접 열거나 새로고침할 때 `index.html`로 돌아오도록 SPA fallback을 설정해야 합니다.

## 서버 연동 인계

이번 작업 범위는 프론트 화면 통합입니다. 테스트용 사용자·목표 데이터를 생성하거나 주입하지 않습니다. 데이터는 기존 팀원 API 계층과 사용자가 입력한 브라우저 저장 값을 사용합니다.

기존 `src/api/goals.js`, `steps.js`, `user.js` 및 mock 저장소는 팀원 파일을 유지한 상태입니다. 서버 연동 담당자는 이 계층을 실제 요청으로 교체해야 합니다. 추가 화면의 연결 지점은 `profile.js`, `history.js`, `goalEnding.js`, `garden.js`, `preferences.js`입니다.

로그인 버튼은 선택한 공급자를 전달하는 `LoginPage.jsx`의 `continueLogin`에서 실제 소셜 인증 시작 및 세션 복구를 연결해야 합니다. 현재 단계의 버튼 동작은 닉네임·동의 상태에 따른 화면 전환입니다. 실제 인증·서버 탈퇴·사용자별 접근 제어·백그라운드 알림 전송은 서버 연동 범위입니다.

약관·개인정보 처리방침·문의 링크는 아직 제공되지 않아 준비 중 안내를 표시합니다. S-04-3c 첫 알림 제안은 팀원 행동 화면에 후속 연결이 필요합니다. 홈에서 기록 진입 버튼을 표시하는 조건도 기존 팀원 구현을 유지합니다.
