import { defineConfig, devices } from '@playwright/test'
import type { Project } from '@playwright/test'

// 다른 서버와 겹치면 E2E_PORT로 빈 포트를 고름
const PORT = Number(process.env.E2E_PORT ?? 4184)
// 시각 회귀는 기준 그림을 만든 Playwright 공식 Docker 이미지 안에서만 돌림(scripts/visual.sh가 VISUAL=1)
const VISUAL = process.env.VISUAL === '1'
const visualProjects: Project[] = VISUAL
  ? [
      {
        name: 'visual',
        use: { ...devices['Desktop Chrome'], serviceWorkers: 'block' },
        testMatch: /visual\.spec/,
      },
    ]
  : []

export default defineConfig({
  testDir: './e2e',
  // 소프트웨어 WebGL로 3D를 그리므로 한 테스트에 넉넉한 시간
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // 시각 회귀 기준 그림: 운영체제 이름을 붙이지 않음(Linux Docker 이미지에서만 만들고 비교)
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      // 소프트웨어 렌더링의 안티에일리어싱 차이만 허용
      maxDiffPixelRatio: 0.002,
    },
  },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    launchOptions: {
      // CI에는 GPU가 없으므로 소프트웨어 WebGL을 씀
      // (--ignore-gpu-blocklist를 더하면 워커의 OffscreenCanvas WebGL이 크게 느려짐)
      args: [
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        // 포트폴리오라 외부가 끊겨도 화면이 떠야 함: localhost 밖 주소는 모두 찾지 못하게 막음
        // (요청 가로채기보다 가벼움. 나간 요청은 e2e/helpers.ts의 test가 모아 실패시킴)
        '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      // 흐름 테스트에서는 서비스 워커를 켜지 않음(설치 때 미리 받기가 시간이 빠듯한 테스트와 겹치지 않게).
      // 서비스 워커는 offline 프로젝트가 확인
      use: { ...devices['Desktop Chrome'], serviceWorkers: 'block' },
      testIgnore: /(offline|visual|performance)\.spec/,
    },
    // 오프라인 검사도 3D를 처음부터 불러와 무거우므로, 시간이 빠듯한 다른 흐름 테스트와 겹치지 않게 그 뒤에 돌림
    {
      name: 'offline',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /offline\.spec/,
      dependencies: ['chromium'],
    },
    // Web Vitals와 반응 시간: 다른 테스트와 겹치면 느려지므로 맨 뒤에 혼자 돌림
    {
      name: 'performance',
      use: { ...devices['Desktop Chrome'], serviceWorkers: 'block' },
      testMatch: /performance\.spec/,
      dependencies: ['offline'],
    },
    ...visualProjects,
  ],
  // 프로덕션 빌드 결과를 띄워 검사 (먼저 pnpm build 필요)
  webServer: {
    // preview 스크립트의 --port 4183과 겹치지 않게 Vite를 바로 부름
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
})
