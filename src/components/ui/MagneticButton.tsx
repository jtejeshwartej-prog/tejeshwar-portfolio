import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  className?: string
  onClick?: () => void
  as?: 'button' | 'a' | 'link'
  href?: string
  to?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  as = 'button',
  href,
  to,
  target,
  rel,
  type = 'button',
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setPos({ x: x * 0.25, y: y * 0.25 })
  }

  function reset() {
    setPos({ x: 0, y: 0 })
  }

  const MotionLink = motion(Link)

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.4 }}
      className="inline-block"
    >
      {as === 'link' && to ? (
        <MotionLink to={to} className={className} onClick={onClick} aria-label={ariaLabel} whileTap={{ scale: 0.96 }}>
          {children}
        </MotionLink>
      ) : as === 'a' ? (
        <motion.a
          href={href}
          target={target}
          rel={rel}
          className={className}
          onClick={onClick}
          aria-label={ariaLabel}
          whileTap={{ scale: 0.96 }}
        >
          {children}
        </motion.a>
      ) : (
        <motion.button type={type} className={className} onClick={onClick} aria-label={ariaLabel} whileTap={{ scale: 0.96 }}>
          {children}
        </motion.button>
      )}
    </motion.div>
  )
}
