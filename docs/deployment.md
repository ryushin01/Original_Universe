# 배포

`main`에 올라가면 `.github/workflows/pages.yml`이 GitHub Pages에 배포합니다.

| 주소                                                     | 내용       |
| -------------------------------------------------------- | ---------- |
| https://ryushin01.github.io/Original_Universe/           | 시뮬레이터 |
| https://ryushin01.github.io/Original_Universe/storybook/ | Storybook  |

## 빌드 과정

`pnpm build`는 네 단계입니다.

1. `vite build`: 브라우저용 묶음 (`dist/client`)
2. `vite build --ssr src/app/entry-server.tsx --outDir dist/server`: 첫 화면을 그릴 서버 묶음
3. `node scripts/prerender.mjs`: 서버 묶음으로 그린 HTML과 hydration 스크립트를 `dist/client/index.html`에 넣고 `dist/server`를 지움
4. `node scripts/finalize-sw.mjs`: `dist/client/sw.js`에 지금 묶음의 해시 파일 목록과 텍스처 내용 해시를 넣음(아래 서비스 워커 캐시)

## 하위 경로

Pages 주소는 저장소 이름 아래(`/Original_Universe/`)라서, 빌드할 때 `BASE_PATH`로 경로 접두사를 넘깁니다.

```bash
BASE_PATH=/Original_Universe/ pnpm build:all
```

- `vite.config.ts`의 `base`가 이 값을 씁니다. 기본값은 `/`입니다.
- `index.html`의 아이콘·매니페스트는 `%BASE_URL%`, 텍스처처럼 `public`에 있는 파일은 `import.meta.env.BASE_URL`을 앞에 붙여 부릅니다(`src/shared/config`).
- 사전 렌더링한 `index.html`을 `404.html`로도 복사해, 없는 주소로 들어와도 앱이 열립니다.
- 공유 링크(`?s=`)는 현재 주소를 바탕으로 만들므로 하위 경로에서도 그대로 동작합니다.
- 서비스 워커(`public/sw.js`)는 등록 범위를 기준으로 경로를 계산하므로 하위 경로에서도 같은 파일을 씁니다.

## 서비스 워커 캐시

- 페이지는 네트워크 먼저(성공한 응답만 저장), 끊기면 저장해 둔 페이지를 씁니다.
- `assets/`(파일 이름에 해시가 붙은 코드)와 `textures/`는 캐시 먼저입니다.
- 새 서비스 워커가 켜질 때 빌드에서 넣은 목록에 없는 옛 `assets/` 파일을 지웁니다. 지우지 않으면 배포마다 바뀐 해시 파일이 쌓여 재방문 사용자의 저장 공간을 계속 차지합니다.
- 텍스처는 파일 이름에 해시가 없으므로 캐시 이름에 텍스처 내용 해시를 붙입니다(`universe-textures-<해시>`). 텍스처를 바꿔 올리면 해시가 바뀌어 옛 캐시가 지워지므로 손댈 것이 없습니다.
- 옛 버전 캐시(`universe-pages-v1`, `universe-assets-v1`)는 이름이 달라 처음 켜질 때 지워집니다.

## 검색·공유 미리보기

- `index.html`에 canonical, Open Graph(제목·설명·그림 1200×630·주소·언어), 트위터 카드를 둡니다. 주소는 운영 주소(`https://ryushin01.github.io/Original_Universe/`)로 고정입니다.
- 공유 그림 `public/og-image.jpg`는 실제 소개 화면을 찍은 것입니다. 화면이 바뀌면 `pnpm build`·`pnpm preview` 뒤 `ONLY=og BASE_URL=http://localhost:4183 pnpm screenshots`로 다시 찍습니다.
- GitHub Pages 프로젝트 사이트라 `robots.txt`는 도메인 맨 위에서만 읽힙니다. 이 저장소에는 두지 않습니다.

## 직접 실행

Actions 탭에서 **Pages** 워크플로를 고르고 **Run workflow**를 누르면 `main`을 다시 배포합니다.
