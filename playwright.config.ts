import { defineConfig, devices } from '@playwright/test'

const PORT = 4184

export default defineConfig({
  testDir: './e2e',
  // 소프트웨어 WebGL로 3D를 그리므로 한 테스트에 넉넉한 시간
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    launchOptions: {
      // CI에는 GPU가 없으므로 소프트웨어 WebGL을 씀
      // (--ignore-gpu-blocklist를 더하면 워커의 OffscreenCanvas WebGL이 크게 느려짐)
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /offline\.spec/,
    },
    // 오프라인 검사도 3D를 처음부터 불러와 무거우므로, 시간이 빠듯한 다른 흐름 테스트와 겹치지 않게 그 뒤에 돌림
    {
      name: 'offline',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /offline\.spec/,
      dependencies: ['chromium'],
    },
  ],
  // 프로덕션 빌드 결과를 띄워 검사 (먼저 pnpm build 필요)
  webServer: {
    // preview 스크립트의 --port 4183과 겹치지 않게 Vite를 바로 부름
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
})
