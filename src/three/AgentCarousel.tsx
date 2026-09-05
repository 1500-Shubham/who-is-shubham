import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { HoloBase, ScanRing } from './MiraFigure'
import { buildDepthTexture } from './portraitDepth'
import type { Agent } from '../data/agents'

const RADIUS = 3.4
const FIG_H = 3.6
/**
 * Slots sit on an arc rather than a full circle. At a true 90° spacing the
 * neighbours would be exactly edge-on — a flat portrait vanishes into a sliver
 * there, and even a mesh reads as clutter in a box this size. 0.62 rad keeps
 * all four legible while the ring still genuinely turns in 3D.
 */
const SPACING = 0.55
/** Planes turn part-way with the arc; meshes turn the whole way. */
const PLANE_TURN = 0.72
const TAU = Math.PI * 2

/* ------------------------------------------------------------------ *
 * Depth relief shaders (displacement map comes from ./portraitDepth)
 * ------------------------------------------------------------------ */

const RELIEF_VERT = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uBulge;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    float d = texture2D(uDepth, uv).r;
    float z = pow(d, 1.5) * uBulge;

    // Normal straight off the depth gradient, so the rim light tracks the
    // actual relief as the turntable rotates.
    float e = 1.0 / 64.0;
    float dx = texture2D(uDepth, uv + vec2(e, 0.0)).r - texture2D(uDepth, uv - vec2(e, 0.0)).r;
    float dy = texture2D(uDepth, uv + vec2(0.0, e)).r - texture2D(uDepth, uv - vec2(0.0, e)).r;
    vNormal = normalize(vec3(-dx * uBulge * 9.0, -dy * uBulge * 9.0, 1.0));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(0.0, 0.0, z), 1.0);
  }
`

const RELIEF_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3  uAccent;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float alpha = tex.a;
    if (alpha < 0.02) discard;

    vec3 col = tex.rgb;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));

    // Grade toward the agent accent so a photoreal render still reads as a
    // projection inside this scene rather than a sticker pasted on top.
    col = mix(col, uAccent * (0.30 + lum * 0.95), 0.26);

    // Rim light off the relief normal — this is what sells the volume when
    // the ring turns.
    float rim = pow(1.0 - abs(vNormal.z), 2.2);
    col += uAccent * rim * 0.55;

    // Holographic scanlines and the occasional interference band.
    col *= 0.94 + 0.06 * sin(vUv.y * 480.0 - uTime * 2.6);
    col += uAccent * smoothstep(0.985, 1.0, sin(vUv.y * 5.0 - uTime * 0.85)) * 0.14;

    // Dissolve into the projector base.
    alpha *= smoothstep(0.0, 0.14, vUv.y);
    alpha *= uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`

/* ------------------------------------------------------------------ *
 * Portrait relief
 * ------------------------------------------------------------------ */

interface VisualProps {
  agent: Agent
  opacity: React.MutableRefObject<number>
}

function PortraitRelief({ agent, opacity }: VisualProps) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  const [depth, setDepth] = useState<THREE.DataTexture | null>(null)
  const [aspect, setAspect] = useState(0.8)

  useEffect(() => {
    if (!agent.image) return
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = agent.image
    img.onload = () => {
      if (cancelled) return
      const t = new THREE.Texture(img)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
      t.needsUpdate = true
      setAspect(img.width / img.height)
      setTex(t)
      setDepth(buildDepthTexture(img))
    }
    return () => {
      cancelled = true
    }
  }, [agent.image])

  const material = useMemo(() => {
    if (!tex || !depth) return null
    return new THREE.ShaderMaterial({
      vertexShader: RELIEF_VERT,
      fragmentShader: RELIEF_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uMap: { value: tex },
        uDepth: { value: depth },
        uAccent: { value: new THREE.Color(agent.accent) },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uBulge: { value: 0.55 },
      },
    })
  }, [tex, depth, agent.accent])

  useEffect(() => () => material?.dispose(), [material])
  useEffect(() => () => depth?.dispose(), [depth])

  useFrame((state) => {
    if (!material) return
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uOpacity.value = opacity.current
  })

  if (!material) return null
  const w = FIG_H * aspect

  return (
    <mesh>
      <planeGeometry args={[w, FIG_H, 72, 96]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/* ------------------------------------------------------------------ *
 * glTF model — used instead of the relief when public/agents/<id>.glb exists
 * ------------------------------------------------------------------ */

function GlbModel({ agent, opacity }: VisualProps) {
  const { scene } = useGLTF(agent.model!)
  const root = useRef<THREE.Group>(null!)

  // Clone so the same cached glTF can appear in more than one slot, and so we
  // can recolour materials without mutating the cache.
  const model = useMemo(() => {
    const c = scene.clone(true)
    const box = new THREE.Box3().setFromObject(c)
    const size = new THREE.Vector3()
    const centre = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(centre)
    const s = FIG_H / Math.max(size.y, 0.0001)
    c.scale.setScalar(s)
    c.position.set(-centre.x * s, -centre.y * s, -centre.z * s)

    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const mats = Array.isArray(m.material) ? m.material : [m.material]
      m.material = mats.map((src) => {
        const mat = (src as THREE.Material).clone() as THREE.MeshStandardMaterial
        mat.transparent = true
        return mat
      })
      if (!Array.isArray(m.material)) m.material = m.material as THREE.Material
    })
    return c
  }, [scene])

  useFrame(() => {
    model.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const mats = Array.isArray(m.material) ? m.material : [m.material]
      for (const mat of mats) (mat as THREE.Material).opacity = opacity.current
    })
  })

  return <primitive ref={root} object={model} />
}

