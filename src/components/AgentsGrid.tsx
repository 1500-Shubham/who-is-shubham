import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import type { Variants } from 'motion/react'
import WaveHand from './WaveHand'
import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { Section } from './Reveal'
import { agents } from '../data/agents'
import type { Agent } from '../data/agents'

const bubble: Variants = {
  rest: { opacity: 0, y: 8, scale: 0.92, transition: { duration: 0.25 } },
  wave: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] } },
}

interface CardProps {
  agent: Agent
  index: number
  /** Fires once when the roster scrolls into view; each card waves in turn. */
  cue: boolean
}

function AgentCard({ agent, index, cue }: CardProps) {
  const reduce = useReducedMotion()
  const [waving, setWaving] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  // Staggered hello on first sight, then they settle down and only wave when
  // you come over to them — motion that greets, not motion that nags.
  useEffect(() => {
    if (!cue || reduce) return
    timer.current = window.setTimeout(() => setWaving(true), 500 + index * 420)
    return () => window.clearTimeout(timer.current)
  }, [cue, index, reduce])

  // Head tilt follows the pointer — the depth we get for free from a spring.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotY = useSpring(mx, { stiffness: 140, damping: 16 })
  const rotX = useSpring(my, { stiffness: 140, damping: 16 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 16)
    my.set(-((e.clientY - r.top) / r.height - 0.5) * 10)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  const inner = (
    <>
      <div
        className="agent-stage"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerEnter={() => !reduce && setWaving(true)}
      >
        <div className="agent-pad" aria-hidden />

        <motion.div
          className="agent-figure"
          style={{ rotateY: rotY, rotateX: rotX }}
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={reduce ? undefined : { duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.6 }}
        >
          {agent.image && <img className="agent-portrait" src={agent.image} alt={`${agent.name}, ${agent.role}`} loading="lazy" draggable={false} />}
        </motion.div>

        <WaveHand className="agent-hand" waving={waving} onDone={() => setWaving(false)} />

        <motion.div className="agent-bubble" variants={bubble} initial="rest" animate={waving ? 'wave' : 'rest'} role="status">
          {agent.greeting}
        </motion.div>
      </div>

      <div className="agent-meta">
        <div className="agent-card-top">
          <span className="agent-name">{agent.name}</span>
          <span className={`agent-status ${agent.status}`}>{agent.status === 'soon' ? 'coming soon' : 'live'}</span>
        </div>
        <div className="agent-role">{agent.role}</div>
        <div className="agent-tagline">{agent.tagline}</div>
      </div>
    </>
  )

  const shared = {
    className: 'agent-card',
    style: { '--accent': agent.accent } as React.CSSProperties,
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.7, delay: index * 0.09, ease: [0.2, 0.65, 0.3, 1] as const },
  }

  // Live agents link through to their section; the rest are just cards.
  return agent.href ? (
    <motion.a href={agent.href} {...shared} aria-label={`${agent.name} — ${agent.role}. Jump to section.`}>
      {inner}
    </motion.a>
  ) : (
    <motion.article {...shared}>{inner}</motion.article>
  )
}

export default function AgentsGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })

  return (
    <Section
      id="agents"
      eyebrow="agents.roster"
      title={
        <>
          Meet the <span className="gradient-text">agents</span>
        </>
      }
      kicker="MIRA is live. The rest are in the lab — go say hi anyway."
    >
      <div ref={ref} className="agents-grid">
        {agents.map((a, i) => (
          <AgentCard key={a.id} agent={a} index={i} cue={inView} />
        ))}
      </div>
    </Section>
  )
}
