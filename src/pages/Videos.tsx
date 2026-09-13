import { useEffect, useMemo, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { videosCol } from '@/services/collections'
import type { VideoItem } from '@/types'

export default function Videos() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [category, setCategory] = useState('All')
  const [active, setActive] = useState<VideoItem | null>(null)

  useEffect(() => {
    videosCol.listPublished().then(setVideos).catch(() => {})
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(videos.map((v) => v.category).filter(Boolean)))], [videos])
  const filtered = category === 'All' ? videos : videos.filter((v) => v.category === category)

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Videos</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Video portfolio.</h1>
      </Reveal>

      {categories.length > 1 && (
        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  category === c ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((v, i) => (
          <Reveal key={v.id} delay={i * 0.05}>
            <button onClick={() => setActive(v)} className="group block w-full text-left glass rounded-2xl overflow-hidden">
              <div className="aspect-video bg-black relative overflow-hidden">
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <video src={v.url} className="h-full w-full object-cover" muted />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <div className="h-12 w-12 rounded-full glass flex items-center justify-center">▶</div>
                </div>
              </div>
              <div className="p-4">
                <p className="badge mb-2">{v.category}</p>
                <p className="font-medium text-sm">{v.title}</p>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-white/40 mt-16 text-center">No videos published yet.</p>}

      {active && (
        <div
          className="fixed inset-0 z-[95] bg-black/90 flex flex-col items-center justify-center p-4 sm:p-10"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <video src={active.url} controls autoPlay className="w-full rounded-xl max-h-[80vh]" />
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="font-medium">{active.title}</p>
                {active.description && <p className="text-sm text-white/50 mt-1">{active.description}</p>}
              </div>
              <button onClick={() => setActive(null)} className="btn-secondary" aria-label="Close video">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
