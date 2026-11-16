// UNIVERSE SIMULATOR 서비스 워커: 다시 방문하면 코드·텍스처를 캐시에서 바로 씁니다.
// - 페이지(HTML): 네트워크 먼저, 끊기면 캐시
// - 해시가 붙은 코드(assets/)와 텍스처(textures/): 캐시 먼저
// - 새 버전이 켜질 때 지금 묶음에 없는 옛 코드 파일과, 바뀐 텍스처 캐시를 지웁니다
//   (지우지 않으면 배포마다 옛 파일이 쌓여 저장 공간을 계속 차지함)

// 빌드 때 scripts/finalize-sw.mjs가 지금 묶음의 해시 파일 목록과 텍스처 해시로 바꿉니다.
const MANIFEST = /* SW_MANIFEST */ { assets: [], textures: 'dev' }

const PAGE_CACHE = 'universe-pages'
const ASSET_CACHE = 'universe-assets'
// 텍스처는 파일 이름에 해시가 없으므로 내용 해시로 캐시를 나눔
const TEXTURE_CACHE = `universe-textures-${MANIFEST.textures}`
const CURRENT = new Set([PAGE_CACHE, ASSET_CACHE, TEXTURE_CACHE])
const SCOPE = new URL(self.registration.scope).pathname

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGE_CACHE).then((cache) => cache.add(SCOPE)))
  self.skipWaiting()
})

/** 지금 묶음에 없는 해시 파일 (목록이 비어 있으면 빌드 전이므로 지우지 않음) */
async function pruneAssets() {
  if (MANIFEST.assets.length === 0) return
  const keep = new Set(MANIFEST.assets)
  const cache = await caches.open(ASSET_CACHE)
  const requests = await cache.keys()
  await Promise.all(
    requests
      .filter((request) => {
        const path = new URL(request.url).pathname.slice(SCOPE.length)
        return path.startsWith('assets/') && !keep.has(path)
      })
      .map((request) => cache.delete(request)),
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
      .then(pruneAssets)
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
    const cached = await cache.match(request)
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

  const path = url.pathname.slice(SCOPE.length)
  if (path.startsWith('assets/')) event.respondWith(cacheFirst(event, ASSET_CACHE))
  else if (path.startsWith('textures/')) event.respondWith(cacheFirst(event, TEXTURE_CACHE))
})
