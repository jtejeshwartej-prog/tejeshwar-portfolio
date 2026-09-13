import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { models3dCol } from '@/services/collections'
import type { Model3DItem } from '@/types'
import ModelViewer from '@/components/three/ModelViewer'

export default function ThreeDShowcase() {
  const [models, setModels] = useState<Model3DItem[]>([])
  const [active, setActive] = useState<Model3DItem | null>(null)

  useEffect(() => {
    models3dCol.listPublished().then((m) => {
      setModels(m)
      if (m.length) setActive(m[0])
    }).catch(() => {})
  }, [])

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">3D Showcase</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Interactive 3D models.</h1>
      </Reveal>

      {models.length === 0 ? (
        <p className="text-white/40 mt-16 text-center">No 3D models published yet.</p>
      ) : (
        <div className="mt-12 grid lg:grid-cols-[1fr_320px] gap-6">
          <Reveal delay={0.05}>
            <div className="glass rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:h-[560px]">
              {active && <ModelViewer url={active.url} format={active.format} />}
            </div>
            {active && (
              <div className="mt-4">
                <h2 className="font-display text-xl font-medium">{active.title}</h2>
                {active.description && <p className="text-white/50 mt-2 text-sm">{active.description}</p>}
                <p className="text-xs text-white/30 mt-2 uppercase tracking-wide">{active.format} · drag to rotate · scroll to zoom</p>
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActive(m)}
                  className={`glass rounded-xl p-4 text-left transition-colors ${
                    active?.id === m.id ? 'border-neon-violet/50 bg-white/[0.07]' : ''
                  }`}
                >
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-white/40 mt-1 uppercase">{m.format}</p>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      )}
    </div>
  )
}
