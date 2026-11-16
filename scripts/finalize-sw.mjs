// 빌드한 서비스 워커(dist/client/sw.js)에 지금 묶음의 해시 파일 목록과 텍스처 해시를 넣습니다.
// 새 서비스 워커가 켜질 때 이 목록에 없는 옛 코드 파일과 바뀐 텍스처 캐시를 지웁니다.
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'

const client = new URL('../dist/client/', import.meta.url)
const swPath = new URL('sw.js', client)
const PLACEHOLDER = "/* SW_MANIFEST */ { assets: [], textures: 'dev' }"

const assets = (await readdir(new URL('assets/', client)))
  .filter((name) => !name.endsWith('.map'))
  .sort()
  .map((name) => `assets/${name}`)

// 텍스처는 이름에 해시가 없으므로 이름과 내용으로 해시를 만듦
const hash = createHash('sha256')
for (const name of (await readdir(new URL('textures/', client))).sort()) {
  hash.update(name)
  hash.update(await readFile(new URL(`textures/${name}`, client)))
}
const textures = hash.digest('hex').slice(0, 12)

const source = await readFile(swPath, 'utf8')
if (!source.includes(PLACEHOLDER))
  throw new Error('sw.js에 SW_MANIFEST 자리 표시가 없습니다')
await writeFile(
  swPath,
  source.replace(
    PLACEHOLDER,
    `/* SW_MANIFEST */ ${JSON.stringify({ assets, textures })}`,
  ),
)
console.log(`sw.js: 해시 파일 ${assets.length}개, 텍스처 ${textures}`)
