import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import FileUploadField from '@/components/admin/FileUploadField'
import { EmptyState, PublishToggle, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { videosCol } from '@/services/collections'
import { deleteFileByUrl } from '@/services/storage'
import { nextOrderValue } from '@/lib/reorder'
import { useToast } from '@/hooks/useToast'
import type { VideoItem } from '@/types'

const BLANK: Omit<VideoItem, 'id' | 'createdAt' | 'order'> = {
  title: '',
  description: '',
  category: 'General',
  url: '',
  thumbnail: '',
  published: false,
}

export default function AdminVideos() {
  const [items, setItems] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<VideoItem | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    videosCol
      .list()
      .then((d) => setItems(d.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => showToast('Failed to load videos.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(item: VideoItem) {
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
      showToast('Title and video file are required.', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await videosCol.update(editingId, form)
        setItems((prev) => prev.map((x) => (x.id === editingId ? { ...x, ...form } : x)))
        showToast('Video updated.')
      } else {
        const newId = await videosCol.create({ ...form, order: nextOrderValue(items), createdAt: Date.now() })
        setItems((prev) => [{ id: newId, ...form, order: nextOrderValue(items), createdAt: Date.now() }, ...prev])
        showToast('Video added.')
      }
      resetForm()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item: VideoItem) {
    await videosCol.update(item.id, { published: !item.published })
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, published: !x.published } : x)))
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await videosCol.remove(toDelete.id)
      await deleteFileByUrl(toDelete.url)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      showToast('Video deleted.')
    } catch {
      showToast('Could not delete video.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Videos</h1>
        <p className="text-white/50 mt-2 text-sm">{items.length} total</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 glass rounded-2xl p-6 space-y-4 max-w-xl">
          <h2 className="font-medium text-sm">{editingId ? 'Edit video' : 'Add video'}</h2>
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input className="input-field" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <FileUploadField label="Video file" ruleKey="video" value={form.url} onUploaded={(url) => setForm({ ...form, url })} accept="video/*" />
          <FileUploadField label="Thumbnail (optional)" ruleKey="gallery" value={form.thumbnail} onUploaded={(url) => setForm({ ...form, thumbnail: url })} accept="image/*" />
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add video'}</button>
            {editingId && <button onClick={resetForm} className="btn-secondary text-sm">Cancel</button>}
          </div>
        </div>
      </Reveal>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-white/40 text-sm">Loading…</p>}
        {!loading && items.length === 0 && <EmptyState>No videos yet.</EmptyState>}

        {items.map((item) => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="h-14 w-24 rounded-lg overflow-hidden bg-black shrink-0">
              <video src={item.url} className="h-full w-full object-cover" muted />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-xs text-white/40">{item.category}</p>
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
