import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import FileUploadField from '@/components/admin/FileUploadField'
import { EmptyState, OrderButtons, PublishToggle, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { achievementsCol } from '@/services/collections'
import { swapOrder, nextOrderValue } from '@/lib/reorder'
import { useToast } from '@/hooks/useToast'
import type { Achievement } from '@/types'

const BLANK: Omit<Achievement, 'id' | 'createdAt' | 'order'> = {
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  image: '',
  fileUrl: '',
  published: true,
}

export default function AdminAchievements() {
  const [items, setItems] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Achievement | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    achievementsCol
      .list()
      .then((d) => setItems(d.sort((a, b) => a.order - b.order)))
      .catch(() => showToast('Failed to load achievements.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(item: Achievement) {
    setEditingId(item.id)
    const { id: _id, createdAt: _c, order: _o, ...rest } = item
    setForm(rest)
  }

  function resetForm() {
    setEditingId(null)
    setForm(BLANK)
  }

  async function handleSave() {
    if (!form.title.trim()) {
      showToast('Title is required.', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await achievementsCol.update(editingId, form)
        setItems((prev) => prev.map((x) => (x.id === editingId ? { ...x, ...form } : x)))
        showToast('Achievement updated.')
      } else {
        const order = nextOrderValue(items)
        const newId = await achievementsCol.create({ ...form, order, createdAt: Date.now() })
        setItems((prev) => [...prev, { id: newId, ...form, order, createdAt: Date.now() }])
        showToast('Achievement added.')
      }
      resetForm()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item: Achievement) {
    await achievementsCol.update(item.id, { published: !item.published })
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, published: !x.published } : x)))
  }

  async function move(index: number, direction: 'up' | 'down') {
    const next = await swapOrder(items, index, direction, (id, data) => achievementsCol.update(id, data))
    setItems(next)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await achievementsCol.remove(toDelete.id)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      showToast('Achievement deleted.')
    } catch {
      showToast('Could not delete achievement.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Achievements</h1>
        <p className="text-white/50 mt-2 text-sm">{items.length} total — certificates, awards, competitions, milestones</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 glass rounded-2xl p-6 space-y-4 max-w-xl">
          <h2 className="font-medium text-sm">{editingId ? 'Edit achievement' : 'Add achievement'}</h2>
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Date</label>
            <input type="date" className="input-field" value={form.date.slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <FileUploadField label="Image (optional)" ruleKey="achievement" value={form.image} onUploaded={(url) => setForm({ ...form, image: url })} accept="image/*" />
          <FileUploadField
            label="Certificate / document (optional)"
            ruleKey="achievement"
            value={form.fileUrl}
            onUploaded={(url) => setForm({ ...form, fileUrl: url })}
            accept="image/*,.pdf"
          />
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add achievement'}</button>
            {editingId && <button onClick={resetForm} className="btn-secondary text-sm">Cancel</button>}
          </div>
        </div>
      </Reveal>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-white/40 text-sm">Loading…</p>}
        {!loading && items.length === 0 && <EmptyState>No achievements yet.</EmptyState>}

        {items.map((item, i) => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <OrderButtons onUp={() => move(i, 'up')} onDown={() => move(i, 'down')} disableUp={i === 0} disableDown={i === items.length - 1} />
            {item.image && <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-xs text-white/40">{item.date}</p>
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
