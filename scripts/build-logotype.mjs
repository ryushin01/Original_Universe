/**
 * 인트로 로고 만들기: `pnpm logotype`
 *
 * scripts/fonts/herr-von-muellerhoff/의 필기체(Alejandro Paul, SIL OFL 1.1)로 'Original Universe'를
 * 짜서(HarfBuzz) 글자 윤곽을 SVG 경로 하나로 합쳐 src/shared/ui/logotype/paths.ts에 씁니다.
 * 글꼴 파일은 배포하지 않고 글자 모양만 그림으로 씁니다(예약 글꼴 이름이 있는 OFL 글꼴이라 고친 글꼴을
 * 내보내지 않음). 로고 글자를 바꾸면 다시 실행합니다.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Blob, Buffer, Face, Font, shape } from 'harfbuzzjs'

const TEXT = 'Original Universe'
const root = fileURLToPath(new URL('..', import.meta.url))
const FONT = `${root}scripts/fonts/herr-von-muellerhoff/HerrVonMuellerhoff-Regular.ttf`
const OUT = `${root}src/shared/ui/logotype/paths.ts`
/** 윤곽 둘레의 여백 (글꼴 단위, 1em = 1000) */
const PAD = 12
/** 띄어쓰기에 더하는 간격: 필기체의 U 꼬리가 앞 낱말에 붙어 한 낱말처럼 읽히지 않게 */
const WORD_GAP = 300

const face = new Face(new Blob(await readFile(FONT)), 0)
const font = new Font(face)
const buffer = new Buffer()
buffer.addText(TEXT)
buffer.guessSegmentProperties()
shape(font, buffer)

/** 경로 명령을 [명령, 숫자들]로 나눔 (HarfBuzz는 절대 좌표 M·L·Q·C·Z만 씀) */
function parse(path) {
  const out = []
  for (const [, command, args] of path.matchAll(/([MLQCZ])([^MLQCZ]*)/g))
    out.push([
      command,
      args.match(/-?\d*\.?\d+(?:e-?\d+)?/g)?.map(Number) ?? [],
    ])
  return out
}

// 글자마다 펜 위치만큼 옮기고 y를 뒤집음(글꼴은 위가 +, SVG는 아래가 +)
const glyphs = []
let pen = 0
for (const g of buffer.getGlyphInfosAndPositions()) {
  const ox = pen + g.xOffset
  const oy = g.yOffset
  const commands = parse(font.glyphToPath(g.codepoint)).map(([c, n]) => [
    c,
    n.map((v, i) => (i % 2 === 0 ? v + ox : -(v + oy))),
  ])
  glyphs.push(commands)
  pen += g.xAdvance + (TEXT[g.cluster] === ' ' ? WORD_GAP : 0)
}

let minX = Infinity
let minY = Infinity
let maxX = -Infinity
let maxY = -Infinity
for (const commands of glyphs)
  for (const [, n] of commands)
    for (let i = 0; i < n.length; i += 2) {
      minX = Math.min(minX, n[i])
      maxX = Math.max(maxX, n[i])
      minY = Math.min(minY, n[i + 1])
      maxY = Math.max(maxY, n[i + 1])
    }

const path = glyphs
  .flat()
  .map(
    ([c, n]) =>
      c +
      n
        .map((v, i) => Math.round(v - (i % 2 === 0 ? minX : minY) + PAD))
        .join(' '),
  )
  .join('')
const width = Math.ceil(maxX - minX + PAD * 2)
const height = Math.ceil(maxY - minY + PAD * 2)

await writeFile(
  OUT,
  `// pnpm logotype(scripts/build-logotype.mjs)로 만든 파일입니다. 손으로 고치지 마세요.
// '${TEXT}' 글자 윤곽: Herr Von Muellerhoff(Alejandro Paul, SIL OFL 1.1)

export const LOGOTYPE_WIDTH = ${width}
export const LOGOTYPE_HEIGHT = ${height}
export const LOGOTYPE_PATH =
  '${path}'
`,
)
console.log(`${OUT}: ${width}×${height}, 경로 ${path.length}자`)
