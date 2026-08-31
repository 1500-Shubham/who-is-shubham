import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, useCursor } from '@react-three/drei'
import { useInView } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { ReactNode } from 'react'
import { MiraFigure, HoloBase, ScanRing } from './MiraFigure'

/* Slowly drifting starfield shell around the centerpiece */
function Starfield() {
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const n = 1300
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 5 + Math.random() * 7
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi) - 2
    }
    return arr
  }, [])

  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.02
    ref.current.rotation.x += dt * 0.005
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#a9b7ff" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* MIRA greets visitors in the hero: hover and she reacts, click and she takes you to her section */
function HeroMira({ onHover }: { onHover: (h: boolean) => void }) {
  const hovered = useRef(false)
  const [hover, setHover] = useState(false)
  useCursor(hover)

  const set = (h: boolean) => {
    hovered.current = h
    setHover(h)
    onHover(h)
  }

  return (
    <group position={[0, -0.45, 0]} scale={1.05}>
      <MiraFigure active hovered={hovered} />
      <HoloBase />
      <ScanRing />
      {/* invisible hit proxy so hover/click track her whole body */}
      <mesh
        position={[0, 0.2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          set(true)
        }}
        onPointerOut={() => set(false)}
        onClick={() => document.getElementById('mira')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <cylinderGeometry args={[1.4, 1.4, 4.7, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* Holographic display of /avatar.jpg once it exists */
function PhotoHolo({ tex }: { tex: THREE.Texture }) {
  const ring = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    ring.current.rotation.z += dt * 0.3
  })
  return (
    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.9}>
      <mesh>
        <circleGeometry args={[2.05, 72]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[2.1, 2.17, 72]} />
        <meshBasicMaterial color="#38e1ff" transparent opacity={0.75} />
      </mesh>
      <mesh ref={ring} rotation-x={1.3}>
        <torusGeometry args={[2.6, 0.016, 8, 90]} />
        <meshBasicMaterial color="#8b7bff" transparent opacity={0.5} />
      </mesh>
    </Float>
  )
}

/*
 * FUTURE PHOTO SLOT ─────────────────────────────────────────────
 * Drop a photo at  public/avatar.jpg  and redeploy: MIRA hands the
 * hero over to a floating holographic photo disc (she still lives
 * in her own section below). No code change needed.
 * ────────────────────────────────────────────────────────────────
 */
function Centerpiece({ onHover }: { onHover: (h: boolean) => void }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/avatar.jpg'
    img.onload = () => {
      const t = new THREE.Texture(img)
      t.colorSpace = THREE.SRGBColorSpace
      const a = img.width / img.height
      if (a > 1) {
        t.repeat.set(1 / a, 1)
        t.offset.set((1 - 1 / a) / 2, 0)
      } else {
        t.repeat.set(1, a)
        t.offset.set(0, (1 - a) / 2)
      }
      t.needsUpdate = true
      setTex(t)
    }
  }, [])

  return tex ? <PhotoHolo tex={tex} /> : <HeroMira onHover={onHover} />
}

/* Everything leans gently toward the cursor */
function Rig({ children }: { children: ReactNode }) {
  const g = useRef<THREE.Group>(null!)
  useFrame((state, dt) => {
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, state.pointer.x * 0.32, 3, dt)
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, -state.pointer.y * 0.22, 3, dt)
  })
  return <group ref={g}>{children}</group>
}

export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null)
  const [hint, setHint] = useState(false)
  const inView = useInView(wrap, { margin: '-10% 0px' })

  return (
    <div ref={wrap} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Rig>
          <Starfield />
          <Centerpiece onHover={setHint} />
          <Sparkles count={70} scale={7} size={2.2} speed={0.35} color="#9db4ff" opacity={0.6} />
        </Rig>
      </Canvas>
      <div className={`hero-mira-hint ${hint ? 'show' : ''}`} aria-hidden>
        ✦ that's MIRA — click to meet her ↓
      </div>
    </div>
  )
}
