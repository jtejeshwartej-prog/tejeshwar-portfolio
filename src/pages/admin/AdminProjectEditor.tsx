import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Reveal from '@/components/ui/Reveal'
import FileUploadField from '@/components/admin/FileUploadField'
import { Toast } from '@/components/admin/AdminAtoms'
import { useToast } from '@/hooks/useToast'
import { projectsCol, presentationsCol, models3dCol } from '@/services/collections'
import { uploadFile } from '@/services/storage'
import { nextOrderValue } from '@/lib/reorder'
import type { Project, ProjectCategory, PresentationItem, Model3DItem } from '@/types'

const CATEGORIES: ProjectCategory[] = [
  'Programming',
  'Web Development',
  'Cybersecurity',
  'Electronics',
  '3D',
  'Design',
  'Creative',
  'Other',
]

const BLANK: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order'> = {
  title: '',
  description: '',
  longDescription: '',
  category: 'Web Development',
  thumbnail: '',
  images: [],
  videos: [],
  technologies: [],
  tags: [],
  links: {},
  date: new Date().toISOString().slice(0, 10),
  featured: false,
  published: false,
}

function ChipInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('')

  function add() {
    const v = draft.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setDraft('')
  }

  return (
    <div>
      <label className="text-sm text-white/60 mb-1.5 block">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span key={v} className="badge flex items-center gap-1.5">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`} className="text-white/40 hover:text-white">
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className="input-field"
        />
        <button type="button" onClick={add} className="btn-secondary text-xs px-4">Add</button>
      </div>
    </div>
  )
}

export default function AdminProjectEditor() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id
  const navigate = useNavigate()
  const { toast, showToast } = useToast()

  const [data, setData] = useState<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order'>>(BLANK)
  const [order, setOrder] = useState(0)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [presentations, setPresentations] = useState<PresentationItem[]>([])
  const [models, setModels] = useState<Model3DItem[]>([])

  useEffect(() => {
    presentationsCol.list().then(setPresentations).catch(() => {})
    models3dCol.list().then(setModels).catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) return
    projectsCol.get(id!).then((p) => {
      if (!p) return
      const { id: _id, createdAt: _c, updatedAt: _u, order: o, ...rest } = p
      setData(rest)
      setOrder(o)
      setLoading(false)
    })
  }, [id, isNew])

  function set<K extends keyof typeof data>(key: K, value: (typeof data)[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  async function handleImagesAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    try {
      const urls = await Promise.all(files.map((f) => uploadFile(f, 'projectMedia', undefined, data.title || 'untitled')))
      set('images', [...data.images, ...urls])
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.', 'error')
    } finally {
      e.target.value = ''
    }
  }

  async function handleVideoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadFile(file, 'projectMedia', undefined, data.title || 'untitled')
      set('videos', [...data.videos, url])
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.', 'error')
    } finally {
      e.target.value = ''
    }
  }

  async function handleSave() {
    if (!data.title.trim()) {
      showToast('Title is required.', 'error')
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        const allProjects = await projectsCol.list().catch(() => [])
        const newId = await projectsCol.create({
          ...data,
          order: nextOrderValue(allProjects),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        showToast('Project created.')
        navigate(`/admin/projects/${newId}`)
      } else {
        await projectsCol.update(id!, { ...data, order, updatedAt: Date.now() })
        showToast('Project saved.')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save project.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-white/40 text-sm">Loading…</p>

  return (
    <div className="max-w-3xl">
      <Reveal>
        <Link to="/admin/projects" className="text-xs text-white/40 hover:text-white">← All projects</Link>
        <div className="flex items-center justify-between mt-3 flex-wrap gap-4">
          <h1 className="font-display text-3xl font-semibold">{isNew ? 'New project' : 'Edit project'}</h1>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={data.featured} onChange={(e) => set('featured', e.target.checked)} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={data.published} onChange={(e) => set('published', e.target.checked)} />
              Published
            </label>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 space-y-6">
        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Title</label>
          <input className="input-field" value={data.title} onChange={(e) => set('title', e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Short description</label>
          <textarea className="input-field resize-none" rows={2} value={data.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Long description</label>
          <textarea className="input-field resize-none" rows={5} value={data.longDescription} onChange={(e) => set('longDescription', e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Category</label>
            <select className="input-field" value={data.category} onChange={(e) => set('category', e.target.value as ProjectCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Date</label>
            <input type="date" className="input-field" value={data.date.slice(0, 10)} onChange={(e) => set('date', e.target.value)} />
          </div>
        </div>

        <FileUploadField
          label="Thumbnail"
          ruleKey="projectMedia"
          value={data.thumbnail}
          onUploaded={(url) => set('thumbnail', url)}
          accept="image/*"
          pathPrefix={data.title || 'untitled'}
        />

        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Gallery images</label>
          <div className="flex flex-wrap gap-3 mb-2">
            {data.images.map((img) => (
              <div key={img} className="relative">
                <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-white/10" />
                <button
                  type="button"
                  onClick={() => set('images', data.images.filter((i) => i !== img))}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <label className="btn-secondary text-xs px-4 py-2 cursor-pointer inline-block">
            Add images
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesAdd} />
          </label>
        </div>

        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Videos</label>
          <div className="space-y-2 mb-2">
            {data.videos.map((v) => (
              <div key={v} className="flex items-center gap-2 text-xs">
                <a href={v} target="_blank" rel="noreferrer" className="text-neon-cyan truncate max-w-xs">{v}</a>
                <button type="button" onClick={() => set('videos', data.videos.filter((x) => x !== v))} className="text-red-300">Remove</button>
              </div>
            ))}
          </div>
          <label className="btn-secondary text-xs px-4 py-2 cursor-pointer inline-block">
            Add video
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoAdd} />
          </label>
        </div>

        <ChipInput label="Technologies" values={data.technologies} onChange={(v) => set('technologies', v)} placeholder="React, TypeScript…" />
        <ChipInput label="Tags" values={data.tags} onChange={(v) => set('tags', v)} placeholder="favorite, hackathon…" />

        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">GitHub URL</label>
            <input className="input-field" value={data.links.github || ''} onChange={(e) => set('links', { ...data.links, github: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Live demo URL</label>
            <input className="input-field" value={data.links.live || ''} onChange={(e) => set('links', { ...data.links, live: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Docs URL</label>
            <input className="input-field" value={data.links.docs || ''} onChange={(e) => set('links', { ...data.links, docs: e.target.value })} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Linked presentation</label>
            <select className="input-field" value={data.presentationId || ''} onChange={(e) => set('presentationId', e.target.value || undefined)}>
              <option value="">None</option>
              {presentations.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Linked 3D model</label>
            <select className="input-field" value={data.model3dId || ''} onChange={(e) => set('model3dId', e.target.value || undefined)}>
              <option value="">None</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : isNew ? 'Create project' : 'Save changes'}
          </button>
          <Link to="/admin/projects" className="btn-secondary">Cancel</Link>
        </div>
      </div>

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
