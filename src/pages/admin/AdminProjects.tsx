import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '@/components/ui/Reveal'
import { EmptyState, OrderButtons, PublishToggle, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { projectsCol } from '@/services/collections'
import { swapOrder } from '@/lib/reorder'
import { useToast } from '@/hooks/useToast'
import type { Project } from '@/types'

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState<Project | null>(null)
  const { toast, showToast } = useToast()

  useEffect(() => {
    projectsCol
      .list()
      .then((p) => setProjects(p.sort((a, b) => a.order - b.order)))
      .catch(() => showToast('Failed to load projects.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function togglePublish(p: Project) {
    try {
      await projectsCol.update(p.id, { published: !p.published })
      setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: !x.published } : x)))
    } catch {
      showToast('Could not update project.', 'error')
    }
  }

  async function move(index: number, direction: 'up' | 'down') {
    const next = await swapOrder(projects, index, direction, (id, data) => projectsCol.update(id, data))
    setProjects(next)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await projectsCol.remove(toDelete.id)
      setProjects((prev) => prev.filter((p) => p.id !== toDelete.id))
      showToast('Project deleted.')
    } catch {
      showToast('Could not delete project.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <Reveal>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Projects</h1>
            <p className="text-white/50 mt-2 text-sm">{projects.length} total</p>
          </div>
          <Link to="/admin/projects/new" className="btn-primary text-sm">+ New project</Link>
        </div>
      </Reveal>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-white/40 text-sm">Loading…</p>}

        {!loading && projects.length === 0 && <EmptyState>No projects yet — create your first one.</EmptyState>}

        {projects.map((p, i) => (
          <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <OrderButtons
              onUp={() => move(i, 'up')}
              onDown={() => move(i, 'down')}
              disableUp={i === 0}
              disableDown={i === projects.length - 1}
            />
            <div className="h-14 w-20 rounded-lg overflow-hidden bg-white/5 shrink-0">
              {p.thumbnail && <img src={p.thumbnail} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{p.title}</p>
              <p className="text-xs text-white/40">{p.category}{p.featured ? ' · Featured' : ''}</p>
            </div>
            <PublishToggle published={p.published} onToggle={() => togglePublish(p)} />
            <Link to={`/admin/projects/${p.id}`} className="btn-secondary text-xs px-3 py-1.5">Edit</Link>
            <button onClick={() => setToDelete(p)} className="text-xs px-3 py-1.5 text-red-300 hover:text-red-200">Delete</button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.title}"?`}
        description="This removes the project from the database. Uploaded files stay in storage unless removed manually."
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
