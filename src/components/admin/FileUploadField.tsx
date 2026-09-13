import { useRef, useState } from 'react'
import { uploadFile, UPLOAD_RULES } from '@/services/storage'

interface Props {
  label: string
  ruleKey: keyof typeof UPLOAD_RULES
  value?: string
  onUploaded: (url: string, fileName?: string) => void
  accept?: string
  pathPrefix?: string
  hint?: string
}

export default function FileUploadField({ label, ruleKey, value, onUploaded, accept, pathPrefix, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setProgress(0)
    try {
      const url = await uploadFile(file, ruleKey, (pct) => setProgress(pct), pathPrefix)
      onUploaded(url, file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const rule = UPLOAD_RULES[ruleKey]
  const isImage = value && rule.acceptedTypes.some((t) => t.startsWith('image/')) && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value)

  return (
    <div>
      <label className="text-sm text-white/60 mb-1.5 block">{label}</label>
      <div className="flex items-center gap-3 flex-wrap">
        {isImage && <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover border border-white/10" />}
        {value && !isImage && (
          <a href={value} target="_blank" rel="noreferrer" className="badge">
            Current file ↗
          </a>
        )}
        <label className="btn-secondary text-xs px-4 py-2 cursor-pointer">
          {value ? 'Replace' : 'Upload'}
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
        </label>
        {progress !== null && <span className="text-xs text-white/40">{progress}%</span>}
      </div>
      {hint && <p className="text-xs text-white/30 mt-1.5">{hint}</p>}
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  )
}
