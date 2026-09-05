import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

export function Reveal({ children, delay = 0, y = 28, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, delay, ease: [0.2, 0.65, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface SectionProps {
  id: string
  eyebrow: string
  title: ReactNode
  kicker?: ReactNode
  children: ReactNode
}

export function Section({ id, eyebrow, title, kicker, children }: SectionProps) {
  return (
    <section id={id} className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            {kicker && <p className="kicker">{kicker}</p>}
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  )
}
