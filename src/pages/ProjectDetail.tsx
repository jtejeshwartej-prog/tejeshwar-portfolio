import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Reveal from '@/components/ui/Reveal'
import MagneticButton from '@/components/ui/MagneticButton'
import { projectsCol, models3dCol, presentationsCol } from '@/services/collections'
import type { Project, Model3DItem, PresentationItem } from '@/types'
import ModelViewer from '@/components/three/ModelViewer'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [model, setModel] = useState<Model3DItem | null>(null)
  const [presentation, setPresentation] = useState<PresentationItem | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    if (!id) return
    projectsCol.get(id).then(setProject).catch(() => setProject(null))
  }, [id])

  useEffect(() => {
    if (project?.model3dId) models3dCol.get(project.model3dId).then(setModel).catch(() => {})
    if (project?.presentationId) presentationsCol.get(project.presentationId).then(setPresentation).catch(() => {})
  }, [project])

  if (project === undefined) {
    return (
      <div className="section-container pb-32 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-neon-violet animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="section-container pb-32 text-center py-32">
        <p className="text-white/50">This project couldn't be found.</p>
        <Link to="/projects" className="text-neon-cyan mt-4 inline-block">← Back to projects</Link>
      </div>
    )
  }

  const gallery = [project.thumbnail, ...project.images].filter(Boolean)

  return (
    <div className="section-container pb-32">
      <Reveal>
        <Link to="/projects" className="text-sm text-white/40 hover:text-white transition-colors">← Back to projects</Link>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="badge">{project.category}</p>
          <p className="text-xs text-white/30">{new Date(project.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mt-4 max-w-3xl">{project.title}</h1>
        <p className="text-white/60 mt-4 max-w-2xl text-lg leading-relaxed">{project.description}</p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-wrap gap-3">
          {project.links.live && (
            <MagneticButton as="a" href={project.links.live} target="_blank" rel="noreferrer" className="btn-primary">
              Live Demo
            </MagneticButton>
          )}
          {project.links.github && (
            <MagneticButton as="a" href={project.links.github} target="_blank" rel="noreferrer" className="btn-secondary">
              GitHub
            </MagneticButton>
          )}
          {project.links.docs && (
            <MagneticButton as="a" href={project.links.docs} target="_blank" rel="noreferrer" className="btn-secondary">
              Documentation
            </MagneticButton>
          )}
        </div>
      </Reveal>

      {gallery.length > 0 && (
        <Reveal delay={0.15}>
          <div className="mt-14">
            <button
              onClick={() => setLightbox(true)}
              className="w-full aspect-video rounded-2xl overflow-hidden glass block"
              aria-label="Open image in fullscreen"
            >
              <img src={gallery[activeImage]} alt={`${project.title} screenshot`} className="h-full w-full object-cover" />
            </button>
            {gallery.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {gallery.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border transition-colors ${
                      i === activeImage ? 'border-neon-violet' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[95] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
        >
          <img src={gallery[activeImage]} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}

      {project.videos.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-14">
            <h2 className="font-display text-2xl font-semibold mb-6">Videos</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {project.videos.map((v, i) => (
                <div key={i} className="rounded-2xl overflow-hidden glass aspect-video">
                  <video src={v} controls className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {model && (
        <Reveal delay={0.1}>
          <div className="mt-14">
            <h2 className="font-display text-2xl font-semibold mb-6">3D model</h2>
            <div className="rounded-2xl overflow-hidden glass aspect-video">
              <ModelViewer url={model.url} format={model.format} />
            </div>
          </div>
        </Reveal>
      )}

      {presentation && (
        <Reveal delay={0.1}>
          <div className="mt-14">
            <h2 className="font-display text-2xl font-semibold mb-6">Presentation</h2>
            <div className="rounded-2xl overflow-hidden glass" style={{ height: '70vh' }}>
              <iframe src={presentation.url} title={presentation.title} className="w-full h-full" />
            </div>
          </div>
        </Reveal>
      )}

      {project.technologies.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-14">
            <h2 className="font-display text-2xl font-semibold mb-6">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <span key={t} className="badge">{t}</span>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {project.tags.length > 0 && (
        <Reveal delay={0.12}>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span key={t} className="text-xs text-white/30">#{t}</span>
            ))}
          </div>
        </Reveal>
      )}

      {project.longDescription && (
        <Reveal delay={0.1}>
          <div className="mt-14 max-w-3xl">
            <h2 className="font-display text-2xl font-semibold mb-4">About this project</h2>
            <p className="text-white/60 leading-relaxed whitespace-pre-line">{project.longDescription}</p>
          </div>
        </Reveal>
      )}
    </div>
  )
}