/** HEAD-probes the model so a missing .glb degrades quietly to the portrait. */
function useAssetExists(url?: string) {
  const [exists, setExists] = useState(false)
  useEffect(() => {
    if (!url) return
    let cancelled = false
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        if (!cancelled) setExists(r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [url])
  return exists
}

/* ------------------------------------------------------------------ *
 * One slot on the turntable
 * ------------------------------------------------------------------ */

interface SlotProps {
  agent: Agent
  index: number
  count: number
  spin: React.MutableRefObject<number>
  onSelect: (agent: Agent) => void
  onHover: (agent: Agent | null) => void
}

function Slot({ agent, index, count, spin, onSelect, onHover }: SlotProps) {
  const group = useRef<THREE.Group>(null!)
  const opacity = useRef(1)
  const settled = useRef(false)
  const hasModel = useAssetExists(agent.model)

  useFrame((_, dt) => {
    // Fractional slot distance from the front, wrapped the short way round.
    const half = count / 2
    let off = ((((index + spin.current / (TAU / count)) % count) + count + half) % count) - half
    const angle = off * SPACING

    group.current.position.set(Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS - RADIUS)
    group.current.rotation.y = angle * (hasModel ? 1 : PLANE_TURN)

    const d = Math.min(Math.abs(off), 2)
    const s = 1 - d * 0.28
    group.current.scale.setScalar(
      settled.current ? THREE.MathUtils.damp(group.current.scale.x, s, 9, dt) : s,
    )
    settled.current = true

    opacity.current = Math.max(0, 1 - d * 0.42)
    group.current.visible = d < 1.8
  })

  return (
    <group ref={group}>
      <group
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(agent)
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(agent)
        }}
      >
        {hasModel ? (
          <Suspense fallback={<PortraitRelief agent={agent} opacity={opacity} />}>
            <GlbModel agent={agent} opacity={opacity} />
          </Suspense>
        ) : (
          <PortraitRelief agent={agent} opacity={opacity} />
        )}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ *
 * The turntable
 * ------------------------------------------------------------------ */

export interface AgentCarouselProps {
  agents: Agent[]
  active: number
  onActiveChange: (i: number) => void
  onHover: (agent: Agent | null) => void
  /** Suppresses idle drift and snap easing. */
  reduceMotion?: boolean
}

export default function AgentCarousel({
  agents,
  active,
  onActiveChange,
  onHover,
  reduceMotion = false,
}: AgentCarouselProps) {
  const count = agents.length
  const step = TAU / count

  // spin is the ring's own rotation; -active*step is the angle that brings
  // slot `active` to the front.
  const spin = useRef(-active * step)
  const velocity = useRef(0)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const target = useRef(-active * step)

  const { gl, size } = useThree()

  useEffect(() => {
    // Re-target on the turn that keeps the ring moving the short way round.
    const want = -active * step
    const delta = want - target.current
    target.current += Math.atan2(Math.sin(delta), Math.cos(delta))
  }, [active, step])

  // Drag to spin, with inertia and a snap to the nearest slot on release.
  useEffect(() => {
    const el = gl.domElement

    const down = (e: PointerEvent) => {
      dragging.current = true
      lastX.current = e.clientX
      velocity.current = 0
      el.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - lastX.current
      lastX.current = e.clientX
      const k = (Math.PI * 1.1) / Math.max(size.width, 1)
      spin.current += dx * k
      velocity.current = dx * k
    }
    const up = (e: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      // Carry the throw a little, then settle on whichever slot is nearest.
      const projected = spin.current + velocity.current * 9
      const slot = Math.round(-projected / step)
      target.current = -slot * step
      const norm = ((slot % count) + count) % count
      onActiveChange(norm)
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [gl, size.width, step, count, onActiveChange])

  useFrame((_, dt) => {
    if (dragging.current) return
    if (reduceMotion) {
      spin.current = target.current
      return
    }
    spin.current = THREE.MathUtils.damp(spin.current, target.current, 4.5, dt)
  })

  const select = (agent: Agent) => {
    const i = agents.indexOf(agent)
    if (i !== active) {
      onActiveChange(i)
      return
    }
    if (agent.href) document.querySelector(agent.href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <group position={[0, -0.1, 0]}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} />
      <pointLight position={[-4, 1, 3]} intensity={22} color="#38e1ff" distance={16} />

      {agents.map((a, i) => (
        <Slot
          key={a.id}
          agent={a}
          index={i}
          count={count}
          spin={spin}
          onSelect={select}
          onHover={onHover}
        />
      ))}

      <HoloBase />
      <ScanRing />
    </group>
  )
}
