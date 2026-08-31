import { useEffect, useRef, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// Label that "decodes" through random glyphs when its host button/link is hovered.
export default function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const raf = useRef(0)
  const running = useRef(false)
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // lock the width so surrounding icons don't jitter while glyphs cycle
    el.style.minWidth = `${el.offsetWidth}px`

    const host = el.closest('a,button') ?? el.parentElement
    if (!host) return

    const play = () => {
      if (running.current) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      running.current = true
      const start = performance.now()
      const duration = 480
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration)
        const reveal = Math.floor(p * text.length)
        let out = text.slice(0, reveal)
        for (let i = reveal; i < text.length; i++) {
          out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        setDisplay(out)
        if (p < 1) raf.current = requestAnimationFrame(tick)
        else {
          setDisplay(text)
          running.current = false
        }
      }
      raf.current = requestAnimationFrame(tick)
    }

    host.addEventListener('pointerenter', play)
    return () => {
      host.removeEventListener('pointerenter', play)
      cancelAnimationFrame(raf.current)
    }
  }, [text])

  return (
    <span ref={ref} className="scramble" aria-label={text}>
      {display}
    </span>
  )
}
