import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { EmptyState, OrderButtons, PublishToggle, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { galleryCol } from '@/services/collections'
import { uploadFile, deleteFileByUrl } from '@/services/storage'
import { swapOrder, nextOrderValue } from '@/lib/reorder'
import { useToast } from '@/hooks/useToast'
import type { GalleryItem } from '@/types'

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [category, setCategory] = useState('General')
  const [tagsDraft, setTagsDraft] = useState('')
  const [toDelete, setToDelete] = useState<GalleryItem | null>(null)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const { toast, showToast } = useToast()

  useEffect(() => {
    galleryCol
      .list()
      .then((d) => setItems(d.sort((a, b) => a.order - b.order)))
      .catch(() => showToast('Failed to load gallery.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const base = nextOrderValue(items)
      const created: GalleryItem[] = []
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i], 'gallery', setProgress)
        const tags = tagsDraft.split(',').map((t) => t.trim()).filter(Boolean)
        const newId = await galleryCol.create({
          title: files[i].name.replace(/\.[^.]+$/, ''),
          url,
          category,
          tags,
          published: true,
          order: base + i,
          createdAt: Date.now(),
        })
        created.push({ id: newId, title: files[i].name, url, category, tags, published: true, order: base + i, createdAt: Date.now() })
      }
      setItems((prev) => [...prev, ...created])
      showToast(`${files.length} image${files.length > 1 ? 's' : ''} uploaded.`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.', 'error')
    } finally {
      setUploading(false)
      setProgress(0)
      e.target.value = ''
    }
  }

  async function togglePublish(item: GalleryItem) {
    await galleryCol.update(item.id, { published: !item.published })
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, published: !x.published } : x)))
  }

  async function move(index: number, direction: 'up' | 'down') {
    const next = await swapOrder(items, index, direction, (id, data) => galleryCol.update(id, data))
    setItems(next)
  }

  async function saveEdit() {
    if (!editing) return
    await galleryCol.update(editing.id, { title: editing.title, category: editing.category, tags: editing.tags })
    setItems((prev) => prev.map((x) => (x.id === editing.id ? editing : x)))
    setEditing(null)
    showToast('Saved.')
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await galleryCol.remove(toDelete.id)
      await deleteFileByUrl(toDelete.url)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      showToast('Image deleted.')
    } catch {
      showToast('Could not delete image.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Gallery</h1>
        <p className="text-white/50 mt-2 text-sm">{items.length} images</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 glass rounded-2xl p-5 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Category for next upload</label>
            <input className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Tags (comma separated)</label>
            <input className="input-field" value={tagsDraft} onChange={(e) => setTagsDraft(e.target.value)} placeholder="travel, macro…" />
          </div>
          <label className="btn-primary text-xs px-4 py-2 cursor-pointer">
            {uploading ? `Uploading… ${progress}%` : 'Upload images'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </Reveal>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="text-white/40 text-sm">Loading…</p>}
        {!loading && items.length === 0 && <EmptyState>No images uploaded yet.</EmptyState>}

        {items.map((item, i) => (
          <div key={item.id} className="glass rounded-xl overflow-hidden">
            <img src={item.url} alt={item.title} className="h-40 w-full object-cover" />
            <div className="p-4">
              {editing?.id === item.id ? (
                <div className="space-y-2">
                  <input className="input-field text-xs" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                  <input className="input-field text-xs" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                  <input
                    className="input-field text-xs"
                    value={editing.tags.join(', ')}
                    onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => setEditing(null)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-white/40 mt-1">{item.category}</p>
                  <div className="flex items-center justify-between mt-3">
                    <OrderButtons onUp={() => move(i, 'up')} onDown={() => move(i, 'down')} disableUp={i === 0} disableDown={i === items.length - 1} />
                    <PublishToggle published={item.published} onToggle={() => togglePublish(item)} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditing(item)} className="btn-secondary text-xs px-3 py-1.5 flex-1">Edit</button>
                    <button onClick={() => setToDelete(item)} className="text-xs px-3 py-1.5 text-red-300 hover:text-red-200">Delete</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this image?"
        description="This permanently removes it from the gallery and storage."
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
