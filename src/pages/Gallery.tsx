import { useEffect, useMemo, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { galleryCol } from '@/services/collections'
import type { GalleryItem } from '@/types'

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [category, setCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    galleryCol.listPublished().then(setItems).catch(() => {})
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))], [items])
  const filtered = category === 'All' ? items : items.filter((i) => i.category === category)

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Gallery</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Visual gallery.</h1>
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

      <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
        {filtered.map((item, i) => (
          <Reveal key={item.id} delay={Math.min(i * 0.03, 0.4)} className="break-inside-avoid">
            <button
              onClick={() => setLightboxIndex(i)}
              className="group block w-full rounded-2xl overflow-hidden glass"
              aria-label={`Open ${item.title}`}
            >
              <img src={item.url} alt={item.title} loading="lazy" className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500" />
            </button>
          </Reveal>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-white/40 mt-16 text-center">No images published yet.</p>}

      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[95] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-6 right-6 badge"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex(null)
            }}
          >
            Close
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 sm:left-8 badge"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i !== null ? i - 1 : i))
              }}
              aria-label="Previous image"
            >
              ←
            </button>
          )}
          {lightboxIndex < filtered.length - 1 && (
            <button
              className="absolute right-4 sm:right-8 badge"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i !== null ? i + 1 : i))
              }}
              aria-label="Next image"
            >
              →
            </button>
          )}
          <img
            src={filtered[lightboxIndex].url}
            alt={filtered[lightboxIndex].title}
            className="max-h-full max-w-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
