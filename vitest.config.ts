import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

/** 로직 계층(궤도 계산, N체, 재해·구조물 규칙, 직렬화·공유 링크)이 지켜야 할 커버리지 */
const LOGIC = { lines: 80, statements: 80, branches: 80, functions: 80 }

export default defineConfig({
  plugins: [solid()],
  resolve: { tsconfigPaths: true },
  css: { transformer: 'lightningcss' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,stories}.{ts,tsx}', 'src/**/*.d.ts'],
      reporter: ['text-summary', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      thresholds: {
        // 전체: 기준선(2026-11-27 측정값). 이보다 내려가면 실패하고, 올라가면 숫자를 올립니다
        lines: 62.1,
        statements: 63.2,
        branches: 56.9,
        functions: 72,
        // 궤도 계산
        'src/pages/universe/model/solar/{kepler,ephemeris}.ts': LOGIC,
        // N체
        'src/pages/universe/model/hazards/nbody.ts': LOGIC,
        // 재해·구조물 규칙
        'src/pages/universe/model/hazards/*.ts': LOGIC,
        'src/pages/universe/model/projects/*.ts': LOGIC,
        'src/pages/universe/model/world/actions.ts': LOGIC,
        // 직렬화·공유 링크
        'src/pages/universe/model/world/snapshot.ts': LOGIC,
      },
    },
  },
})
