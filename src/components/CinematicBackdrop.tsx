import { useEffect, useRef } from 'react'
import { scenes } from '../data/brand'

/**
 * Procedural cinematic backdrop.
 *
 * A single fixed canvas behind the whole page: a slow-drifting volumetric
 * nebula, an anamorphic light bar, and animated film grain. The wash is
 * tinted by whichever scene currently owns the viewport, so scrolling reads
 * as one continuous camera move through changing light rather than a series
 * of separate pages.
 *
 * Rendered at half resolution and capped at 30fps — it is atmosphere, not
 * detail, so nobody can tell, and it leaves the GPU budget to the hero's
 * WebGL scene. Sleeps entirely when the tab is hidden or when the reader
 * asks for reduced motion.
 */

interface Blob {
  /** lissajous phase + rate, so paths never repeat exactly */
  ax: number
  ay: number
  sx: number
  sy: number
  r: number
  weight: number
}

const BLOBS: Blob[] = [
  { ax: 0.18, ay: 0.11, sx: 0.00007, sy: 0.00005, r: 0.55, weight: 0.85 },
  { ax: 0.72, ay: 0.28, sx: -0.00005, sy: 0.00009, r: 0.42, weight: 0.6 },
  { ax: 0.48, ay: 0.82, sx: 0.00009, sy: -0.00006, r: 0.5, weight: 0.5 },
  { ax: 0.9, ay: 0.6, sx: -0.00008, sy: -0.00004, r: 0.34, weight: 0.4 },
]

type RGB = [number, number, number]

export default function CinematicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // current + target tint, lerped every frame for a soft cross-fade
  const tint = useRef<{ now: RGB; to: RGB }>({
    now: [139, 123, 255],
    to: [139, 123, 255],
  })

  // Track which scene owns the viewport and retarget the wash.
  useEffect(() => {
    const els = scenes
      .map((s) => {
        const el = document.getElementById(s.id)
        return el ? ([el, s.tint] as const) : null
      })
      .filter((x): x is readonly [HTMLElement, RGB] => x !== null)

    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const hit = els.find(([el]) => el === e.target)
          if (hit) tint.current.to = hit[1]
        }
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: 0 },
    )
    els.forEach(([el]) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // --- film grain tiles, pre-rendered once and cycled ---
    const GRAIN_TILES = 3
    const GRAIN_SIZE = 128
    const grain: HTMLCanvasElement[] = []
    for (let t = 0; t < GRAIN_TILES; t++) {
      const g = document.createElement('canvas')
      g.width = g.height = GRAIN_SIZE
      const gc = g.getContext('2d')!
      const img = gc.createImageData(GRAIN_SIZE, GRAIN_SIZE)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * 255
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 15
      }
      gc.putImageData(img, 0, 0)
      grain.push(g)
    }

    let w = 0
    let h = 0
    const SCALE = 0.5

    const resize = () => {
      w = Math.max(1, Math.floor(window.innerWidth * SCALE))
      h = Math.max(1, Math.floor(window.innerHeight * SCALE))
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let raf = 0
    let last = 0
    let frame = 0
    const FRAME_MS = 1000 / 30

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (t - last < FRAME_MS) return
      last = t
      frame++

      // ease the wash toward the active scene's tint
      const { now, to } = tint.current
      for (let i = 0; i < 3; i++) now[i] += (to[i] - now[i]) * 0.02

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      const time = reduce ? 0 : t

      for (const b of BLOBS) {
        const x = (b.ax + Math.sin(time * b.sx) * 0.1) * w
        const y = (b.ay + Math.cos(time * b.sy) * 0.1) * h
        const r = b.r * Math.max(w, h)
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        const [cr, cg, cb] = now
        g.addColorStop(0, `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${0.1 * b.weight})`)
        g.addColorStop(0.45, `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${0.035 * b.weight})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // anamorphic streak — a single wide, very soft horizontal bar
      const by = (0.32 + Math.sin(time * 0.00004) * 0.12) * h
      const bar = ctx.createLinearGradient(0, by - h * 0.06, 0, by + h * 0.06)
      const [r0, g0, b0] = now
      bar.addColorStop(0, 'rgba(0,0,0,0)')
      bar.addColorStop(0.5, `rgba(${r0 | 0}, ${g0 | 0}, ${b0 | 0}, 0.05)`)
      bar.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = bar
      ctx.fillRect(0, by - h * 0.06, w, h * 0.12)

      // grain on top, normal blend
      ctx.globalCompositeOperation = 'source-over'
      const tile = grain[frame % GRAIN_TILES]
      const pat = ctx.createPattern(tile, 'repeat')
      if (pat) {
        ctx.fillStyle = pat
        ctx.fillRect(0, 0, w, h)
      }
    }

    const start = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    const onVis = () => (document.hidden ? stop() : start())

    document.addEventListener('visibilitychange', onVis)
    start()

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="backdrop" aria-hidden>
      <canvas ref={canvasRef} className="backdrop-canvas" />
      <div className="backdrop-vignette" />
      <div className="backdrop-scan" />
    </div>
  )
}
