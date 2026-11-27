// 빌드한 서비스 워커(dist/client/sw.js)에 지금 묶음의 해시 파일 목록과 텍스처·3D 모델·아이콘 해시,
// 설치 때 미리 받아 둘 파일 목록을 넣습니다.
// 새 서비스 워커가 켜질 때 이 목록에 없는 옛 코드 파일과 바뀐 텍스처·모델 캐시를 지웁니다.
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'

const client = new URL('../dist/client/', import.meta.url)
const swPath = new URL('sw.js', client)
const PLACEHOLDER =
  "/* SW_MANIFEST */ { assets: [], textures: 'dev', models: 'dev', statics: 'dev', precache: [] }"

const assets = (await readdir(new URL('assets/', client)))
  .filter((name) => !name.endsWith('.map'))
  .sort()
  .map((name) => `assets/${name}`)

const listFolder = async (folder) =>
  (await readdir(new URL(`${folder}/`, client)))
    .sort()
    .map((name) => `${folder}/${name}`)

// 맨 위의 아이콘·매니페스트(설치한 앱 아이콘, 오프라인으로 다시 열 때 탭 아이콘). sw.js의 STATICS와 같게 둠
const STATICS = [
  'favicon.svg',
  'manifest.webmanifest',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
]

// 텍스처·3D 모델·아이콘은 이름에 해시가 없으므로 파일 이름과 내용으로 해시를 만듦
async function filesHash(paths) {
  const hash = createHash('sha256')
  for (const path of paths) {
    hash.update(path)
    hash.update(await readFile(new URL(path, client)))
  }
  return hash.digest('hex').slice(0, 12)
}
const textureFiles = await listFolder('textures')
const modelFiles = await listFolder('models')
const textures = await filesHash(textureFiles)
const models = await filesHash(modelFiles)
const statics = await filesHash(STATICS)

// 설치 때 미리 받아 둘 파일: 처음 방문에서 서비스 워커가 켜지기 전에 받은 첫 화면 코드와,
// 나중에야 부르는 코드 조각(신화 모드·실제 모양 모델 등)·3D 모델·텍스처·글꼴 조각을 모두 받아 두어
// 인터넷과 서버가 모두 끊긴 다시 방문에서도 모든 화면이 뜨게 함.
// 나머지 한글 조각(freesentation-rest)도 사건 기록·신화 해설 같은 바뀌는 글에 쓰이므로 함께 받음
const precache = [...assets, ...textureFiles, ...modelFiles, ...STATICS]

const source = await readFile(swPath, 'utf8')
if (!source.includes(PLACEHOLDER))
  throw new Error('sw.js에 SW_MANIFEST 자리 표시가 없습니다')
await writeFile(
  swPath,
  source.replace(
    PLACEHOLDER,
    `/* SW_MANIFEST */ ${JSON.stringify({ assets, textures, models, statics, precache })}`,
  ),
)
console.log(
  `sw.js: 해시 파일 ${assets.length}개, 미리 받기 ${precache.length}개, 텍스처 ${textures}, 모델 ${models}, 아이콘 ${statics}`,
)
