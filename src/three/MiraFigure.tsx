import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'

/*
 * MIRA as a particle hologram, shared between the hero and her own section.
 * A female bust silhouette is drawn on an offscreen 2D canvas, sampled into
 * ~5k particles, and rendered with a custom shader that
 *   – assembles her from scattered stardust when `active` flips on,
 *   – shimmers per-particle,
 *   – repels particles around the cursor while `hovered` is true.
 */

const W = 260
const H = 360
const CX = W / 2
const SCALE = 1 / 80
const Y_CENTER = H * 0.55

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
  ctx.fill()
}

function drawSilhouette(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#fff'
  // hair volume behind the head
  ctx.beginPath()
  ctx.ellipse(CX, 96, 57, 72, 0, 0, Math.PI * 2)
  ctx.fill()
  // long side hair falling past the shoulders
  roundedRect(ctx, CX - 76, 90, 32, 148, 16)
  roundedRect(ctx, CX + 44, 90, 32, 148, 16)
  // head
  ctx.beginPath()
  ctx.ellipse(CX, 84, 35, 44, 0, 0, Math.PI * 2)
  ctx.fill()
  // neck
  ctx.fillRect(CX - 12, 122, 24, 32)
  // shoulders and torso
  ctx.beginPath()
  ctx.moveTo(CX - 82, H)
  ctx.bezierCurveTo(CX - 80, 240, CX - 50, 180, CX, 172)
  ctx.bezierCurveTo(CX + 50, 180, CX + 80, 240, CX + 82, H)
  ctx.closePath()
  ctx.fill()
  // dissolve the base so she fades into stardust
  const g = ctx.createLinearGradient(0, H - 95, 0, H)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.94)')
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = g
  ctx.fillRect(0, H - 95, W, 95)
  ctx.globalCompositeOperation = 'source-over'
}

interface Cloud {
  position: Float32Array
  scatter: Float32Array
  color: Float32Array
  size: Float32Array
  phase: Float32Array
}

function buildCloud(): Cloud {
  const cnv = document.createElement('canvas')
  cnv.width = W
  cnv.height = H
  const ctx = cnv.getContext('2d')!
  drawSilhouette(ctx)
  const data = ctx.getImageData(0, 0, W, H).data

  const pos: number[] = []
  const sct: number[] = []
  const col: number[] = []
  const size: number[] = []
  const phase: number[] = []

  const cBottom = new THREE.Color('#35e0ff')
  const cTop = new THREE.Color('#a06bff')
  const cEye = new THREE.Color('#eaffff')
  const white = new THREE.Color('#ffffff')
  const tmp = new THREE.Color()

  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const alpha = data[(y * W + x) * 4 + 3]
      if (alpha < 8) continue
      // partial alpha (the dissolved base) lowers the keep probability
      if (Math.random() > (alpha / 255) * 0.8) continue

      const jx = x + (Math.random() - 0.5) * 2
      const jy = y + (Math.random() - 0.5) * 2
      const px = (jx - CX) * SCALE
      const py = (Y_CENTER - jy) * SCALE
      const depth = 0.12 + 0.42 * Math.exp(-(((jx - CX) / 58) ** 2))
      const pz = (Math.random() - 0.5) * depth
      pos.push(px, py, pz)

      // where this particle flies in from
      const r = 2.6 + Math.random() * 2.2
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      sct.push(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.9, r * Math.cos(ph))

      // a glowing visor band across the eye line keeps her "alive"
      const isEye = Math.abs(jy - 84) < 4.5 && Math.abs(jx - CX) < 24
      const t = THREE.MathUtils.clamp((py + 2) / 4, 0, 1)
      if (isEye) tmp.copy(cEye)
      else {
        tmp.lerpColors(cBottom, cTop, t)
        if (Math.random() < 0.12) tmp.lerp(white, 0.55)
      }
      col.push(tmp.r, tmp.g, tmp.b)
      size.push(isEye ? 2 : 0.7 + Math.random() * 0.9)
      phase.push(Math.random() * Math.PI * 2)
    }
  }

  return {
    position: new Float32Array(pos),
    scatter: new Float32Array(sct),
    color: new Float32Array(col),
    size: new Float32Array(size),
    phase: new Float32Array(phase),
  }
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  uniform float uForce;
  uniform vec2 uPointer;
  attribute vec3 aScatter;
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vTw;

  void main() {
    vec3 pos = mix(aScatter, position, uProgress);

    // idle drift
    pos.x += sin(uTime * 1.3 + aPhase) * 0.012;
    pos.y += cos(uTime * 1.1 + aPhase * 1.7) * 0.012;
    pos.z += sin(uTime * 0.9 + aPhase * 2.3) * 0.014;

    // cursor repulsion: she flinches away from your pointer (only while hovered)
    vec2 d = pos.xy - uPointer;
    float dist = length(d);
    float force = smoothstep(0.62, 0.0, dist) * 0.3 * uProgress * uForce;
    pos.xy += normalize(d + vec2(1e-4)) * force;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vTw = 0.72 + 0.28 * sin(uTime * 2.2 + aPhase * 3.0);
    gl_PointSize = aSize * vTw * 3.4 * uPixelRatio * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
  }
