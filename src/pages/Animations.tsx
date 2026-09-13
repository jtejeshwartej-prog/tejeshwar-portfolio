import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { animationsCol } from '@/services/collections'
import type { AnimationItem } from '@/types'

export default function Animations() {
  const [items, setItems] = useState<AnimationItem[]>([])

  useEffect(() => {
    animationsCol.listPublished().then(setItems).catch(() => {})
  }, [])

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Animations</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Motion experiments.</h1>
      </Reveal>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.05}>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="aspect-video bg-black">
                {a.kind === 'gif' ? (
                  <img src={a.url} alt={a.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <video src={a.url} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-sm">{a.title}</p>
                {a.description && <p className="text-xs text-white/40 mt-1">{a.description}</p>}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {items.length === 0 && <p className="text-white/40 mt-16 text-center">No animations published yet.</p>}
    </div>
  )
}
