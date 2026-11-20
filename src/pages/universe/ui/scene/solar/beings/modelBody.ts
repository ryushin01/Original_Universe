/**
 * 3D 모델로 만든 몸: 깎은 면의 빛 + 그물 선 + 몸 위의 별자리 + 덧붙이는 것.
 * 뼈대 모델은 관절을 별로, 부모 관절과 잇는 선을 별자리 선으로 그리고,
 * 모프·움직임 없는 모델은 몸 위에 고르게 고른 정점을 별로 삼아 가장 짧은 선으로 잇습니다.
 * 덧붙이는 것(날개·후광 등)은 머리·등·엉덩이·꼬리 자리(뼈나 정점)를 매 프레임 따라갑니다.
 */
import {
  AnimationMixer,
  Group,
  LoopOnce,
  Matrix4,
  Mesh,
  SkinnedMesh,
  Vector3,
} from 'three'
import type { AnimationAction, Bone, Object3D } from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { Constellation, linkNearest, spreadPick } from './body'
import type { Body3D, BodyFrame } from './body'
import type { Anchor, Extra } from './bodySpecs'
import { createExtras, setMaterials } from './extras'
import { deformPoint, makeBodyMaterial, makeWireMaterial } from './hologram'
import { MODELS } from './models'
import type { ModelTemplate } from './models'

/** 별로 삼지 않을 뼈 (조종용·끝 표시·손가락·귀 같은 작은 뼈) */
const MINOR_BONE =
  /pole|^ik|target|^ffb?\.|_end$|thumb|index|middle|ring|pinky|finger|ear\d|tongue|mouth|eye|^root$|^pt\./i
/** 모프·움직임 없는 모델에 놓을 별 수 */
const VERTEX_STARS = 22
/** 자리마다 찾을 뼈 이름 (앞의 것부터) */
const ANCHOR_BONES: Record<Anchor, RegExp[]> = {
  head: [/^head$/i, /head/i, /neck/i],
  back: [/^spine2$/i, /chest/i, /^torso$/i, /spine1/i, /thorax/i, /^body$/i],
  hips: [/^hips$/i, /hips|pelvis/i, /^body$/i],
  tail: [/tail/i],
}

const tmp = new Vector3()
const toPose = new Matrix4()
const meshToPose = new Matrix4()

export interface ModelBodyOptions {
  color: string
  /** 반지름 안에서 더 크게 */
  scale?: number
  extras?: Extra[]
  /** 같은 모델을 몇 겹 더 돌려 겹쳐 그릴지 (여러 팔·얼굴처럼 보이게, 각도 도) */
  ghosts?: number[]
  /** 처음 움직임 위치를 정하는 씨앗 (같은 모델 둘이 똑같이 움직이지 않게) */
  seed?: number
}

interface Rig {
  root: Object3D
  mixer: AnimationMixer
  loop?: AnimationAction
  meshes: Mesh[]
}

/** 정점 자리 고르기: 맞춘 공간의 쉬는 자세에서 */
function vertexAnchor(rest: Float32Array, count: number, name: Anchor) {
  let best = 0
  let bestScore = -Infinity
  let zMin = Infinity
  let zMax = -Infinity
  for (let i = 0; i < count; i++) {
    zMin = Math.min(zMin, rest[i * 3 + 2])
    zMax = Math.max(zMax, rest[i * 3 + 2])
  }
  const zMid = (zMin + zMax) / 2
  for (let i = 0; i < count; i++) {
    const y = rest[i * 3 + 1]
    const z = rest[i * 3 + 2]
    const score =
      name === 'head'
        ? z + y * 0.5
        : name === 'tail'
          ? -z
          : name === 'back'
            ? // 몸 가운데쯤의 등 꼭대기
              y - Math.abs(z - zMid - 0.1) * 3
            : -Math.abs(y) - Math.abs(z - zMid + 0.2) - Math.abs(rest[i * 3])
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  }
  return best
}

