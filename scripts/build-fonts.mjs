/**
 * 한글 웹 폰트 만들기: `pnpm fonts` (확인만: `pnpm fonts --check`)
 *
 * scripts/fonts/config.json에 적은 원본 글꼴에서 굵기마다 두 가지를 만듭니다.
 *
 * 1. 화면 글자 파일 `<slug>/<slug>-<굵기>-ui.woff2`
 *    소스의 문자열·JSX 글자에 쓰인 한글·기호만 담습니다. `<slug>.css`에 들어가 첫 화면 CSS와 함께 받습니다.
 * 2. 조각 파일 `<slug>/<slug>-<굵기>-<번호>.woff2`
 *    Google Fonts 한국어 글꼴과 같은 글자 묶음(최대 124조각)으로 나눈 파일입니다. `<slug>-rest.css`에 들어가
 *    첫 화면 뒤에 붙고, 1에 없는 글자(사용자가 입력한 글자 등)를 쓸 때 그 글자가 든 조각만 받습니다.
 *
 * 화면 글자가 바뀌면 다시 실행합니다. `--check`는 1에 빠진 글자가 있으면 실패합니다(단위 테스트에서 씀).
 * 조각 파일은 글자가 바뀌어도 그대로라 없는 것만 만듭니다. 원본 글꼴을 바꿨으면 `--all`로 모두 다시 만듭니다.
 *
 * 제목에만 쓰는 글꼴처럼 일부 자리에만 쓰는 글꼴은 글꼴마다 `text`로 담을 글자를 좁힙니다.
 * - `messages`: 그 파일에서 고른 키(예: 'page.status')의 문자열
 * - `props`: `scan`의 소스에서 고른 속성(예: name)에 적힌 문자열(자료에서 오는 천체 이름 등)
 * - `extra`: 따로 더할 글자
 * 이런 글꼴은 `rest: false`로 조각 파일을 만들지 않습니다. 제목 글자가 모두 1에 들어 있고,
 * `--check`가 빠진 글자를 잡기 때문입니다. `hangulOnly: true`면 한글만 담아, 기호·영문은 다음 글꼴이 그립니다.
 *
 * `restOnly`(설정 맨 위)에 적은 파일의 고른 속성(예: 우주적 존재의 전승 설명 lore)은 1에 담지 않습니다.
 * 첫 화면에 나오지 않는 긴 설명 때문에 모든 화면 글자 파일이 커지지 않게 하고, 그 글자는 2의 조각으로 그립니다.
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fontverter from 'fontverter'
import { Blob, Face } from 'harfbuzzjs'
import subsetFont from 'subset-font'
import ts from 'typescript'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFile(path.join(ROOT, file), 'utf8')
const config = JSON.parse(await read('scripts/fonts/config.json'))
const SLICES = JSON.parse(await read('scripts/fonts/ko-slices.json'))
const CHECK = process.argv.includes('--check')
const ALL = process.argv.includes('--all')
const OUT = path.join(ROOT, config.outDir)
const HEADER = '/* pnpm fonts로 만든 파일입니다. 직접 고치지 마세요. */\n'

/** 'U+ac00-ac0f, U+ac11' 같은 unicode-range를 코드 포인트 집합으로 */
function parseRange(text) {
  const set = new Set()
  for (const part of text.split(',')) {
    const [a, b] = part.trim().replace(/^U\+/i, '').split('-')
    if (!a) continue
    const lo = parseInt(a.replaceAll('?', '0'), 16)
    const hi = parseInt((b ?? a).replaceAll('?', 'f'), 16)
    for (let c = lo; c <= hi; c++) set.add(c)
  }
  return set
}

/** 코드 포인트 집합을 이어진 구간으로 묶은 unicode-range로 */
function toRange(set) {
  const cps = [...set].sort((x, y) => x - y)
  const out = []
  for (let i = 0; i < cps.length; i++) {
    let j = i
    while (j + 1 < cps.length && cps[j + 1] === cps[j] + 1) j++
    const hex = (c) => c.toString(16)
    out.push(i === j ? `U+${hex(cps[i])}` : `U+${hex(cps[i])}-${hex(cps[j])}`)
    i = j
  }
  return out.join(', ')
}

async function* walk(dir) {
  if (!(await stat(dir)).isDirectory()) {
    yield dir
    return
  }
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (file !== OUT && entry.name !== 'node_modules') yield* walk(file)
    } else yield file
  }
}

/** 조각으로만 그릴 속성: 파일(ROOT 기준) → 속성 이름 */
const REST_ONLY = new Map(
  (config.restOnly?.files ?? []).map((file) => [
    path.join(ROOT, file),
    new Set(config.restOnly.props),
  ]),
)

