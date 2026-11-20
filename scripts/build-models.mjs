/**
 * 우주적 존재 3D 모델 만들기: `pnpm models` (모두 다시: `pnpm models --all`, 일부만: `pnpm models eagle wolf`)
 *
 * scripts/models/sources.json의 원본 GLB를 받아(.cache/models/) 장면에 맞게 가볍게 줄여
 * public/models/<id>.glb로 씁니다. 장면은 모델을 빛나는 면과 선(홀로그램)으로만 그리므로
 * 색·텍스처·UV·법선은 버리고 모양(위치)과 움직임(뼈대·모프)만 남깁니다.
 * (법선은 장면이 그릴 때 화면에서 면마다 구함)
 *
 * 1. 재질·텍스처·UV·정점 색·법선을 지우고 재질 하나로 묶음
 * 2. 쓰지 않는 애니메이션을 지우고 남길 것은 역할 이름(loop·attack·death)으로 바꿈
 * 3. 보이지 않는 움직임을 덜어 냄: 손가락·끝 뼈, 크기 변화, 뿌리가 아닌 뼈의 이동, 열쇠 프레임 절반.
 *    프레임마다 모프 표적을 바꾸는 모델은 `frames: n`으로 표적을 n개마다 하나만 남김
 * 4. 움직이지 않는 모델은 노드를 펴서 메시 하나로 합침
 * 5. 정점을 합치고(weld) 삼각형을 줄임(ratio)
 * 6. 양자화 + meshopt 압축 (장면은 three의 MeshoptDecoder로 풂)
 *
 * 크기·방향 맞추기는 장면이 불러올 때 합니다(ui/scene/solar/beings/models.ts).
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import {
  dedup,
  flatten,
  join,
  meshopt,
  prune,
  resample,
  simplify,
  weld,
} from '@gltf-transform/functions'
import {
  MeshoptDecoder,
  MeshoptEncoder,
  MeshoptSimplifier,
} from 'meshoptimizer'

const root = fileURLToPath(new URL('..', import.meta.url))
const { models } = JSON.parse(
  await readFile(`${root}scripts/models/sources.json`, 'utf8'),
)
const args = process.argv.slice(2)
const all = args.includes('--all')
const only = args.filter((arg) => !arg.startsWith('--'))
const unknown = only.filter((id) => !models.some((m) => m.id === id))
if (unknown.length) throw new Error(`없는 모델: ${unknown.join(', ')}`)

await Promise.all([
  MeshoptDecoder.ready,
  MeshoptEncoder.ready,
  MeshoptSimplifier.ready,
])
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  })

/** 남길 정점 속성 (모양과 뼈대) */
const KEEP = new Set(['POSITION', 'JOINTS_0', 'WEIGHTS_0'])
/** 장면 크기에서 보이지 않는 작은 뼈 (손가락, 끝 표시 뼈) */
const SMALL_BONES = /thumb|index|middle|ring|pinky|finger|_end$/i
/** 열쇠 프레임을 줄일 만큼 긴 움직임 */
const MIN_KEYS_TO_HALVE = 10

/** 원본 받기 (한 번 받으면 .cache에 둠) */
async function source(model) {
  const dir = `${root}.cache/models`
  const file = `${dir}/${model.id}.glb`
  if (existsSync(file)) return file
  await mkdir(dir, { recursive: true })
  const response = await fetch(model.file)
  if (!response.ok) throw new Error(`${model.id}: 받기 실패 ${response.status}`)
  await writeFile(file, new Uint8Array(await response.arrayBuffer()))
  return file
}

/** 보이지 않는 움직임을 덜어 내고, 긴 움직임은 열쇠 프레임을 하나 걸러 남김 */
function trimAnimations(doc) {
  const docRoot = doc.getRoot()
  const joints = new Set(docRoot.listSkins().flatMap((s) => s.listJoints()))
  const isTop = (node) => !joints.has(node.getParentNode())
  for (const animation of docRoot.listAnimations()) {
    for (const channel of animation.listChannels()) {
      const node = channel.getTargetNode()
      const path = channel.getTargetPath()
      if (!node || path === 'weights') continue
      if (
        SMALL_BONES.test(node.getName()) ||
        path === 'scale' ||
        (path === 'translation' && !isTop(node))
      )
        channel.dispose()
    }
    const used = new Set(animation.listChannels().map((c) => c.getSampler()))
    for (const sampler of animation.listSamplers()) {
      if (!used.has(sampler)) {
        sampler.dispose()
        continue
      }
      const input = sampler.getInput()
      const output = sampler.getOutput()
      const count = input.getCount()
      // 모프 무게(키마다 여러 값)와 곡선 보간은 그대로
      if (
        sampler.getInterpolation() !== 'LINEAR' ||
        count < MIN_KEYS_TO_HALVE ||
        output.getCount() !== count
      )
        continue
      const keep = []
      for (let i = 0; i < count; i += 2) keep.push(i)
      if (keep.at(-1) !== count - 1) keep.push(count - 1)
      const size = output.getElementSize()
      const times = new Float32Array(keep.length)
      const values = new Float32Array(keep.length * size)
      const element = []
      keep.forEach((k, j) => {
        times[j] = input.getScalar(k)
        output.getElement(k, element)
        values.set(element, j * size)
      })
      sampler.setInput(
        doc
          .createAccessor()
          .setType('SCALAR')
          .setArray(times)
          .setBuffer(input.getBuffer()),
      )
      sampler.setOutput(
        doc
          .createAccessor()
          .setType(output.getType())
          .setArray(values)
          .setBuffer(output.getBuffer()),
      )
    }
  }
}

/**
 * 프레임마다 모프 표적 하나를 켜는 움직임(Google Data Arts Team 모델)에서
 * 표적을 step개마다 하나만 남기고, 움직임도 남은 표적의 열쇠 프레임만 둠
 */