export function createModelBody(
  template: ModelTemplate,
  options: ModelBodyOptions,
): Body3D {
  const spec = MODELS[template.id]
  const object = new Group()
  // 공격·쓰러짐 때 몸 전체를 움직이는 층 (별자리·덧붙이는 것도 여기 붙음)
  const pose = new Group()
  pose.scale.setScalar(options.scale ?? 1)
  object.add(pose)
  const bodyMaterial = makeBodyMaterial(options.color, spec.deform)
  const wireMaterial = makeWireMaterial(options.color, spec.deform)
  const clip = (name: string) => template.clips.find((c) => c.name === name)
  const speed = spec.speed ?? 1

  /** 모델 하나를 복제해 재질을 입히고 그물 선을 붙임 */
  function makeRig(angle: number): Rig {
    const holder = new Group()
    if (template.kind !== 'static')
      template.fit.decompose(holder.position, holder.quaternion, holder.scale)
    const root =
      template.kind === 'skinned'
        ? cloneSkinned(template.scene)
        : template.scene.clone()
    holder.add(root)
    const turn = new Group()
    turn.rotation.y = (angle * Math.PI) / 180
    turn.add(holder)
    pose.add(turn)
    const meshes: Mesh[] = []
    root.traverse((o) => {
      if ((o as Mesh).isMesh) meshes.push(o as Mesh)
    })
    for (const mesh of meshes) {
      mesh.material = bodyMaterial
      mesh.frustumCulled = false
      mesh.renderOrder = 7
      const skinned = mesh as SkinnedMesh
      let lines: Mesh
      if (skinned.isSkinnedMesh) {
        const skin = new SkinnedMesh(mesh.geometry, wireMaterial)
        skin.bind(skinned.skeleton, skinned.bindMatrix)
        lines = skin
      } else lines = new Mesh(mesh.geometry, wireMaterial)
      if (mesh.morphTargetInfluences) {
        // 같은 배열을 함께 써서 모프 움직임을 그대로 따름
        lines.morphTargetInfluences = mesh.morphTargetInfluences
        lines.morphTargetDictionary = mesh.morphTargetDictionary
      }
      lines.position.copy(mesh.position)
      lines.quaternion.copy(mesh.quaternion)
      lines.scale.copy(mesh.scale)
      lines.frustumCulled = false
      lines.renderOrder = 8
      mesh.parent?.add(lines)
    }
    const mixer = new AnimationMixer(root)
    const loopClip = clip('loop')
    const loop = loopClip ? mixer.clipAction(loopClip) : undefined
    if (loop && loopClip) {
      loop.play()
      // 같은 모델이 둘 나와도 똑같이 움직이지 않게
      const phase = ((options.seed ?? 0) * 0.618 + angle * 0.01) % 1
      loop.time = (phase < 0 ? phase + 1 : phase) * loopClip.duration
    }
    return { root, mixer, loop, meshes }
  }

  const main = makeRig(0)
  const rigs = [main, ...(options.ghosts ?? []).map((angle) => makeRig(angle))]
  const skinnedMeshes = main.meshes.filter(
    (m) => (m as SkinnedMesh).isSkinnedMesh,
  ) as SkinnedMesh[]
  const mesh = main.meshes[0]

  // 별자리와 자리: 뼈대 모델은 관절, 아니면 정점
  let constellation: Constellation
  let starAt: (i: number, out: Vector3, time: number) => Vector3
  let anchorAt: (name: Anchor, out: Vector3, time: number) => Vector3
  if (skinnedMeshes.length) {
    const all = [...new Set(skinnedMeshes.flatMap((m) => m.skeleton.bones))]
    const bones = all.filter((b) => !MINOR_BONE.test(b.name))
    const index = new Map<Bone, number>(bones.map((b, i) => [b, i]))
    const links: number[] = []
    bones.forEach((bone, i) => {
      let parent = bone.parent
      while (parent && !index.has(parent as Bone)) parent = parent.parent
      if (parent) links.push(index.get(parent as Bone)!, i)
    })
    constellation = new Constellation(
      options.color,
      bones.length,
      new Uint16Array(links),
    )
    const boneAt = (bone: Bone, out: Vector3) =>
      out.setFromMatrixPosition(bone.matrixWorld).applyMatrix4(toPose)
    starAt = (i, out) => boneAt(bones[i], out)
    const anchorBones = new Map<Anchor, Bone>()
    for (const name of Object.keys(ANCHOR_BONES) as Anchor[]) {
      for (const pattern of ANCHOR_BONES[name]) {
        // 꼬리는 가장 끝 마디
        const found =
          name === 'tail'
            ? all.filter((b) => pattern.test(b.name)).at(-1)
            : all.find((b) => pattern.test(b.name))
        if (found) {
          anchorBones.set(name, found)
          break
        }
      }
    }
    anchorAt = (name, out) => {
      const bone = anchorBones.get(name)
      return bone ? boneAt(bone, out) : out.set(0, 0, 0)
    }
  } else {
    const position = mesh.geometry.attributes.position
    const rest = new Float32Array(position.count * 3)
    const fit = template.kind === 'static' ? new Matrix4() : template.fit
    for (let i = 0; i < position.count; i++)
      tmp.fromBufferAttribute(position, i).applyMatrix4(fit).toArray(rest, i * 3)
    const picked = spreadPick(rest, position.count, VERTEX_STARS)
    const pickedRest = new Float32Array(picked.length * 3)
    picked.forEach((v, i) =>
      pickedRest.set(rest.subarray(v * 3, v * 3 + 3), i * 3),
    )
    constellation = new Constellation(
      options.color,
      picked.length,
      linkNearest(pickedRest, picked.length),
    )
    const vertexAt = (v: number, out: Vector3, time: number) => {
      mesh.getVertexPosition(v, out)
      if (template.kind === 'static') deformPoint(out, spec.deform, time)
      return out.applyMatrix4(meshToPose)
    }
    starAt = (i, out, time) => vertexAt(picked[i], out, time)
    const anchors = new Map<Anchor, number>()
    anchorAt = (name, out, time) => {
      let v = anchors.get(name)
      if (v === undefined) {
        v = vertexAnchor(rest, position.count, name)
        anchors.set(name, v)
      }
      return vertexAt(v, out, time)
    }
  }
  pose.add(constellation.lines, constellation.stars)

  // 덧붙이는 것
  const extras = createExtras(options.extras, options.color)
  for (const part of extras) pose.add(part.object)
  let now = 0
  const anchor = (name: Anchor, out: Vector3) => anchorAt(name, out, now)

  // 공격·쓰러짐
  let attackAction: AnimationAction | undefined
  let lunge = -1
  let falling = -1
  const attackClip = clip('attack')
  const deathClip = clip('death')
  main.mixer.addEventListener('finished', (event) => {
    if (event.action === attackAction && main.loop && falling < 0) {
      main.loop.reset().play()
      main.loop.crossFadeFrom(event.action, 0.3, false)
    }
  })

  return {
    object,
    update(frame: BodyFrame) {
      const dt = frame.reducedMotion ? 0 : frame.dt
      for (const rig of rigs) rig.mixer.update(dt * speed)
      // 공격: 앞으로 덮쳤다 돌아옴 (공격 동작이 없는 모델도)
      if (lunge >= 0) {
        lunge += dt / 0.7
        pose.position.z = Math.sin(Math.min(lunge, 1) * Math.PI) * 0.22
        if (lunge >= 1) lunge = -1
      }
      // 쓰러짐: 쓰러지는 동작이 없으면 천천히 기울며 가라앉음
      if (falling >= 0 && !deathClip) {
        falling += dt
        pose.rotation.z = Math.min(falling * 0.6, 1.2)
        pose.position.y = -falling * 0.15
      }
      now = frame.time
      setMaterials(bodyMaterial, wireMaterial, frame)

      object.updateMatrixWorld(true)
      toPose.copy(pose.matrixWorld).invert()
      if (!skinnedMeshes.length)
        meshToPose.multiplyMatrices(toPose, mesh.matrixWorld)
      for (let i = 0; i < constellation.count; i++)
        constellation.set(i, starAt(i, tmp, now))
      const scale = pose.getWorldScale(tmp).x
      constellation.commit(frame, scale)
      for (const part of extras) part.update(frame, anchor, scale)
    },
    strike() {
      lunge = 0
      if (!attackClip || !main.loop || falling >= 0) return
      attackAction = main.mixer.clipAction(attackClip)
      attackAction.reset()
      attackAction.setLoop(LoopOnce, 1)
      attackAction.play()
      attackAction.crossFadeFrom(main.loop, 0.15, false)
    },
    fall() {
      if (falling >= 0) return
      falling = 0
      if (!deathClip) return
      const death = main.mixer.clipAction(deathClip)
      death.reset()
      death.setLoop(LoopOnce, 1)
      death.clampWhenFinished = true
      death.play()
      const from = attackAction?.isRunning() ? attackAction : main.loop
      if (from) death.crossFadeFrom(from, 0.2, false)
    },
    dispose() {
      for (const rig of rigs) rig.mixer.stopAllAction()
      bodyMaterial.dispose()
      wireMaterial.dispose()
      constellation.dispose()
      for (const part of extras) part.dispose()
      // 모양(geometry)은 모델 틀과 함께 쓰므로 지우지 않음
    },
  }
}
