// 묶음 크기 예산(brotli, size-limit 기본): 처음 넣을 때(1.13.3) 잰 값을 1KB 단위로 올린 숫자입니다.
// 넘으면 pnpm size가 실패합니다. 숫자를 올려야 하면 이유를 PR에 적습니다.
module.exports = [
  {
    name: '첫 화면 메인 스레드 JS (index·i18n·preload)',
    path: [
      'dist/client/assets/index-*.js',
      'dist/client/assets/i18n-*.js',
      'dist/client/assets/preload-helper-*.js',
    ],
    limit: '130 kB',
  },
  {
    name: '첫 화면 CSS',
    path: 'dist/client/assets/index-*.css',
    limit: '9 kB',
  },
  {
    name: '3D 렌더링 워커',
    path: 'dist/client/assets/render.worker-*.js',
    limit: '205 kB',
  },
  {
    name: '3D 엔진(워커를 못 쓸 때 메인 스레드용)',
    path: [
      'dist/client/assets/Engine-*.js',
      'dist/client/assets/three.core-*.js',
    ],
    limit: '169 kB',
  },
  {
    name: '나중에 받는 조각(전승·존재 모델·실제 모양)',
    path: [
      'dist/client/assets/lore-*.js',
      'dist/client/assets/bodies-*.js',
      'dist/client/assets/GLTFLoader-*.js',
      'dist/client/assets/SkeletonUtils-*.js',
      'dist/client/assets/meshopt_decoder.module-*.js',
      'dist/client/assets/shapeData-*.js',
    ],
    limit: '187 kB',
  },
  {
    // 1.14.0에서 별·은하 설명을 첫 화면·워커 묶음에서 떼어 이 조각으로 옮김(처음 잰 값 13.13 kB)
    name: '나중에 받는 조각(천체 설명·전승)',
    path: 'dist/client/assets/details-*.js',
    limit: '14 kB',
  },
]
