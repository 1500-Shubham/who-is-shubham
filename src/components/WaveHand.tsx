import { motion } from 'motion/react'
import type { Variants } from 'motion/react'

/* lucide "hand" outline — inlined so nothing here depends on an icon library */
export function HandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  )
}

const wave: Variants = {
  rest: { opacity: 0, scale: 0.55, rotate: 0, transition: { duration: 0.28 } },
  wave: {
    opacity: [0, 1, 1, 1, 1, 1, 1, 0],
    scale: [0.55, 1, 1, 1, 1, 1, 1, 0.7],
    rotate: [0, 24, -16, 24, -12, 18, 0, 0],
    transition: { duration: 1.9, times: [0, 0.1, 0.28, 0.46, 0.62, 0.78, 0.9, 1], ease: 'easeInOut' },
  },
}

interface WaveHandProps {
  waving: boolean
  /** Called when one wave cycle finishes so the owner can drop `waving`. */
  onDone: () => void
  className?: string
}

/** A hand that pops in, waves a few times, and tucks away. Position it with `className`. */
export default function WaveHand({ waving, onDone, className }: WaveHandProps) {
  return (
    <motion.div
      className={className}
      variants={wave}
      initial="rest"
      animate={waving ? 'wave' : 'rest'}
      onAnimationComplete={(v) => v === 'wave' && onDone()}
      aria-hidden
    >
      <HandIcon />
    </motion.div>
  )
}
