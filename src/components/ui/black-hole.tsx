'use client'

import { useEffect, useRef } from 'react'
import { createRenderer } from './black-hole-utils/renderer'
import { cn } from '@/lib/utils'

export interface BlackHoleProps {
  className?: string
  /** Render scale on top of DPR — 0.7 is plenty when used as a backdrop. */
  resolutionScale?: number
  /** Raymarch step budget multiplier, 0.5–1.5. */
  quality?: number
  /** Overall brightness. */
  intensity?: number
  /** Disk palette, inner → outer. Defaults to the site accent ramp. */
  colors?: { inner: string; mid: string; outer: string }
  /** Camera parallax follows the pointer. */
  interactive?: boolean
  /** Stop rendering while scrolled out of view. */
  pauseWhenOffscreen?: boolean
}

export function BlackHole({
  className,
  resolutionScale,
  quality,
  intensity,
  colors,
  interactive,
  pauseWhenOffscreen,
}: BlackHoleProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Colours arrive as a fresh object each render; key the effect on the values
  // instead so a parent re-render doesn't tear down the WebGL context.
  const colorKey = colors ? `${colors.inner}|${colors.mid}|${colors.outer}` : ''

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = createRenderer({
      canvas,
      resolutionScale,
      quality,
      intensity,
      colors,
      interactive,
      pauseWhenOffscreen,
    })
    void renderer.ready

    return () => renderer.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolutionScale, quality, intensity, colorKey, interactive, pauseWhenOffscreen])

  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-black', className)}>
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  )
}

/** Alias kept so the upstream demo (`import Component from '@/components/ui/black-hole'`) works. */
export const Example = BlackHole

export default BlackHole
