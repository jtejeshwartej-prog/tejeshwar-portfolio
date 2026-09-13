import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { documentsCol } from '@/services/collections'
import type { DocumentItem } from '@/types'

const KIND_LABEL: Record<DocumentItem['kind'], string> = {
  pdf: 'PDF',
  word: 'Word',
  text: 'Text',
  other: 'File',
}

export default function Documents() {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [preview, setPreview] = useState<DocumentItem | null>(null)

  useEffect(() => {
    documentsCol.listPublished().then(setDocs).catch(() => {})
  }, [])

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Documents</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Documents & write-ups.</h1>
      </Reveal>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {docs.map((d, i) => (
          <Reveal key={d.id} delay={i * 0.05}>
            <div className="glass rounded-2xl p-5 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <p className="badge">{KIND_LABEL[d.kind]}</p>
              </div>
              <p className="font-medium mt-4">{d.title}</p>
              {d.description && <p className="text-sm text-white/50 mt-2 line-clamp-3">{d.description}</p>}
              <div className="mt-auto pt-5 flex gap-3">
                {d.kind === 'pdf' && (
                  <button onClick={() => setPreview(d)} className="btn-secondary text-xs px-4 py-2">
                    Preview
                  </button>
                )}
                <a href={d.url} target="_blank" rel="noreferrer" className="btn-secondary text-xs px-4 py-2">
                  Download
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {docs.length === 0 && <p className="text-white/40 mt-16 text-center">No documents published yet.</p>}

      {preview && (
        <div className="fixed inset-0 z-[95] bg-black/90 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="w-full max-w-4xl h-[85vh] glass rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <iframe src={preview.url} title={preview.title} className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  )
}
