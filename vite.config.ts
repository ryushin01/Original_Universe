import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

// GitHub Pages처럼 하위 경로에 올릴 때 BASE_PATH=/Original_Universe/ 로 빌드
const base = process.env.BASE_PATH ?? '/'

// Lightning CSS 대상 브라우저 (주 버전 << 16 | 부 버전 << 8)
const targets = {
  chrome: 111 << 16,
  edge: 111 << 16,
  firefox: 113 << 16,
  safari: (16 << 16) | (4 << 8),
}

export default defineConfig({
  base,
  // 첫 화면은 빌드 때 HTML로 그려 두고(scripts/prerender.mjs) 브라우저에서 이어받음
  plugins: [solid({ ssr: true })],
  resolve: { tsconfigPaths: true },
  css: {
    transformer: 'lightningcss',
    lightningcss: { targets },
  },
  build: {
    outDir: 'dist/client',
    // 한글 글꼴 조각(대부분 4KB 미만)을 CSS에 base64로 넣지 않고 파일로 둠.
    // 넣으면 쓰지 않는 글자까지 CSS에 실림
    assetsInlineLimit: (filePath) =>
      filePath.endsWith('.woff2') ? false : undefined,
    target: 'es2022',
    cssMinify: 'lightningcss',
  },
  worker: { format: 'es' },
})
