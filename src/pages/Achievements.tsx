import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { achievementsCol } from '@/services/collections'
import type { Achievement } from '@/types'

export default function Achievements() {
  const [items, setItems] = useState<Achievement[]>([])
  const [active, setActive] = useState<Achievement | null>(null)

  useEffect(() => {
    achievementsCol.listPublished().then(setItems).catch(() => {})
  }, [])

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Achievements</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Certificates, awards & milestones.</h1>
      </Reveal>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.05}>
            <button onClick={() => setActive(a)} className="w-full text-left glass rounded-2xl p-5 hover:bg-white/[0.07] transition-colors">
              {a.image && <img src={a.image} alt="" className="rounded-lg mb-4 h-36 w-full object-cover" loading="lazy" />}
              <p className="text-xs text-white/40 font-mono">{a.date}</p>
              <h3 className="font-medium mt-2">{a.title}</h3>
              <p className="text-sm text-white/50 mt-2 line-clamp-2">{a.description}</p>
            </button>
          </Reveal>
        ))}
      </div>

      {items.length === 0 && <p className="text-white/40 mt-16 text-center">No achievements published yet.</p>}

      {active && (
        <div className="fixed inset-0 z-[95] bg-black/85 flex items-center justify-center p-6" onClick={() => setActive(null)}>
          <div className="glass rounded-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            {active.image && <img src={active.image} alt="" className="rounded-xl mb-6 w-full object-cover max-h-72" />}
            <p className="text-xs text-white/40 font-mono">{active.date}</p>
            <h2 className="font-display text-2xl font-semibold mt-2">{active.title}</h2>
            <p className="text-white/60 mt-4 leading-relaxed whitespace-pre-line">{active.description}</p>
            <div className="mt-6 flex gap-3">
              {active.fileUrl && (
                <a href={active.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs px-4 py-2">
                  View certificate
                </a>
              )}
              <button onClick={() => setActive(null)} className="btn-secondary text-xs px-4 py-2">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
