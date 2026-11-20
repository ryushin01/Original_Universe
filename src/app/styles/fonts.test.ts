import { execFileSync } from 'node:child_process'

describe('한글 웹 폰트', () => {
  it('화면 글자 파일에 소스의 한글·기호가 모두 들어 있다 (빠졌으면 pnpm fonts)', () => {
    const output = execFileSync(
      'node',
      ['scripts/build-fonts.mjs', '--check'],
      {
        encoding: 'utf8',
      },
    )
    expect(output).toContain('OK')
    // 소스 전체를 읽어 글꼴을 확인하므로 기계가 바쁘면 기본 5초를 넘김
  }, 30_000)
})
