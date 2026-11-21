# Original Universe 에이전트 안내

## 1. 프로젝트 개요

태양계에서 우주 거대 구조까지 오가며 소행성 충돌·태양 폭풍·별 폭발·우주적 존재의 격돌을 일으키고 우주 구조물로 대응해 보는 3D 우주 시뮬레이터입니다([TerraNova](https://github.com/ryushin01/TerraNova)의 우주판).

- 화면 축: 웹 앱 하나(시뮬레이터 한 페이지)
- 운영: https://ryushin01.github.io/Original_Universe/ · Storybook: https://ryushin01.github.io/Original_Universe/storybook/
- 로그인·서버가 없어 운영 주소가 곧 공개 데모입니다.

## 2. 기술 스택과 구조

- Solid.js 1.9, Vite 8, three.js(렌더링 Web Worker + OffscreenCanvas), TypeScript 6, 빌드 때 사전 렌더링(`vite build --ssr` → `scripts/prerender.mjs`) 뒤 hydrate, 서비스 워커(`public/sw.js`)
- Feature-Sliced Design 2.1, pages-first: 한 곳에서만 쓰는 코드는 `src/pages/universe` 슬라이스(`model`·`lib`·`ui`) 안에, 여러 곳에서 쓰는 UI·유틸만 `src/shared`에 둡니다. 층 순서 `app` → `pages` → `shared`, `pnpm lint:fsd`(Steiger)로 검사합니다.
- 시뮬레이션 상태(`WorldState`)는 불변 객체이고 엔진(`tick`)은 순수 함수입니다. 화면 상태는 `model/view.ts`에 따로 둡니다.
- 자세한 내용: `docs/development.md`(구조·상태·모델·렌더링·언어·글꼴·테스트·접근성), `docs/deployment.md`, `docs/performance.md`, `docs/data-sources.md`

## 3. 설치·개발 명령

- 패키지 매니저: pnpm(`packageManager`), Node.js 26(`.nvmrc`, `engines`)

```bash
pnpm install
pnpm dev                 # 개발 서버 http://localhost:3100
pnpm build               # dist/client (사전 렌더링·서비스 워커 목록 포함)
pnpm preview             # http://localhost:4183
pnpm storybook           # http://localhost:6106
```

- 환경 변수(이름만): `BASE_PATH`(Pages 하위 경로 빌드용, 기본 `/`). 비밀값은 없습니다.
- 자료 생성 스크립트: `pnpm fonts`(화면 글자를 바꾸면 다시 실행, 원본 글꼴을 바꾸면 `pnpm fonts --all`), `pnpm icons`, `pnpm models`, `pnpm textures`, `pnpm shapes`, `pnpm logotype`, `pnpm screenshots`

## 4. 검사·테스트 명령

CI(`.github/workflows/ci.yml`)는 이 순서로 돕니다.

```bash
pnpm install --frozen-lockfile
pnpm lint                # ESLint
pnpm lint:fsd            # Steiger(FSD)
pnpm format:check        # Prettier
pnpm typecheck           # tsc --noEmit
pnpm test                # Vitest(모델·엔진·UI, 글꼴 빠진 글자 검사 포함)
pnpm build:all           # 사이트 + Storybook(dist/client/storybook)
pnpm exec playwright install --with-deps chromium
pnpm test:e2e            # Playwright: 화면 폭 넘침, axe(WCAG 2.2 AA), 키보드, 주요 흐름
pnpm lighthouse          # LHCI: 접근성 ≥ 95, 권장사항·SEO ≥ 90, CLS ≤ 0.1
```

- E2E는 GPU 없이 SwiftShader(소프트웨어 WebGL)로 돕니다.
- Storybook에는 `@storybook/addon-a11y`가 있습니다.
- **Testing Library 원칙:** 구현 세부가 아니라 사용자가 보는 동작을 검사하고, 요소는 역할·이름(`getByRole`)으로 찾습니다. 도구는 단위·컴포넌트 Vitest + `@solidjs/testing-library`(+ `user-event`, `jest-dom`), 화면 흐름 Playwright E2E, 접근성 `@axe-core/playwright`(E2E 안)와 Storybook `addon-a11y`입니다.

## 5. 코드 스타일

- **TypeScript strict**(`tsconfig.json`의 `"strict": true`)를 유지하고 `any`·`as` 단언·`@ts-ignore`는 피합니다.
- **Prettier**(`prettier.config.js`: `semi: false`, `singleQuote`, `trailingComma: all`)와 ESLint(`typescript-eslint`, `eslint-plugin-solid`)를 따릅니다. Biome는 쓰지 않습니다.
- 기존 FSD 배치를 따릅니다. 생성한 글꼴 CSS(`src/app/styles/fonts/`)와 `public/sw.js`는 Prettier 대상이 아닙니다.
- 화면 문구는 `[한국어, 영어]` 쌍(`ui/messages.ts`, `ui/panels/messages.ts`)으로 적고 `t(키, 값)`으로 씁니다. 자료 이름·설명은 `both(한국어, 영어)`로 둡니다.
- 매 프레임 바뀌는 선은 `common.ts`의 `setLine`으로 버퍼를 다시 쓰고, 끝난 사건은 `pruneFinished`로 지웁니다(상태가 워커로 매 프레임 복사됨).
- 숫자 서식: `html`의 `font-variant-numeric: lining-nums`를 덮어쓸 때는 `lining-nums tabular-nums`처럼 함께 적습니다.
- 접근성(**WCAG 2.2·KWCAG 2.2**): 네이티브 요소(`<button type="button">`, `<dialog>`)를 먼저 쓰고, 글자 대비 4.5:1 이상, 3D 장면도 키보드(화살표·`+`/`-`)와 버튼으로 조작, `:focus-visible` 초점 표시 유지, 조작 크기 24px 이상, 입력칸 레이블과 오류 연결(`aria-invalid`·`aria-describedby`), 조작 결과는 처음부터 DOM에 있는 `role="status"`(오류 경계 안내는 `role="alert"`), 탭은 APG 패턴, 보이는 글자를 접근 이름에 그대로 넣기, '동작 줄이기' 존중. 자동 검사는 axe(Playwright E2E의 WCAG 2.2 AA 규칙, Storybook `addon-a11y`)와 Lighthouse 접근성 95점 하한입니다. Solid 프로젝트라 eslint-plugin-jsx-a11y는 쓰지 않습니다(표준과 다른 점).
- 버그를 고치면 고치기 전에 실패하는 테스트를 함께 넣습니다.

## 6. Git·PR

- **흐름: GitHub Flow.** `main`에 직접 커밋·푸시하지 않고, 최신 `main`에서 브랜치를 만들어 PR로만 병합합니다.
- **브랜치 이름:** `feat/…`, `fix/…`, `refactor/…`, `docs/…`, `test/…`, `chore/…`, `release/…`(실제 예: `feat/twenty-beings`, `feat/ceres-dawn-map`).
- **커밋 메시지: Conventional Commits.** `<타입>: <한국어 요약>`, 타입은 `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `style`, `chore`, `ci`, `build`. 버전을 올린 커밋·PR 제목은 끝에 `(x.y.z)`를 붙입니다. 예: `feat: 세력전에 신적 존재를 한 편 20명까지 (1.13.0)`, `perf: 런칭 기본기 — 끝난 사건 정리, 서비스 워커 캐시, 공유 미리보기 (0.5.0)`. 문서만 바꾸면 버전 없이 `docs: …`. 호환이 깨지면 본문에 `BREAKING CHANGE:`.
- 본문은 바꾼 내용을 한국어 목록으로 적습니다.
- **작성자:** 커밋 작성자는 항상 ryushin01(`ryushin0 <141554987+ryushin01@users.noreply.github.com>`)입니다(기여자는 ryushin01만 남김). 백엔드 코드가 없는 저장소라 `Co-Authored-By` 줄은 넣지 않습니다(예전 커밋에 있던 줄은 따르지 않음).
- GitHub Actions가 커밋하는 워크플로는 작성자를 ryushin01로 설정합니다(`github-actions[bot]` 금지). Dependabot PR은 그대로 병합하지 말고 같은 변경을 ryushin01 커밋으로 다시 만들어 병합합니다.
- **버전: Semantic Versioning.** `package.json`의 `version`과 README 버전 배지를 함께 맞춥니다(지금 README 배지는 1.9.0으로 `package.json` 1.13.0보다 뒤처져 있으니 다음 버전 PR에서 맞춥니다).
- **변경 기록: Keep a Changelog 기반.** `CHANGELOG.md`(제목 `# 변경 기록`)에 최신 버전을 위에 두고 `## x.y.z - YYYY-MM-DD` 아래 요약 한 줄과 `- **주제:** 내용` 목록으로 적습니다. `[Unreleased]` 절과 추가·변경·수정·제거 소제목은 쓰지 않습니다(표준과 다른 점, 병합과 릴리스를 같은 날 해서 미출시 절이 남지 않음).
- **병합:** squash(제목 끝에 `(#번호)`). CI가 통과하면 바로 병합하고 CodeRabbit 리뷰는 기다리지 않습니다.

## 7. 배포·릴리스

- `main`에 올라가면 `.github/workflows/pages.yml`이 `BASE_PATH=/Original_Universe/ pnpm build:all`로 만들어 GitHub Pages에 배포합니다(`404.html`은 `index.html` 복사). Actions의 **Pages** 워크플로를 직접 실행해도 다시 배포합니다.
- 릴리스: 병합 뒤 `v1.13.0` 형식 태그로 GitHub 릴리스(대상은 병합 커밋 전체 SHA, 본문은 CHANGELOG 해당 절)를 만들고 `bash ~/Documents/Archive/Backup/backup.sh`로 백업합니다.
- 진행 기록: Obsidian 보관함 `Universe_Simulator v1.0.0 고도화 계획.md`(옛 이름). 소개가 크게 바뀌면 프로필 저장소 `ryushin01/ryushin01` README 표를 고칩니다.
- 공유 그림 `public/og-image.jpg`는 화면이 바뀌면 `ONLY=og BASE_URL=http://localhost:4183 pnpm screenshots`로 다시 찍습니다.

## 8. 보안·주의사항

- 비밀값과 `.env`는 커밋하지 않습니다. 서버·DB·유료 키가 없는 정적 사이트이므로 새로 넣지 않습니다.
- 하위 경로 배포라 `public` 파일은 `import.meta.env.BASE_URL`을, `index.html`은 `%BASE_URL%`을 앞에 붙여 부릅니다.
- 텍스처를 바꾸면 서비스 워커 캐시 이름이 내용 해시로 바뀌므로 따로 손댈 것이 없습니다. `assets/` 목록은 `scripts/finalize-sw.mjs`가 넣습니다.
- 작은 woff2 조각이 CSS에 base64로 들어가지 않도록 `vite.config.ts`의 `assetsInlineLimit` 설정을 유지합니다.
- 외부 자료(JPL·NASA PDS 등)의 출처와 라이선스는 `docs/data-sources.md`에 적습니다.

## 9. 공통 규칙

공통 규칙은 `~/Documents/GitHub/CLAUDE.md`에 있습니다(이 저장소 문서가 우선). 핵심:

- 답변·커밋·PR·문서·주석은 한국어로 씁니다.
- 허락을 묻지 않고 끝까지 진행한 뒤 한 번에 보고합니다(비용·비밀값·디자인 결정·되돌릴 수 없는 공개 행동은 보고만).
- 사용자의 진행 중 작업을 보호합니다. 커밋하지 않은 변경이 있으면 `git worktree add`로 따로 작업하고 끝나면 지웁니다.
- 다른 세션 공지는 ryushin01 그룹 세션에만 보냅니다.
