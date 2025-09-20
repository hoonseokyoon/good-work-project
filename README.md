# 수도원·수녀원 허브 UI

Next.js(App Router) + Tailwind CSS + shadcn/ui로 제작된 수도원·수녀원 통합 정보 허브의 UI 템플릿입니다. 지도 기반 찾기, 기관 소개, 뉴스 카드, 후원/구매/참여 섹션 등 프로젝트 전반의 화면 구성을 포함합니다.

## 주요 기술 스택

- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) 구성 요소 (Button, Card, Input, Select, Badge, Tabs, Separator, Skeleton)
- Supabase 서버 클라이언트 (환경 변수가 없을 경우 mock 데이터로 동작)
- 네이버 지도 연동 컴포넌트

## 시작하기

```bash
npm install
npm run dev
```

환경 변수는 `.env` 또는 `.env.local` 파일에 다음 값을 설정합니다.

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
REVALIDATE_SECRET=
```

환경 변수를 입력하지 않으면 제공된 mock 데이터가 자동으로 사용됩니다.

## 주요 디렉터리

- `app/` – 레이아웃, 페이지, API 라우트
- `components/` – 헤더/푸터, 지도, 카드 등 UI 컴포넌트
- `components/ui/` – shadcn/ui 기반 디자인 시스템
- `components/filters/` – 지도 검색 필터 UI
- `lib/` – Supabase 서버 클라이언트, 유틸리티 함수
- `data/mock-data.ts` – 샘플 데이터셋 (Mock)

## 스크립트

- `npm run dev` – 개발 서버 실행
- `npm run build` – 프로덕션 빌드
- `npm run start` – 프로덕션 서버 실행
- `npm run lint` – ESLint 검사

## 라이선스

프로젝트 구조는 자유롭게 수정하여 사용하세요.
