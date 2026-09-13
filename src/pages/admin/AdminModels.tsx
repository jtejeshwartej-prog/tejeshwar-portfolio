import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import FileUploadField from '@/components/admin/FileUploadField'
import { EmptyState, PublishToggle, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { models3dCol } from '@/services/collections'
import { deleteFileByUrl } from '@/services/storage'
import { nextOrderValue } from '@/lib/reorder'
import { useToast } from '@/hooks/useToast'
import ModelViewer from '@/components/three/ModelViewer'
import type { Model3DItem, Model3DFormat } from '@/types'

const BLANK: Omit<Model3DItem, 'id' | 'createdAt' | 'order'> = {
  title: '',
  description: '',
  format: 'glb',
  url: '',
  thumbnail: '',
  published: false,
}

const FORMATS: Model3DFormat[] = ['glb', 'gltf', 'obj']

function detectFormat(fileName: string): Model3DFormat {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'obj') return 'obj'
  if (ext === 'gltf') return 'gltf'
  return 'glb'
}

export default function AdminModels() {
  const [items, setItems] = useState<Model3DItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Model3DItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<Model3DItem | null>(null)
  const { toast, showToast } = useToast()

  useEffect(() => {
    models3dCol
      .list()
      .then((d) => setItems(d.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => showToast('Failed to load 3D models.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(item: Model3DItem) {
    setEditingId(item.id)
    const { id: _id, createdAt: _c, order: _o, ...rest } = item
    setForm(rest)
  }

  function resetForm() {
    setEditingId(null)
    setForm(BLANK)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.url) {
      showToast('Title and model file are required.', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await models3dCol.update(editingId, form)
        setItems((prev) => prev.map((x) => (x.id === editingId ? { ...x, ...form } : x)))
        showToast('Model updated.')
      } else {
        const newId = await models3dCol.create({ ...form, order: nextOrderValue(items), createdAt: Date.now() })
        setItems((prev) => [{ id: newId, ...form, order: nextOrderValue(items), createdAt: Date.now() }, ...prev])
        showToast('Model added.')
      }
      resetForm()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item: Model3DItem) {
    await models3dCol.update(item.id, { published: !item.published })
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, published: !x.published } : x)))
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await models3dCol.remove(toDelete.id)
      await deleteFileByUrl(toDelete.url)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      showToast('Model deleted.')
    } catch {
      showToast('Could not delete model.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">3D Models</h1>
        <p className="text-white/50 mt-2 text-sm">{items.length} total</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 glass rounded-2xl p-6 space-y-4 max-w-xl">
          <h2 className="font-medium text-sm">{editingId ? 'Edit model' : 'Add model'}</h2>
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Format</label>
            <select className="input-field" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as Model3DFormat })}>
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <FileUploadField
            label="Model file (.glb / .gltf / .obj)"
            ruleKey="model"
            value={form.url}
            onUploaded={(url, fileName) => setForm({ ...form, url, format: detectFormat(fileName || url) })}
            accept=".glb,.gltf,.obj"
          />
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add model'}</button>
            {editingId && <button onClick={resetForm} className="btn-secondary text-sm">Cancel</button>}
          </div>
        </div>
      </Reveal>

      {preview && (
        <Reveal delay={0.08}>
          <div className="mt-6 glass rounded-2xl overflow-hidden aspect-video max-w-xl">
            <ModelViewer url={preview.url} format={preview.format} />
          </div>
        </Reveal>
      )}

      <div className="mt-8 space-y-3">
        {loading && <p className="text-white/40 text-sm">Loading…</p>}
        {!loading && items.length === 0 && <EmptyState>No 3D models yet.</EmptyState>}

        {items.map((item) => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-xs text-white/40 uppercase">{item.format}</p>
            </div>
            <button onClick={() => setPreview(item)} className="btn-secondary text-xs px-3 py-1.5">Preview</button>
            <PublishToggle published={item.published} onToggle={() => togglePublish(item)} />
            <button onClick={() => startEdit(item)} className="btn-secondary text-xs px-3 py-1.5">Edit</button>
            <button onClick={() => setToDelete(item)} className="text-xs px-3 py-1.5 text-red-300 hover:text-red-200">Delete</button>
          </div>
        ))}
      </div>

      <ConfirmDialog open={!!toDelete} title={`Delete "${toDelete?.title}"?`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
