// 커버리지 요약(coverage/coverage-summary.json)을 마크다운 표로 만듭니다.
// CI에서는 $GITHUB_STEP_SUMMARY에 덧붙여 실행 요약 화면에 보이고, 로컬에서는 화면에 찍습니다.
import { appendFile, readFile } from 'node:fs/promises'

const METRICS = ['lines', 'statements', 'branches', 'functions']
const LABELS = {
  lines: '줄',
  statements: '문장',
  branches: '분기',
  functions: '함수',
}

// vitest.config.ts의 로직 계층 묶음과 같게 둠
const GROUPS = [
  ['궤도 계산', /model\/solar\/(kepler|ephemeris)\.ts$/],
  ['N체', /model\/hazards\/nbody\.ts$/],
  [
    '재해·구조물 규칙',
    /model\/(hazards\/[^/]+|projects\/[^/]+|world\/actions)\.ts$/,
  ],
  ['직렬화·공유 링크', /model\/world\/snapshot\.ts$/],
]

const summary = JSON.parse(
  await readFile(
    new URL('../coverage/coverage-summary.json', import.meta.url),
    'utf8',
  ),
)

function aggregate(pattern) {
  const sums = Object.fromEntries(
    METRICS.map((m) => [m, { covered: 0, total: 0 }]),
  )
  for (const [file, data] of Object.entries(summary)) {
    if (file === 'total' || !pattern.test(file)) continue
    for (const m of METRICS) {
      sums[m].covered += data[m].covered
      sums[m].total += data[m].total
    }
  }
  return Object.fromEntries(
    METRICS.map((m) => [
      m,
      sums[m].total ? (100 * sums[m].covered) / sums[m].total : 100,
    ]),
  )
}

const row = (name, pct) =>
  `| ${name} | ${METRICS.map((m) => `${pct[m].toFixed(2)}%`).join(' | ')} |`

const total = Object.fromEntries(METRICS.map((m) => [m, summary.total[m].pct]))
const lines = [
  '### 커버리지',
  '',
  `| 범위 | ${METRICS.map((m) => LABELS[m]).join(' | ')} |`,
  `| --- | ${METRICS.map(() => '---:').join(' | ')} |`,
  row('**전체**', total),
  ...GROUPS.map(([name, pattern]) => row(name, aggregate(pattern))),
  '',
  '로직 계층은 80% 이상, 전체는 `vitest.config.ts`의 기준선 이상이어야 통과합니다.',
  '',
]
const markdown = lines.join('\n')

if (process.env.GITHUB_STEP_SUMMARY)
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`)
console.log(markdown)
