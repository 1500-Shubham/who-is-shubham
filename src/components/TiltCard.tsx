import { useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'

const FINE_POINTER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

interface TiltCardProps {
  children: ReactNode
  className?: string
  max?: number
  glare?: boolean
}

// Perspective tilt that follows the cursor, with a moving glare highlight.
export default function TiltCard({ children, className, max = 7, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!FINE_POINTER) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(py - 0.5) * -2 * max}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * 2 * max}deg`)
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={ref} className={`tilt ${className ?? ''}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="tilt-inner">
        {children}
        {glare && <span className="tilt-glare" aria-hidden />}
      </div>
    </div>
  )
}
