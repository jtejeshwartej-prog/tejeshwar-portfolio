import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'

export default function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState({ rx: 0, ry: 0, glowX: 50, glowY: 50 })

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setStyle({
      rx: (0.5 - py) * 8,
      ry: (px - 0.5) * 8,
      glowX: px * 100,
      glowY: py * 100,
    })
  }

  function reset() {
    setStyle({ rx: 0, ry: 0, glowX: 50, glowY: 50 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ rotateX: style.rx, rotateY: style.ry }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
      className={`relative glass glass-hover rounded-2xl overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${style.glowX}% ${style.glowY}%, rgba(139,92,246,0.18), transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  )
}
