import { useRef } from 'react'
import type { PointerEvent } from 'react'
import type { Shot } from '../data/resume'

interface ShotGalleryProps {
  shots: Shot[]
  label?: string
}

// Horizontal, drag-to-scroll strip of workflow / product snapshots.
export default function ShotGallery({
  shots,
  label = '// workflow & product snapshots — drag →',
}: ShotGalleryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, x: 0, left: 0 })

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return // touch scrolls natively
    const el = ref.current
    if (!el) return
    drag.current = { down: true, x: e.clientX, left: el.scrollLeft }
    el.setPointerCapture(e.pointerId)
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return
    const el = ref.current
    if (!el) return
    el.scrollLeft = drag.current.left - (e.clientX - drag.current.x)
  }

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    drag.current.down = false
    ref.current?.releasePointerCapture(e.pointerId)
  }

  return (
    <>
      <div className="xp-gallery-label">{label}</div>
      <div
        ref={ref}
        className="xp-gallery"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {shots.map((s) => (
          <figure className="xp-shot" key={s.src}>
            <img src={s.src} alt={s.caption} loading="lazy" draggable={false} />
            <figcaption>{s.caption}</figcaption>
          </figure>
        ))}
      </div>
    </>
  )
}
