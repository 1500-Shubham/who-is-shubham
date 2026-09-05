import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { ReactNode } from 'react'
import AgentCarousel from './AgentCarousel'
import { agents } from '../data/agents'
import type { Agent } from '../data/agents'

const ROTATE_MS = 5200

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduce(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduce
}

/* Everything leans gently toward the cursor */
function Rig({ children }: { children: ReactNode }) {
  const g = useRef<THREE.Group>(null!)
  useFrame((state, dt) => {
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, state.pointer.x * 0.22, 3, dt)
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, -state.pointer.y * 0.14, 3, dt)
  })
  return <group ref={g}>{children}</group>
}

export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap, { margin: '-10% 0px' })
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState<Agent | null>(null)
  const reduceMotion = usePrefersReducedMotion()

  const agent = agents[active]

  // Auto-advance, but hold while the visitor is inspecting one.
  useEffect(() => {
    if (!inView || hovered || reduceMotion || agents.length < 2) return
    const id = setInterval(() => setActive((i) => (i + 1) % agents.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [inView, hovered, reduceMotion])

  return (
    <div ref={wrap} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      <Canvas
        frameloop={reduceMotion ? 'demand' : inView ? 'always' : 'never'}
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ cursor: hovered ? 'pointer' : 'grab', touchAction: 'pan-y' }}
      >
        <Rig>
          <AgentCarousel
            agents={agents}
            active={active}
            onActiveChange={setActive}
            onHover={setHovered}
            reduceMotion={reduceMotion}
          />
          <Sparkles count={60} scale={7} size={2} speed={0.35} color="#9db4ff" opacity={0.55} />
        </Rig>
      </Canvas>

      <div className="agent-hud">
        <AnimatePresence mode="wait">
          <motion.div
            key={agent.id}
            className="agent-hud-card"
            initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="agent-hud-top">
              <span className="agent-name" style={{ color: agent.accent }}>
                {agent.name}
              </span>
              <span className={`agent-status ${agent.status}`}>
                {agent.status === 'soon' ? 'coming soon' : 'live'}
              </span>
            </div>
            <div className="agent-role">{agent.role}</div>
            <div className="agent-tagline">{agent.tagline}</div>
          </motion.div>
        </AnimatePresence>

        <div className="agent-dots" role="tablist" aria-label="AI agents">
          {agents.map((a, i) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={i === active}
              aria-label={`${a.name} — ${a.role}`}
              className={`agent-dot ${i === active ? 'on' : ''}`}
              style={i === active ? { background: a.accent, boxShadow: `0 0 12px ${a.accent}` } : undefined}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
