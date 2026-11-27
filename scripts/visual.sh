#!/usr/bin/env bash
# 시각 회귀(e2e/visual.spec.ts): 기준 그림은 Linux CI와 같은 Playwright 공식 Docker 이미지에서 만들고 비교합니다.
# - CI(이미 그 이미지 안): 바로 돌림
# - 로컬: 같은 이미지를 Docker(colima 등)로 띄워 그 안에서 설치·빌드·비교하고, 결과를 되가져옴
# 사용: pnpm check:visual            # 비교
#       pnpm check:visual --update-snapshots   # 기준 그림 다시 만들기(화면을 일부러 바꿨을 때)
set -euo pipefail

if [ -n "${CI:-}" ]; then
  VISUAL=1 exec pnpm exec playwright test --project=visual "$@"
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
version="$(node -p "require('./node_modules/@playwright/test/package.json').version")"
pnpm_version="$(node -p "require('./package.json').packageManager.split('@')[1]")"
image="mcr.microsoft.com/playwright:v${version}-noble"

if ! docker info >/dev/null 2>&1; then
  echo "Docker가 꺼져 있습니다. colima start 등으로 켠 뒤 다시 실행하세요(끝나면 colima stop)." >&2
  exit 1
fi

# 컨테이너 디스크를 쓰지 않도록 작업 폴더와 pnpm 저장소는 이 Mac의 캐시 폴더에 둠(다음 실행도 빨라짐)
cache="${HOME}/Library/Caches/original-universe-visual"
mkdir -p e2e/__screenshots__ test-results "$cache"
# 같은 작업 폴더를 쓰는 이전 실행이 남아 있으면 끝냄(두 실행이 빌드 결과를 서로 덮어쓰지 않게)
docker rm -f original-universe-visual >/dev/null 2>&1 || true
rm -rf test-results/visual-*
args="$*"
# 작업 트리를 그대로 넘기되, macOS용 node_modules와 빌드 결과는 빼고 컨테이너 안에서 새로 만듦
COPYFILE_DISABLE=1 tar --exclude=./node_modules --exclude=./dist --exclude=./.git \
  --exclude=./test-results --exclude=./playwright-report --exclude=./coverage \
  --exclude=./lhci-report --no-xattrs -cf - . 2>/dev/null |
  docker run --rm -i --ipc=host -e CI=1 --name original-universe-visual \
    -v "$root/e2e/__screenshots__:/out/screenshots" \
    -v "$root/test-results:/out/results" \
    -v "$cache:/cache" \
    "$image" bash -c "
      set -e
      rm -rf /cache/work/e2e /cache/work/src /cache/work/dist
      mkdir -p /cache/work && cd /cache/work && tar xf - 2>/dev/null
      find . -name node_modules -prune -o -name '._*' -type f -exec rm -f {} +
      npm install -g pnpm@${pnpm_version} >/dev/null 2>&1
      pnpm install --frozen-lockfile --store-dir /cache/store >/dev/null
      pnpm build:all >/dev/null
      status=0
      VISUAL=1 pnpm exec playwright test --project=visual ${args} || status=\$?
      cp -R e2e/__screenshots__/. /out/screenshots/
      cp -R test-results/. /out/results/ 2>/dev/null || true
      exit \$status
    "
