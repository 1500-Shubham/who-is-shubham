import { useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'

interface MagneticProps {
  children: ReactNode
  strength?: number
}

// Children gently gravitate toward the cursor while hovered.
export default function Magnetic({ children, strength = 0.22 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) * strength
    const dy = (e.clientY - (r.top + r.height / 2)) * strength
    el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0px, 0px)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        display: 'inline-block',
        transition: 'transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.4)',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
