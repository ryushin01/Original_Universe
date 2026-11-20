/**
 * 우주적 존재의 3D 몸을 지금 장면의 결(빛나는 선과 빛 번짐)로 그리는 재질.
 * - 몸: 깎은 면(화면에서 구한 면 법선)마다 밝기가 다르고 가장자리가 밝은 반투명 빛, 가산 혼합
 * - 그물 선: 삼각형 모서리를 가는 선으로 (별자리·측지선 표시와 같은 결)
 * - 별: 몸 위의 점과 그 사이 선(별자리)
 * 몸과 그물 선은 뼈대(스키닝)·모프 애니메이션과, 움직임이 없는 모델에 주는 물결 변형을 함께 따릅니다.
 */
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  ShaderMaterial,
  Vector3,
  Vector4,
} from 'three'

/**
 * 움직임이 없는 모델에 주는 물결 변형 (모델 공간: 반지름 1, 앞 +Z, 위 +Y)
 * 진폭이 0이면 쓰지 않음
 */
export interface Deform {
  /** 날개·지느러미 퍼덕임: |x|가 from보다 바깥인 정점을 위아래로 [진폭, 빠르기, from] */
  flap?: [number, number, number]
  /** 몸 흔들기: z가 from보다 뒤인 정점을 옆으로 물결치게 [진폭, 빠르기, 물결 수, from] */
  sway?: [number, number, number, number]
  /** 촉수 물결: y가 from보다 아래인 정점을 수평으로 [진폭, 빠르기, 물결 수, from] */
  tentacle?: [number, number, number, number]
  /** 몸 부풀기: y가 from보다 위인 정점을 수평으로 [진폭, 빠르기, from] */
  pulse?: [number, number, number]
}

const deformChunk = /* glsl */ `
uniform float uTime;
uniform vec3 uFlap;
uniform vec4 uSway;
uniform vec4 uTentacle;
uniform vec3 uPulse;
vec3 deform(vec3 p) {
  float side = max(abs(p.x) - uFlap.z, 0.0);
  p.y += sin(uTime * uFlap.y) * side * uFlap.x;
  float tail = max(uSway.w - p.z, 0.0);
  p.x += sin(p.z * uSway.z - uTime * uSway.y) * tail * uSway.x;
  float below = max(uTentacle.w - p.y, 0.0);
  float wave = p.y * uTentacle.z - uTime * uTentacle.y + atan(p.z, p.x) * 2.0;
  p.xz += vec2(sin(wave), cos(wave)) * below * uTentacle.x;
  float above = step(uPulse.z, p.y);
  p.xz *= 1.0 + above * sin(uTime * uPulse.y) * uPulse.x;
  return p;
}
`

const bodyVertex = /* glsl */ `
#include <common>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
${deformChunk}
varying vec3 vViewPos;
varying float vHeight;
void main() {
  #include <morphinstance_vertex>
  #include <begin_vertex>
  transformed = deform(transformed);
  vHeight = transformed.y;
  #include <morphtarget_vertex>
  #include <skinbase_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  vViewPos = mvPosition.xyz;
}
`

const bodyFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
varying vec3 vViewPos;
varying float vHeight;
void main() {
  // 면 법선을 화면에서 구해 깎은 면(로우 폴리)이 보이게
  vec3 n = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
  vec3 v = normalize(-vViewPos);
  if (dot(n, v) < 0.0) n = -n;
  float rim = pow(1.0 - dot(n, v), 2.0);
  float facet = 0.5 + 0.5 * dot(n, normalize(vec3(0.35, 0.8, 0.45)));
  // 천천히 흐르는 띠로 별빛 같은 떨림
  float band = 0.88 + 0.12 * sin(vHeight * 14.0 - uTime * 1.5);
  float glow = (0.04 + rim * 0.85 + facet * facet * 0.2) * band;
  gl_FragColor = vec4(uColor, glow * uOpacity);
}
`

const wireFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  gl_FragColor = vec4(uColor, uOpacity);
}
`

function deformUniforms(deform: Deform = {}) {
  return {
    uTime: { value: 0 },
    uFlap: { value: new Vector3(...(deform.flap ?? [0, 0, 0])) },
    uSway: { value: new Vector4(...(deform.sway ?? [0, 0, 0, 0])) },
    uTentacle: { value: new Vector4(...(deform.tentacle ?? [0, 0, 0, 0])) },
    uPulse: { value: new Vector3(...(deform.pulse ?? [0, 0, 0])) },
  }
}

/** 몸: 깎은 면의 빛 (뼈대·모프·물결 변형을 따름) */
export function makeBodyMaterial(color: string, deform?: Deform) {
  return new ShaderMaterial({
    vertexShader: bodyVertex,
    fragmentShader: bodyFragment,
    uniforms: {
      uColor: { value: new Color(color) },
      uOpacity: { value: 0 },
      ...deformUniforms(deform),
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  })
}

/** 그물 선: 삼각형 모서리 (몸과 같은 변형) */
export function makeWireMaterial(color: string, deform?: Deform) {
  return new ShaderMaterial({
    vertexShader: bodyVertex,
    fragmentShader: wireFragment,
    uniforms: {
      uColor: { value: new Color(color) },
      uOpacity: { value: 0 },
      ...deformUniforms(deform),
    },
    wireframe: true,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
}

/** 셰이더의 deform()과 같은 계산 (별 자리를 몸에 붙이려고 CPU에서) */
export function deformPoint(p: Vector3, deform: Deform | undefined, t: number) {
  if (!deform) return p
  const [fa, fs, ff] = deform.flap ?? [0, 0, 0]
  p.y += Math.sin(t * fs) * Math.max(Math.abs(p.x) - ff, 0) * fa
  const [sa, ss, sk, sf] = deform.sway ?? [0, 0, 0, 0]
  p.x += Math.sin(p.z * sk - t * ss) * Math.max(sf - p.z, 0) * sa
  const [ta, ts, tk, tf] = deform.tentacle ?? [0, 0, 0, 0]
  const below = Math.max(tf - p.y, 0)
  const wave = p.y * tk - t * ts + Math.atan2(p.z, p.x) * 2
  p.x += Math.sin(wave) * below * ta
  p.z += Math.cos(wave) * below * ta
  const [pa, ps, pf] = deform.pulse ?? [0, 0, 0]
  const k = 1 + (p.y >= pf ? 1 : 0) * Math.sin(t * ps) * pa
  p.x *= k
  p.z *= k
  return p
}

/** 바꿀 수 있는 몸 재질 값 (같은 몸의 재질은 함께 바꿈) */
export function setBodyUniforms(
  material: ShaderMaterial,
  opacity: number,
  time: number,
) {
  material.uniforms.uOpacity.value = opacity
  material.uniforms.uTime.value = time
}
