// ORIGINAL UNIVERSE 서비스 워커: 다시 방문하면 코드·텍스처를 캐시에서 바로 씁니다.
// - 페이지(HTML): 네트워크 먼저, 끊기면 캐시
// - 해시가 붙은 코드(assets/)와 텍스처(textures/)·3D 모델(models/)·아이콘: 캐시 먼저
// - 설치 때 첫 화면 코드와 나중에 부르는 코드 조각·3D 모델·텍스처·글꼴 조각·아이콘을 미리 받아 둡니다
//   (첫 방문은 서비스 워커가 켜지기 전에 파일을 받으므로, 미리 받지 않으면 인터넷과 서버가 끊긴
//   다시 방문에서 첫 화면 코드와 신화 모드 같은 지연 불러오기 화면이 비게 됨)
// - 새 버전이 켜질 때 지금 묶음에 없는 옛 코드 파일과, 바뀐 텍스처·모델 캐시를 지웁니다
//   (지우지 않으면 배포마다 옛 파일이 쌓여 저장 공간을 계속 차지함)
// - 이름을 바꾸기 전 주소(/Universe_Simulator/)에서 받아 둔 파일도 지웁니다

// 빌드 때 scripts/finalize-sw.mjs가 지금 묶음의 해시 파일 목록과 텍스처·모델 해시로 바꿉니다.
const MANIFEST = /* SW_MANIFEST */ { assets: [], textures: 'dev', models: 'dev', statics: 'dev', precache: [] }

const PAGE_CACHE = 'universe-pages'
const ASSET_CACHE = 'universe-assets'
// 텍스처는 파일 이름에 해시가 없으므로 내용 해시로 캐시를 나눔
const TEXTURE_CACHE = `universe-textures-${MANIFEST.textures}`
// 3D 모델(존재가 처음 나타날 때 받음)도 내용 해시로 나눔
const MODEL_CACHE = `universe-models-${MANIFEST.models}`
// 맨 위의 아이콘·매니페스트도 내용 해시로 나눔
const STATIC_CACHE = `universe-static-${MANIFEST.statics}`
const STATICS = new Set([
  'favicon.svg',
  'manifest.webmanifest',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
])
const CURRENT = new Set([PAGE_CACHE, ASSET_CACHE, TEXTURE_CACHE, MODEL_CACHE, STATIC_CACHE])
const SCOPE = new URL(self.registration.scope).pathname
// 한 번에 받는 파일 수 (서버·회선을 한꺼번에 붙잡지 않게)
const PRECACHE_CONCURRENCY = 6

/** 범위 안 경로(assets/…)가 담길 캐시 이름 (캐시 대상이 아니면 undefined) */
function cacheFor(path) {
  if (path.startsWith('assets/')) return ASSET_CACHE
  if (path.startsWith('textures/')) return TEXTURE_CACHE
  if (path.startsWith('models/')) return MODEL_CACHE
  if (STATICS.has(path)) return STATIC_CACHE
  return undefined
}

/**
 * 목록의 파일을 이미 없을 때만 받아 넣음. 하나가 실패해도 나머지는 받고(그 파일은 쓸 때 다시 받음),
 * 설치가 실패하지 않게 오류를 삼킴
 */
async function precache() {
  const queue = MANIFEST.precache
    .map((path) => ({ path, name: cacheFor(path) }))
    .filter((item) => item.name)
  const next = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const url = new URL(item.path, self.registration.scope).href
      const cache = await caches.open(item.name)
      if (await cache.match(url, { ignoreVary: true })) continue
      await cache.add(new Request(url, { cache: 'no-cache' })).catch(() => {})
    }
  }
  await Promise.all(Array.from({ length: PRECACHE_CONCURRENCY }, next))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(PAGE_CACHE).then((cache) => cache.add(SCOPE)),
      precache().catch(() => {}),
    ]),
  )
  self.skipWaiting()
})

/**
 * 지울 항목: 지금 범위 밖의 주소(이름을 바꾸기 전 주소에서 받은 페이지·코드·텍스처)와,
 * 지금 묶음에 없는 해시 파일 (목록이 비어 있으면 빌드 전이므로 해시 파일은 지우지 않음)
 */
function isStale(name, request, keep) {
  const { pathname } = new URL(request.url)
  if (!pathname.startsWith(SCOPE)) return true
  if (name !== ASSET_CACHE || keep.size === 0) return false
  const path = pathname.slice(SCOPE.length)
  return path.startsWith('assets/') && !keep.has(path)
}

async function pruneEntries() {
  const keep = new Set(MANIFEST.assets)
  await Promise.all(
    [...CURRENT].map(async (name) => {
      const cache = await caches.open(name)
      const requests = await cache.keys()
      await Promise.all(
        requests
          .filter((request) => isStale(name, request, keep))
          .map((request) => cache.delete(request)),
      )
    }),
  )
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // 옛 버전 이름(universe-*-v1)과 바뀐 텍스처 캐시
            .filter((key) => key.startsWith('universe-') && !CURRENT.has(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(pruneEntries)
      .catch(() => {})
      .then(() => self.clients.claim()),
  )
})

/**
 * 캐시 먼저: 없으면 받아서 넣음. 받을 때는 브라우저 HTTP 캐시를 서버와 다시 확인합니다
 * (텍스처는 이름에 해시가 없어, 바뀐 뒤에도 HTTP 캐시의 옛 파일을 새 캐시에 담을 수 있음)
 */
function cacheFirst(event, cacheName) {
  const { request } = event
  return caches.open(cacheName).then(async (cache) => {
    // 미리 받은 파일은 Origin 헤더 없이 받았으므로 Vary(Origin 등)를 보지 않고 찾음
    const cached = await cache.match(request, { ignoreVary: true })
    if (cached) return cached
    const response = await fetch(new Request(request, { cache: 'no-cache' }))
    if (response.ok)
      event.waitUntil(cache.put(request, response.clone()).catch(() => {}))
    return response
  })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return
  // Storybook은 따로 둠
  if (url.pathname.startsWith(`${SCOPE}storybook/`)) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 오프라인용 첫 화면은 정상 HTML 응답으로만 갱신
          // (없는 주소의 404.html이나, 주소창으로 직접 연 텍스처·스크립트로 덮어쓰지 않음)
          const html = (response.headers.get('content-type') ?? '').includes('text/html')
          if (response.ok && html) {
            const copy = response.clone()
            // 응답을 돌려준 뒤에도 캐시 쓰기가 끝날 때까지 서비스 워커를 살려 둠
            event.waitUntil(
              caches
                .open(PAGE_CACHE)
                .then((cache) => cache.put(SCOPE, copy))
                .catch(() => {}),
            )
          }
          return response
        })
        .catch(() => caches.match(SCOPE).then((cached) => cached ?? Response.error())),
    )
    return
  }

  const name = cacheFor(url.pathname.slice(SCOPE.length))
  if (name) event.respondWith(cacheFirst(event, name))
})
