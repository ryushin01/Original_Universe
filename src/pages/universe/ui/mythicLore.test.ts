import { loadLore } from './mythicLore'

describe('전승 설명 받기', () => {
  it('한 번 받은 설명은 다시 받지 않고 같은 것을 돌려준다', async () => {
    const first = await loadLore()
    expect(first['ra'].ko).toMatch(/아펩/)
    expect(await loadLore()).toBe(first)
  })
})
