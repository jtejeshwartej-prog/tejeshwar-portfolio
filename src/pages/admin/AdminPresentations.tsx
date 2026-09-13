import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import FileUploadField from '@/components/admin/FileUploadField'
import { EmptyState, PublishToggle, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { presentationsCol } from '@/services/collections'
import { deleteFileByUrl } from '@/services/storage'
import { nextOrderValue } from '@/lib/reorder'
import { useToast } from '@/hooks/useToast'
import type { PresentationItem } from '@/types'

const BLANK: Omit<PresentationItem, 'id' | 'createdAt' | 'order'> = {
  title: '',
  description: '',
  url: '',
  thumbnail: '',
  published: false,
}

export default function AdminPresentations() {
  const [items, setItems] = useState<PresentationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<PresentationItem | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    presentationsCol
      .list()
      .then((d) => setItems(d.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => showToast('Failed to load presentations.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(item: PresentationItem) {
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
        await presentationsCol.update(editingId, form)
        setItems((prev) => prev.map((x) => (x.id === editingId ? { ...x, ...form } : x)))
        showToast('Presentation updated.')
      } else {
        const newId = await presentationsCol.create({ ...form, order: nextOrderValue(items), createdAt: Date.now() })
        setItems((prev) => [{ id: newId, ...form, order: nextOrderValue(items), createdAt: Date.now() }, ...prev])
        showToast('Presentation added.')
      }
      resetForm()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item: PresentationItem) {
    await presentationsCol.update(item.id, { published: !item.published })
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, published: !x.published } : x)))
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await presentationsCol.remove(toDelete.id)
      await deleteFileByUrl(toDelete.url)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      showToast('Presentation deleted.')
    } catch {
      showToast('Could not delete presentation.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Presentations</h1>
        <p className="text-white/50 mt-2 text-sm">{items.length} total</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 glass rounded-2xl p-6 space-y-4 max-w-xl">
          <h2 className="font-medium text-sm">{editingId ? 'Edit presentation' : 'Add presentation'}</h2>
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FileUploadField label="Presentation file (PDF/PPTX)" ruleKey="presentation" value={form.url} onUploaded={(url) => setForm({ ...form, url })} accept=".pdf,.ppt,.pptx" />
          <FileUploadField label="Thumbnail (optional)" ruleKey="gallery" value={form.thumbnail} onUploaded={(url) => setForm({ ...form, thumbnail: url })} accept="image/*" />
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add presentation'}</button>
            {editingId && <button onClick={resetForm} className="btn-secondary text-sm">Cancel</button>}
          </div>
        </div>
      </Reveal>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-white/40 text-sm">Loading…</p>}
        {!loading && items.length === 0 && <EmptyState>No presentations yet.</EmptyState>}

        {items.map((item) => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{item.title}</p>
            </div>
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
