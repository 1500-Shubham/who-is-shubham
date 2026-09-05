import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react'
import { motionTokens } from '../data/brand'

/**
 * Scroll-linked section shell.
 *
 * Every section is treated as a shot in one continuous take: it rises and
 * settles as it enters, holds while it owns the viewport, then recedes and
 * dims as the next shot takes over. All of it is driven by scroll position
 * rather than time, so the page responds to the reader instead of playing at
 * them. Under `prefers-reduced-motion` every transform collapses to a no-op
 * and only the plain fade survives.
 */

/** Shared scroll progress for an element: 0 as it enters, 1 as it leaves. */
function useShotProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  return useSpring(scrollYProgress, motionTokens.spring)
}

interface CinematicSectionProps {
  id: string
  eyebrow: string
  title: ReactNode
  kicker?: ReactNode
  /** corner title card, e.g. "selected work" */
  slug?: string
  children: ReactNode
  className?: string
}

export function CinematicSection({
  id,
  eyebrow,
  title,
  kicker,
  slug,
  children,
  className = '',
}: CinematicSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const p = useShotProgress(ref)

  // The shot: settle in over the first 30%, hold, recede over the last 25%.
  const y = useTransform(p, [0, 0.3, 0.75, 1], [70, 0, 0, -50])
  const scale = useTransform(p, [0, 0.3, 0.75, 1], [0.965, 1, 1, 0.985])
  const opacity = useTransform(p, [0, 0.16, 0.8, 1], [0, 1, 1, 0.42])
  // Headline drifts slightly faster than the body — cheap parallax depth.
  const headY = useTransform(p, [0, 1], [40, -40])

  const shot = reduce ? {} : { y, scale, opacity }
  const head = reduce ? {} : { y: headY }

  return (
    <section id={id} ref={ref} className={`section shot ${className}`}>
      {slug && (
        <div className="shot-slug mono" aria-hidden>
          <span className="shot-slug-bar" />
          {slug}
        </div>
      )}
      <motion.div className="container" style={shot}>
        <motion.div className="section-head" style={head}>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          {kicker && <p className="kicker">{kicker}</p>}
        </motion.div>
        {children}
      </motion.div>
    </section>
  )
}

/**
 * A layer that scrolls at its own rate. `depth` is the offset in pixels
 * travelled across the full pass: negative rises, positive sinks.
 */
export function Parallax({
  children,
  depth = 60,
  className,
}: {
  children: ReactNode
  depth?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const p = useShotProgress(ref)
  const y = useTransform(p, [0, 1], [depth, -depth])

  return (
    <motion.div ref={ref} className={className} style={reduce ? {} : { y }}>
      {children}
    </motion.div>
  )
}

/**
 * Children revealed one after another as the group enters view. Used for
 * card grids so a row assembles rather than popping in as a block.
 */
export function StaggerGroup({
  children,
  className,
  step = motionTokens.stagger,
}: {
  children: ReactNode
  className?: string
  step?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ shown: { transition: { staggerChildren: step } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  y = 26,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : y, filter: 'blur(6px)' },
        shown: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: motionTokens.base, ease: motionTokens.ease },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