`

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vTw;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.06, d);
    gl_FragColor = vec4(vColor * (0.85 + 0.35 * vTw), a * 0.9);
  }
`

export interface MiraFigureProps {
  active: boolean
  hovered: RefObject<boolean>
}

export function MiraFigure({ active, hovered }: MiraFigureProps) {
  const cloud = useMemo(buildCloud, [])
  const mat = useRef<THREE.ShaderMaterial>(null!)
  const grp = useRef<THREE.Group>(null!)
  const probe = useRef(new THREE.Vector3())

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uForce: { value: 0 },
      uPointer: { value: new THREE.Vector2(99, 99) },
    }),
    [],
  )

  useFrame((state, dt) => {
    const u = mat.current.uniforms
    u.uTime.value += dt
    const goal = active ? 1 : 0
    u.uProgress.value = THREE.MathUtils.damp(u.uProgress.value, goal, 1.5, dt)
    u.uForce.value = THREE.MathUtils.damp(u.uForce.value, hovered.current ? 1 : 0, 5, dt)

    // project the pointer onto the z=0 plane the figure lives on
    probe.current.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
    const dir = probe.current.sub(state.camera.position).normalize()
    const t = -state.camera.position.z / dir.z
    const wx = state.camera.position.x + dir.x * t
    const wy = state.camera.position.y + dir.y * t
    // map into this group's local space (handles hero-side scale/offset)
    probe.current.set(wx, wy, 0)
    grp.current.worldToLocal(probe.current)
    u.uPointer.value.set(probe.current.x, probe.current.y)

    // gentle sway + breathing bob
    grp.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.32) * 0.22
    grp.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.045
  })

  return (
    <group ref={grp}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloud.position, 3]} />
          <bufferAttribute attach="attributes-aScatter" args={[cloud.scatter, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[cloud.color, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[cloud.size, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[cloud.phase, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={mat}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

/* Concentric projector rings + a rotating radar sweep at her base */
export function HoloBase() {
  const sweep = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    sweep.current.rotation.z += dt * 0.9
  })
  const rings = [
    { r: 0.55, o: 0.4 },
    { r: 0.85, o: 0.28 },
    { r: 1.2, o: 0.16 },
  ]
  return (
    <group position={[0, -2.0, 0]}>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.35, 48]} />
        <meshBasicMaterial color="#0e3a5c" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {rings.map((ring) => (
        <mesh key={ring.r} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[ring.r, 0.008, 6, 80]} />
          <meshBasicMaterial color="#38b6ff" transparent opacity={ring.o} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      <mesh ref={sweep} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[1.02, 0.014, 6, 60, Math.PI * 0.55]} />
        <meshBasicMaterial color="#7fe9ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* A scanning ring travelling up and down the figure */
export function ScanRing() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.3) % 1
    ref.current.position.y = -1.9 + t * 3.9
    // ring narrows toward the head
    const r = 1.18 - 0.58 * t
    ref.current.scale.set(r, r, 1)
    const m = ref.current.material as THREE.MeshBasicMaterial
    m.opacity = 0.5 * Math.sin(Math.PI * t)
  })
  return (
    <mesh ref={ref} rotation-x={Math.PI / 2}>
      <torusGeometry args={[1, 0.01, 6, 64]} />
      <meshBasicMaterial color="#bfeaff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}
