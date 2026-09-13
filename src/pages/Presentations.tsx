import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import TiltCard from '@/components/ui/TiltCard'
import { presentationsCol } from '@/services/collections'
import type { PresentationItem } from '@/types'

export default function Presentations() {
  const [items, setItems] = useState<PresentationItem[]>([])
  const [active, setActive] = useState<PresentationItem | null>(null)

  useEffect(() => {
    presentationsCol.listPublished().then(setItems).catch(() => {})
  }, [])

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Presentations</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Talks & presentations.</h1>
      </Reveal>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06}>
            <TiltCard className="cursor-pointer" >
              <button onClick={() => setActive(p)} className="w-full text-left block">
                <div className="aspect-video bg-white/5 overflow-hidden">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white/20 text-4xl">▤</div>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-medium">{p.title}</p>
                  {p.description && <p className="text-sm text-white/50 mt-2 line-clamp-2">{p.description}</p>}
                </div>
              </button>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {items.length === 0 && <p className="text-white/40 mt-16 text-center">No presentations published yet.</p>}

      {active && (
        <div className="fixed inset-0 z-[95] bg-black/90 flex flex-col items-center justify-center p-4 sm:p-10" onClick={() => setActive(null)}>
          <div className="w-full max-w-5xl h-[80vh] glass rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <iframe src={active.url} title={active.title} className="w-full h-full" />
          </div>
          <div className="flex justify-between w-full max-w-5xl mt-4">
            <p className="text-white/70">{active.title}</p>
            <a href={active.url} target="_blank" rel="noreferrer" className="text-neon-cyan text-sm">Open in new tab ↗</a>
          </div>
        </div>
      )}
    </div>
  )
}
