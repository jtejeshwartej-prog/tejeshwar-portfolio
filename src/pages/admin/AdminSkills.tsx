import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { EmptyState, OrderButtons, PublishToggle, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { skillsCol } from '@/services/collections'
import { swapOrder, nextOrderValue } from '@/lib/reorder'
import { useToast } from '@/hooks/useToast'
import type { Skill, SkillCategory } from '@/types'

const CATEGORIES: SkillCategory[] = [
  'Programming',
  'Web Development',
  'Python',
  'C/C++',
  'JavaScript',
  'React',
  'Backend',
  'Database',
  'Cybersecurity',
  'Electronics',
  '3D',
  'Tools',
]

const BLANK: Omit<Skill, 'id' | 'order'> = {
  name: '',
  category: 'Programming',
  level: 70,
  icon: '',
  published: true,
}

export default function AdminSkills() {
  const [items, setItems] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Skill | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    skillsCol
      .list()
      .then((d) => setItems(d.sort((a, b) => a.order - b.order)))
      .catch(() => showToast('Failed to load skills.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(item: Skill) {
    setEditingId(item.id)
    const { id: _id, order: _o, ...rest } = item
    setForm(rest)
  }

  function resetForm() {
    setEditingId(null)
    setForm(BLANK)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast('Skill name is required.', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await skillsCol.update(editingId, form)
        setItems((prev) => prev.map((x) => (x.id === editingId ? { ...x, ...form } : x)))
        showToast('Skill updated.')
      } else {
        const order = nextOrderValue(items)
        const newId = await skillsCol.create({ ...form, order })
        setItems((prev) => [...prev, { id: newId, ...form, order }])
        showToast('Skill added.')
      }
      resetForm()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item: Skill) {
    await skillsCol.update(item.id, { published: !item.published })
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, published: !x.published } : x)))
  }

  async function move(index: number, direction: 'up' | 'down') {
    const next = await swapOrder(items, index, direction, (id, data) => skillsCol.update(id, data))
    setItems(next)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await skillsCol.remove(toDelete.id)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      showToast('Skill deleted.')
    } catch {
      showToast('Could not delete skill.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Skills</h1>
        <p className="text-white/50 mt-2 text-sm">{items.length} total</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 glass rounded-2xl p-6 space-y-4 max-w-xl">
          <h2 className="font-medium text-sm">{editingId ? 'Edit skill' : 'Add skill'}</h2>
          <input className="input-field" placeholder="Skill name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SkillCategory })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Level: {form.level}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.level}
              onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
              className="w-full accent-[#8B5CF6]"
            />
          </div>
          <input
            className="input-field"
            placeholder="Icon URL or emoji (optional)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add skill'}</button>
            {editingId && <button onClick={resetForm} className="btn-secondary text-sm">Cancel</button>}
          </div>
        </div>
      </Reveal>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-white/40 text-sm">Loading…</p>}
        {!loading && items.length === 0 && <EmptyState>No skills yet.</EmptyState>}

        {items.map((item, i) => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <OrderButtons onUp={() => move(i, 'up')} onDown={() => move(i, 'down')} disableUp={i === 0} disableDown={i === items.length - 1} />
            {item.icon && <span className="text-lg w-6 text-center">{item.icon}</span>}
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-xs text-white/40">{item.category} · {item.level}%</p>
            </div>
            <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden hidden sm:block">
              <div className="h-full bg-gradient-to-r from-neon-blue to-neon-violet" style={{ width: `${item.level}%` }} />
            </div>
            <PublishToggle published={item.published} onToggle={() => togglePublish(item)} />
            <button onClick={() => startEdit(item)} className="btn-secondary text-xs px-3 py-1.5">Edit</button>
            <button onClick={() => setToDelete(item)} className="text-xs px-3 py-1.5 text-red-300 hover:text-red-200">Delete</button>
          </div>
        ))}
      </div>

      <ConfirmDialog open={!!toDelete} title={`Delete "${toDelete?.name}"?`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
