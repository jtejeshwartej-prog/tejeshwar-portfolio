import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import FileUploadField from '@/components/admin/FileUploadField'
import { EmptyState, PublishToggle, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { documentsCol } from '@/services/collections'
import { deleteFileByUrl } from '@/services/storage'
import { nextOrderValue } from '@/lib/reorder'
import { useToast } from '@/hooks/useToast'
import type { DocumentItem, DocKind } from '@/types'

const BLANK: Omit<DocumentItem, 'id' | 'createdAt' | 'order'> = {
  title: '',
  description: '',
  kind: 'pdf',
  url: '',
  fileName: '',
  published: false,
}

const KINDS: DocKind[] = ['pdf', 'word', 'text', 'other']

export default function AdminDocuments() {
  const [items, setItems] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<DocumentItem | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    documentsCol
      .list()
      .then((d) => setItems(d.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => showToast('Failed to load documents.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(item: DocumentItem) {
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
        await documentsCol.update(editingId, form)
        setItems((prev) => prev.map((x) => (x.id === editingId ? { ...x, ...form } : x)))
        showToast('Document updated.')
      } else {
        const newId = await documentsCol.create({ ...form, order: nextOrderValue(items), createdAt: Date.now() })
        setItems((prev) => [{ id: newId, ...form, order: nextOrderValue(items), createdAt: Date.now() }, ...prev])
        showToast('Document added.')
      }
      resetForm()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item: DocumentItem) {
    await documentsCol.update(item.id, { published: !item.published })
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, published: !x.published } : x)))
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await documentsCol.remove(toDelete.id)
      await deleteFileByUrl(toDelete.url)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      showToast('Document deleted.')
    } catch {
      showToast('Could not delete document.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Documents</h1>
        <p className="text-white/50 mt-2 text-sm">{items.length} total</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 glass rounded-2xl p-6 space-y-4 max-w-xl">
          <h2 className="font-medium text-sm">{editingId ? 'Edit document' : 'Add document'}</h2>
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Kind</label>
            <select className="input-field" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as DocKind })}>
              {KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <FileUploadField
            label="File"
            ruleKey="document"
            value={form.url}
            onUploaded={(url) => setForm({ ...form, url, fileName: url.split('/').pop() || form.fileName })}
            accept=".pdf,.doc,.docx,.txt"
          />
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add document'}</button>
            {editingId && <button onClick={resetForm} className="btn-secondary text-sm">Cancel</button>}
          </div>
        </div>
      </Reveal>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-white/40 text-sm">Loading…</p>}
        {!loading && items.length === 0 && <EmptyState>No documents yet.</EmptyState>}

        {items.map((item) => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-xs text-white/40 uppercase">{item.kind}</p>
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