function thinMorphFrames(doc, step) {
  const docRoot = doc.getRoot()
  const kept = new Map()
  for (const mesh of docRoot.listMeshes()) {
    const prims = mesh.listPrimitives()
    const count = prims[0]?.listTargets().length ?? 0
    if (!count) continue
    const keep = []
    for (let i = 0; i < count; i += step) keep.push(i)
    const weights = mesh.getWeights()
    for (const prim of prims)
      prim.listTargets().forEach((target, i) => {
        if (keep.includes(i)) return
        prim.removeTarget(target)
        target.dispose()
      })
    mesh.setWeights(keep.map((i) => weights[i] ?? 0))
    kept.set(count, keep)
  }
  for (const animation of docRoot.listAnimations())
    for (const channel of animation.listChannels()) {
      if (channel.getTargetPath() !== 'weights') continue
      const sampler = channel.getSampler()
      const input = sampler.getInput()
      const output = sampler.getOutput()
      const keys = input.getCount()
      const targets = output.getCount() / keys
      const keep = kept.get(targets)
      if (!keep) continue
      const values = output.getArray()
      const times = []
      const next = []
      for (let k = 0; k < keys; k++) {
        // 이 열쇠 프레임에서 켜진 표적이 남는 표적일 때만 남김
        let top = 0
        for (let t = 1; t < targets; t++)
          if (values[k * targets + t] > values[k * targets + top]) top = t
        if (!keep.includes(top)) continue
        times.push(input.getScalar(k))
        for (const t of keep) next.push(values[k * targets + t])
      }
      sampler.setInput(
        doc
          .createAccessor()
          .setType('SCALAR')
          .setArray(new Float32Array(times))
          .setBuffer(input.getBuffer()),
      )
      sampler.setOutput(
        doc
          .createAccessor()
          .setType('SCALAR')
          .setArray(new Float32Array(next))
          .setBuffer(output.getBuffer()),
      )
    }
}

function countTriangles(docRoot) {
  let triangles = 0
  for (const mesh of docRoot.listMeshes())
    for (const prim of mesh.listPrimitives())
      triangles +=
        (prim.getIndices()?.getCount() ??
          prim.getAttribute('POSITION').getCount()) / 3
  return triangles
}

async function build(model) {
  const doc = await io.read(await source(model))
  const docRoot = doc.getRoot()

  // 1. 재질 하나, 모양 속성만
  const material = doc.createMaterial('hologram')
  for (const mesh of docRoot.listMeshes())
    for (const prim of mesh.listPrimitives()) {
      prim.setMaterial(material)
      for (const semantic of prim.listSemantics())
        if (!KEEP.has(semantic)) prim.setAttribute(semantic, null)
      for (const target of prim.listTargets())
        for (const semantic of target.listSemantics())
          if (semantic !== 'POSITION') target.setAttribute(semantic, null)
    }
  for (const texture of docRoot.listTextures()) texture.dispose()
  for (const other of docRoot.listMaterials())
    if (other !== material) other.dispose()

  // 2. 애니메이션: 역할 이름으로
  const roles = Object.entries(model.clips)
  for (const animation of docRoot.listAnimations()) {
    const role = roles.find(([, name]) => name === animation.getName())?.[0]
    if (role) {
      animation.setName(role)
      continue
    }
    // 애니메이션만 지우면 채널·샘플러가 남아 자료를 붙잡으므로 함께 지움
    for (const channel of animation.listChannels()) channel.dispose()
    for (const sampler of animation.listSamplers()) sampler.dispose()
    animation.dispose()
  }
  const kept = docRoot.listAnimations().map((a) => a.getName())
  const missing = roles.filter(([role]) => !kept.includes(role))
  if (missing.length)
    throw new Error(`${model.id}: 애니메이션 없음 ${missing.map(([, n]) => n)}`)

  // 3. 보이지 않는 움직임 덜기
  trimAnimations(doc)
  if (model.frames) thinMorphFrames(doc, model.frames)

  const skinned = docRoot.listSkins().length > 0
  const morphed = docRoot
    .listMeshes()
    .some((mesh) => mesh.listPrimitives().some((p) => p.listTargets().length))
  await doc.transform(dedup(), prune())

  // 4. 움직이지 않는 모델은 메시 하나로
  if (!skinned && !morphed) await doc.transform(flatten(), join())
  else await doc.transform(join())

  // 5. 정점 합치기, 삼각형 줄이기 (모프 모델은 이미 가벼워 그대로)
  await doc.transform(weld())
  const original = countTriangles(docRoot)
  if (model.ratio && !morphed)
    await doc.transform(
      simplify({
        simplifier: MeshoptSimplifier,
        ratio: model.ratio,
        error: 0.01,
      }),
    )
  await doc.transform(resample(), dedup(), prune())

  // 6. 양자화 + 압축 (압축하며 바꾼 자료의 옛 사본도 지움)
  await doc.transform(
    meshopt({ encoder: MeshoptEncoder, level: 'high' }),
    prune(),
  )

  const out = `${root}public/models/${model.id}.glb`
  await mkdir(`${root}public/models`, { recursive: true })
  await io.write(out, doc)

  const triangles = countTriangles(docRoot)
  const size = (await stat(out)).size
  console.log(
    `${model.id.padEnd(11)} ${String(original).padStart(6)} → ${String(triangles).padStart(5)}각형 ${(size / 1024).toFixed(1).padStart(6)}KB ${kept.join(',')}`,
  )
}

for (const model of models) {
  if (only.length && !only.includes(model.id)) continue
  const out = `${root}public/models/${model.id}.glb`
  if (!all && !only.length && existsSync(out)) continue
  await build(model)
}
