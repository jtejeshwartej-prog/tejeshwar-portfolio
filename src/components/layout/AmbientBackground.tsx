import { useEffect, useRef } from 'react'

// Lightweight canvas particle field — cheaper than a full R3F scene
// for a background effect that runs behind every page.
export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    let raf = 0

    const COUNT = Math.min(70, Math.floor((width * height) / 22000))
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      hue: Math.random() > 0.5 ? '59,130,246' : '139,92,246',
      alpha: Math.random() * 0.5 + 0.15,
    }))

    function resize() {
      width = canvas!.width = window.innerWidth
      height = canvas!.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    function draw() {
      ctx!.clearRect(0, 0, width, height)
      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0
        }
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${p.hue},${p.alpha})`
        ctx!.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-void-950">
      <div className="absolute inset-0 bg-radial-fade" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
      <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-neon-violet/20 blur-[120px] animate-float-slow" />
      <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-neon-blue/20 blur-[120px] animate-float" />
    </div>
  )
}
