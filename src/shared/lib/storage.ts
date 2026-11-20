/**
 * 옛 키에 저장된 값을 새 키로 옮기고 옛 키를 지웁니다. 새 키에 이미 값이 있으면 새 값을 그대로 둡니다.
 * 이름을 바꾼 뒤(Universe Simulator → Original Universe)에도 저장 목록·언어 설정을 이어 쓰려고 씁니다.
 * 저장소를 쓸 수 없거나(사생활 보호 모드 등) 새 키에 쓰지 못하면 옛 값을 지우지 않습니다.
 */
export function moveStorageKey(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
  from: string,
  to: string,
) {
  try {
    const old = storage.getItem(from)
    if (old === null) return
    if (storage.getItem(to) === null) storage.setItem(to, old)
    storage.removeItem(from)
  } catch {
    // 옮기지 못하면 옛 값을 그대로 둠
  }
}
