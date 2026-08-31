import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { useInView } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { ReactNode } from 'react'

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

/* The "neural core": a distorted glossy blob inside a slow counter-rotating wireframe */
function NeuralCore() {
  const wire = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    wire.current.rotation.y -= dt * 0.12
    wire.current.rotation.z += dt * 0.05
  })
  return (
    <Float speed={1.7} rotationIntensity={0.35} floatIntensity={1}>
      <mesh>
        <icosahedronGeometry args={[1.85, 6]} />
        <MeshDistortMaterial
          color="#4235a8"
          emissive="#5b48e0"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.5}
          distort={0.42}
          speed={1.8}
        />
      </mesh>
      <mesh ref={wire} scale={1.28}>
        <icosahedronGeometry args={[1.85, 1]} />
        <meshBasicMaterial wireframe color="#38e1ff" transparent opacity={0.18} />
      </mesh>
    </Float>
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
 * Drop a photo at  public/avatar.jpg  and redeploy: the neural core
 * is automatically replaced by a floating holographic photo disc.
 * No code change needed. A square-ish photo works best.
 * ────────────────────────────────────────────────────────────────
 */
function Centerpiece() {
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

  return tex ? <PhotoHolo tex={tex} /> : <NeuralCore />
}

/* Two tilted orbit rings around the centerpiece */
function OrbitRings() {
  const a = useRef<THREE.Mesh>(null!)
  const b = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    a.current.rotation.z += dt * 0.22
    b.current.rotation.z -= dt * 0.16
  })
  return (
    <>
      <mesh ref={a} rotation={[1.25, 0.2, 0]}>
        <torusGeometry args={[2.95, 0.012, 8, 120]} />
        <meshBasicMaterial color="#38e1ff" transparent opacity={0.35} />
      </mesh>
      <mesh ref={b} rotation={[1.7, -0.35, 0.4]}>
        <torusGeometry args={[3.35, 0.01, 8, 120]} />
        <meshBasicMaterial color="#ff6ac2" transparent opacity={0.22} />
      </mesh>
    </>
  )
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
  const inView = useInView(wrap, { margin: '-10% 0px' })

  return (
    <div ref={wrap} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[6, 4, 6]} intensity={60} color="#8b7bff" />
        <pointLight position={[-6, -3, 4]} intensity={45} color="#38e1ff" />
        <pointLight position={[0, -2, -6]} intensity={40} color="#ff6ac2" />
        <Rig>
          <Starfield />
          <Centerpiece />
          <OrbitRings />
          <Sparkles count={70} scale={7} size={2.2} speed={0.35} color="#9db4ff" opacity={0.6} />
        </Rig>
      </Canvas>
    </div>
  )
}
