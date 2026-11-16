import { josa } from './text'

describe('조사', () => {
  it('받침이 있으면 앞의 것, 없으면 뒤의 것을 붙인다', () => {
    expect(josa('청룡', '과와')).toBe('청룡과')
    expect(josa('주작', '과와')).toBe('주작과')
    expect(josa('기린', '을를')).toBe('기린을')
    expect(josa('해태', '을를')).toBe('해태를')
    expect(josa('아펩', '이가')).toBe('아펩이')
    expect(josa('불사조', '이가')).toBe('불사조가')
    expect(josa('노란 옷의 왕', '은는')).toBe('노란 옷의 왕은')
  })
})
