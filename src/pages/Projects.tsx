import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Reveal from '@/components/ui/Reveal'
import TiltCard from '@/components/ui/TiltCard'
import { projectsCol } from '@/services/collections'
import type { Project, ProjectCategory } from '@/types'

const CATEGORIES: (ProjectCategory | 'All')[] = [
  'All',
  'Programming',
  'Web Development',
  'Cybersecurity',
  'Electronics',
  '3D',
  'Design',
  'Creative',
  'Other',
]

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    projectsCol
      .listPublished()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return projects
      .filter((p) => category === 'All' || p.category === category)
      .filter((p) => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.technologies.some((t) => t.toLowerCase().includes(q))
        )
      })
  }, [projects, category, search])

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Projects</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Things I've built.</h1>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, tech, tags…"
            className="input-field sm:max-w-sm"
            aria-label="Search projects"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  category === c
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'border-white/10 text-white/50 hover:text-white hover:border-white/25'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
            >
              <Link to={`/projects/${p.id}`}>
                <TiltCard className="h-full">
                  <div className="aspect-video bg-white/5 overflow-hidden">
                    {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" />}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="badge">{p.category}</p>
                      <p className="text-xs text-white/30">{new Date(p.date).getFullYear()}</p>
                    </div>
                    <h3 className="font-display text-lg font-medium mt-3">{p.title}</h3>
                    <p className="text-sm text-white/50 mt-2 line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {p.technologies.slice(0, 4).map((t) => (
                        <span key={t} className="text-[11px] px-2 py-1 rounded-md bg-white/5 text-white/50">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filtered.length === 0 && (
        <p className="text-white/40 mt-16 text-center">No projects match your search yet.</p>
      )}
    </div>
  )
}
