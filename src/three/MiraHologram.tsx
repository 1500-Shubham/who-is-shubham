import { Canvas } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { MiraFigure, HoloBase, ScanRing } from './MiraFigure'

export default function MiraHologram() {
  const wrap = useRef<HTMLDivElement>(null)
  const hovered = useRef(false)
  const inView = useInView(wrap, { margin: '-12% 0px' })

  return (
    <div
      ref={wrap}
      className="mira-canvas"
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
    >
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, 1.8]}
        camera={{ position: [0, 0.1, 6.1], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
      >
        <MiraFigure active={inView} hovered={hovered} />
        <HoloBase />
        <ScanRing />
        <Sparkles count={55} scale={[3.6, 4.6, 2]} position={[0, -0.2, 0]} size={1.6} speed={0.5} color="#8fe8ff" opacity={0.55} />
      </Canvas>
    </div>
  )
}
