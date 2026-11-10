# 1mm 프론트엔드

React, JavaScript, Vite, CSS로 구성한 초기 프로젝트입니다. 각 페이지에는 화면 이름과 경로 확인용 링크가 표시됩니다.

## 실행

Node.js 22.12 이상과 pnpm이 필요합니다.

```sh
pnpm install
pnpm dev
```

터미널에 표시되는 주소를 브라우저에서 엽니다. 빌드는 `pnpm build`, 빌드 미리보기는 `pnpm preview`로 실행합니다.

## 구조

- `src/screens/` — 화면별 폴더와 라우팅 목록
- `src/components/` — 버튼, 다이얼로그, 피드백 UI 폴더
- [화면 목록과 페이지 경로](docs/screen-routes.md)