/** 화면에 나올 수 있는 글자: 코드의 문자열·템플릿·JSX 글자와 JSON 등 자료 파일의 글자(주석은 뺌) */
async function screenText() {
  const parts = [config.extra ?? '']
  for (const dir of config.scan) {
    for await (const file of walk(path.join(ROOT, dir))) {
      if (/\.(test|spec|stories)\.[jt]sx?$/.test(file)) continue
      if (/\.[cm]?[jt]sx?$/.test(file)) {
        const text = await readFile(file, 'utf8')
        const kind = /x$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS
        const source = ts.createSourceFile(
          file,
          text,
          ts.ScriptTarget.Latest,
          false,
          kind,
        )
        const skip = REST_ONLY.get(file)
        const visit = (node) => {
          if (
            skip &&
            ts.isPropertyAssignment(node) &&
            ts.isIdentifier(node.name) &&
            skip.has(node.name.text)
          )
            return
          if (
            ts.isStringLiteralLike(node) ||
            ts.isTemplateHead(node) ||
            ts.isTemplateMiddle(node) ||
            ts.isTemplateTail(node) ||
            ts.isJsxText(node)
          )
            parts.push(node.text)
          ts.forEachChild(node, visit)
        }
        visit(source)
      } else if (file.endsWith('.json')) {
        // 이스케이프된 글자(\ud7a3 등)도 풀어서 세도록 문자열 값을 모음
        const text = await readFile(file, 'utf8')
        const collect = (value) => {
          if (typeof value === 'string') parts.push(value)
          else if (value && typeof value === 'object')
            for (const item of Object.values(value)) collect(item)
        }
        try {
          collect(JSON.parse(text))
        } catch {
          parts.push(text)
        }
      } else if (
        new RegExp(`\\.(${config.dataExtensions.join('|')})$`).test(file)
      ) {
        parts.push(await readFile(file, 'utf8'))
      }
    }
  }
  return toCodePoints(parts)
}

/** 한글 자모·음절(호환 자모, 확장 자모 포함) */
const isHangul = (cp) =>
  (cp >= 0x1100 && cp <= 0x11ff) ||
  (cp >= 0x3130 && cp <= 0x318f) ||
  (cp >= 0xa960 && cp <= 0xa97f) ||
  (cp >= 0xac00 && cp <= 0xd7a3) ||
  (cp >= 0xd7b0 && cp <= 0xd7ff)

function toCodePoints(parts) {
  const set = new Set()
  for (const ch of parts.join('')) {
    const cp = ch.codePointAt(0)
    // 영문·숫자(ASCII)는 영문 글꼴이 맡음
    if (cp > 0x7e) set.add(cp)
  }
  return set
}

async function parseSource(file) {
  const kind = /x$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  return ts.createSourceFile(
    file,
    await readFile(file, 'utf8'),
    ts.ScriptTarget.Latest,
    false,
    kind,
  )
}

/** 노드 아래의 문자열 리터럴을 모두 모음 */
function stringsIn(node, parts) {
  if (
    ts.isStringLiteralLike(node) ||
    ts.isTemplateHead(node) ||
    ts.isTemplateMiddle(node) ||
    ts.isTemplateTail(node)
  )
    parts.push(node.text)
  ts.forEachChild(node, (child) => stringsIn(child, parts))
}

const propertyName = (node) =>
  node.name && (ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name))
    ? node.name.text
    : undefined

/** 글꼴마다 `text`로 고른 자리의 글자(제목 글꼴 등) */
async function pickedText(spec) {
  const parts = [spec.extra ?? '']
  if (spec.messages) {
    const keys = new Set(spec.messages.keys)
    const found = new Set()
    const visit = (node) => {
      const name = ts.isPropertyAssignment(node)
        ? propertyName(node)
        : undefined
      if (name && keys.has(name)) {
        found.add(name)
        stringsIn(node.initializer, parts)
      }
      ts.forEachChild(node, visit)
    }
    visit(await parseSource(path.join(ROOT, spec.messages.file)))
    const lack = [...keys].filter((key) => !found.has(key))
    if (lack.length)
      throw new Error(`${spec.messages.file}에 없는 키: ${lack.join(', ')}`)
  }
  if (spec.props) {
    const names = new Set(spec.props.names)
    for (const dir of spec.props.scan) {
      for await (const file of walk(path.join(ROOT, dir))) {
        if (/\.(test|spec|stories)\.[jt]sx?$/.test(file)) continue
        if (!/\.[cm]?[jt]sx?$/.test(file)) continue
        const visit = (node) => {
          const name = ts.isPropertyAssignment(node)
            ? propertyName(node)
            : undefined
          if (name && names.has(name)) stringsIn(node.initializer, parts)
          ts.forEachChild(node, visit)
        }
        visit(await parseSource(file))
      }
    }
  }
  return toCodePoints(parts)
}

