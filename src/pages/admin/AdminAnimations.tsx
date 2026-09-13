import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import FileUploadField from '@/components/admin/FileUploadField'
import { EmptyState, PublishToggle, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { animationsCol } from '@/services/collections'
import { deleteFileByUrl } from '@/services/storage'
import { nextOrderValue } from '@/lib/reorder'
import { useToast } from '@/hooks/useToast'
import type { AnimationItem } from '@/types'

const BLANK: Omit<AnimationItem, 'id' | 'createdAt' | 'order'> = {
  title: '',
  description: '',
  kind: 'gif',
  url: '',
  published: false,
}

function detectKind(fileName: string): AnimationItem['kind'] {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'webm') return 'webm'
  if (ext === 'mp4') return 'mp4'
  return 'gif'
}

export default function AdminAnimations() {
  const [items, setItems] = useState<AnimationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<AnimationItem | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    animationsCol
      .list()
      .then((d) => setItems(d.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => showToast('Failed to load animations.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(item: AnimationItem) {
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
      showToast('Title and file are required.', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await animationsCol.update(editingId, form)
        setItems((prev) => prev.map((x) => (x.id === editingId ? { ...x, ...form } : x)))
        showToast('Animation updated.')
      } else {
        const newId = await animationsCol.create({ ...form, order: nextOrderValue(items), createdAt: Date.now() })
        setItems((prev) => [{ id: newId, ...form, order: nextOrderValue(items), createdAt: Date.now() }, ...prev])
        showToast('Animation added.')
      }
      resetForm()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item: AnimationItem) {
    await animationsCol.update(item.id, { published: !item.published })
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, published: !x.published } : x)))
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await animationsCol.remove(toDelete.id)
      await deleteFileByUrl(toDelete.url)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      showToast('Animation deleted.')
    } catch {
      showToast('Could not delete animation.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Animations</h1>
        <p className="text-white/50 mt-2 text-sm">{items.length} total</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 glass rounded-2xl p-6 space-y-4 max-w-xl">
          <h2 className="font-medium text-sm">{editingId ? 'Edit animation' : 'Add animation'}</h2>
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FileUploadField
            label="File (.gif / .mp4 / .webm)"
            ruleKey="animation"
            value={form.url}
            onUploaded={(url, fileName) => setForm({ ...form, url, kind: detectKind(fileName || url) })}
            accept=".gif,.mp4,.webm"
          />
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add animation'}</button>
            {editingId && <button onClick={resetForm} className="btn-secondary text-sm">Cancel</button>}
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="text-white/40 text-sm">Loading…</p>}
        {!loading && items.length === 0 && <EmptyState>No animations yet.</EmptyState>}

        {items.map((item) => (
          <div key={item.id} className="glass rounded-xl overflow-hidden">
            <div className="aspect-video bg-black">
              {item.kind === 'gif' ? (
                <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <video src={item.url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
              )}
            </div>
            <div className="p-4">
              <p className="font-medium text-sm truncate">{item.title}</p>
              <div className="flex items-center justify-between mt-3">
                <PublishToggle published={item.published} onToggle={() => togglePublish(item)} />
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="btn-secondary text-xs px-3 py-1.5">Edit</button>
                  <button onClick={() => setToDelete(item)} className="text-xs px-3 py-1.5 text-red-300 hover:text-red-200">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog open={!!toDelete} title={`Delete "${toDelete?.title}"?`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
