import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '@/components/ui/Reveal'
import { StatCard } from '@/components/admin/AdminAtoms'
import {
  projectsCol,
  videosCol,
  documentsCol,
  presentationsCol,
  models3dCol,
  animationsCol,
  galleryCol,
  skillsCol,
  achievementsCol,
  messagesCol,
} from '@/services/collections'

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [projects, videos, documents, presentations, models, animations, gallery, skills, achievements, messages] = await Promise.all([
        projectsCol.list(),
        videosCol.list(),
        documentsCol.list(),
        presentationsCol.list(),
        models3dCol.list(),
        animationsCol.list(),
        galleryCol.list(),
        skillsCol.list(),
        achievementsCol.list(),
        messagesCol.list(),
      ])
      setCounts({
        projects: projects.length,
        videos: videos.length,
        documents: documents.length,
        presentations: presentations.length,
        models: models.length,
        animations: animations.length,
        gallery: gallery.length,
        skills: skills.length,
        achievements: achievements.length,
        messages: messages.length,
      })
      setUnread(messages.filter((m) => !m.read).length)
      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-white/50 mt-2 text-sm">Content overview across the whole site.</p>
      </Reveal>

      {loading ? (
        <p className="text-white/40 mt-10 text-sm">Loading statistics…</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Projects" value={counts.projects ?? 0} />
          <StatCard label="Gallery images" value={counts.gallery ?? 0} />
          <StatCard label="Videos" value={counts.videos ?? 0} />
          <StatCard label="Documents" value={counts.documents ?? 0} />
          <StatCard label="Presentations" value={counts.presentations ?? 0} />
          <StatCard label="3D models" value={counts.models ?? 0} />
          <StatCard label="Animations" value={counts.animations ?? 0} />
          <StatCard label="Skills" value={counts.skills ?? 0} />
          <StatCard label="Achievements" value={counts.achievements ?? 0} />
          <Link to="/admin/messages">
            <div className="glass rounded-2xl p-5 hover:bg-white/[0.07] transition-colors h-full">
              <p className="text-xs text-white/40">Messages</p>
              <p className="font-display text-3xl font-semibold mt-2">{counts.messages ?? 0}</p>
              {unread > 0 && <p className="text-xs text-neon-cyan mt-1">{unread} unread</p>}
            </div>
          </Link>
        </div>
      )}

      <Reveal delay={0.1}>
        <div className="mt-10 glass rounded-2xl p-6">
          <h2 className="font-medium mb-4">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/projects/new" className="btn-primary text-xs px-4 py-2">+ New project</Link>
            <Link to="/admin/gallery" className="btn-secondary text-xs px-4 py-2">Upload to gallery</Link>
            <Link to="/admin/content" className="btn-secondary text-xs px-4 py-2">Edit home & about</Link>
            <Link to="/admin/resume" className="btn-secondary text-xs px-4 py-2">Replace resume</Link>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