function cmapOf(sfnt) {
  const face = new Face(new Blob(sfnt), 0)
  const set = new Set(face.collectUnicodes())
  return set
}

const fontFace = (family, weight, url, range) =>
  `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;` +
  `src:url('${url}') format('woff2');unicode-range:${range}}`

const screen = await screenText()
const missing = []
let checked = 0

for (const font of config.fonts) {
  const { family, slug } = font
  const picked = font.text ? await pickedText(font.text) : screen
  const wanted = font.hangulOnly
    ? new Set([...picked].filter(isHangul))
    : picked
  const withRest = font.rest !== false
  const dir = path.join(OUT, slug)
  await mkdir(dir, { recursive: true })
  const uiRules = []
  const restRules = []
  const existingUi =
    CHECK && existsSync(path.join(OUT, `${slug}.css`))
      ? await readFile(path.join(OUT, `${slug}.css`), 'utf8')
      : ''

  for (const [weight, src] of Object.entries(font.weights)) {
    const original = await readFile(path.join(ROOT, src))
    const cmap = cmapOf(await fontverter.convert(original, 'sfnt'))
    const ui = new Set([...wanted].filter((cp) => cmap.has(cp)))

    if (CHECK) {
      // CSS의 unicode-range와 실제 화면 글자 파일의 글자 목록을 모두 확인
      const rule = existingUi
        .split('\n')
        .find((line) => line.includes(`font-weight:${weight};`))
      const declared = rule
        ? parseRange(rule.match(/unicode-range:([^}]+)/)[1])
        : new Set()
      const uiPath = path.join(dir, `${slug}-${weight}-ui.woff2`)
      if (!existsSync(uiPath)) {
        missing.push(
          `${family} ${weight}: ${path.relative(ROOT, uiPath)} 파일이 없습니다`,
        )
        continue
      }
      const inFile = cmapOf(
        await fontverter.convert(await readFile(uiPath), 'sfnt'),
      )
      const lack = [...ui].filter((cp) => !declared.has(cp) || !inFile.has(cp))
      if (lack.length)
        missing.push(`${family} ${weight}: ${String.fromCodePoint(...lack)}`)
      checked = Math.max(checked, ui.size)
      continue
    }

    const uiName = `${slug}-${weight}-ui.woff2`
    const uiFont = await subsetFont(original, String.fromCodePoint(...ui), {
      targetFormat: 'woff2',
    })
    await writeFile(path.join(dir, uiName), uiFont)
    uiRules.push(fontFace(family, weight, `./${slug}/${uiName}`, toRange(ui)))

    for (const [index, range] of withRest ? SLICES.entries() : []) {
      const inFont = [...parseRange(range)].filter((cp) => cmap.has(cp))
      if (!inFont.length) continue
      const name = `${slug}-${weight}-${String(index).padStart(3, '0')}.woff2`
      if (ALL || !existsSync(path.join(dir, name))) {
        const piece = await subsetFont(
          original,
          String.fromCodePoint(...inFont),
          { targetFormat: 'woff2' },
        )
        await writeFile(path.join(dir, name), piece)
      }
      // 화면 글자 파일에 있는 글자는 빼서, 같은 글자를 두 파일에서 받지 않게 함
      const rest = new Set(inFont.filter((cp) => !ui.has(cp)))
      if (rest.size)
        restRules.push({
          index,
          weight,
          rule: fontFace(family, weight, `./${slug}/${name}`, toRange(rest)),
        })
    }
    console.log(
      `${family} ${weight}: 화면 글자 ${ui.size}자 (${(uiFont.length / 1024).toFixed(1)}KB)`,
    )
  }

  if (CHECK) continue
  await writeFile(
    path.join(OUT, `${slug}.css`),
    HEADER + uiRules.join('\n') + '\n',
  )
  // 같은 조각 번호의 굵기들을 이웃하게 두어 gzip이 반복되는 unicode-range를 줄이게 함
  restRules.sort(
    (a, b) => a.index - b.index || Number(a.weight) - Number(b.weight),
  )
  if (withRest)
    await writeFile(
      path.join(OUT, `${slug}-rest.css`),
      HEADER + restRules.map((r) => r.rule).join('\n') + '\n',
    )
}

if (CHECK) {
  if (missing.length) {
    console.error(
      `화면 글자 파일에 없는 글자가 있습니다. pnpm fonts로 다시 만드세요.\n${missing.join('\n')}`,
    )
    process.exit(1)
  }
  console.log(`OK: 화면 글자 ${checked}자가 모두 화면 글자 파일에 있습니다.`)
}
