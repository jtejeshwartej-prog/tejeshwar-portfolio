import { Link } from 'react-router-dom'
import Reveal from '@/components/ui/Reveal'
import MagneticButton from '@/components/ui/MagneticButton'

export default function NotFound() {
  return (
    <div className="section-container min-h-[70vh] flex flex-col items-center justify-center text-center">
      <Reveal>
        <p className="font-display text-8xl font-semibold heading-gradient">404</p>
        <p className="text-white/50 mt-4 max-w-sm mx-auto">
          This page doesn't exist — it may have been moved, or the link might be broken.
        </p>
        <div className="mt-8">
          <MagneticButton as="link" to="/" className="btn-primary">
            Back to home
          </MagneticButton>
        </div>
      </Reveal>
    </div>
  )
}
