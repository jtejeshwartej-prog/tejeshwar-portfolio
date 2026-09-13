import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Reveal from '@/components/ui/Reveal'
import MagneticButton from '@/components/ui/MagneticButton'
import TiltCard from '@/components/ui/TiltCard'
import HeroOrb from '@/components/three/HeroOrb'
import { portfolioService, DEFAULT_HOME } from '@/services/portfolio'
import { projectsCol, skillsCol, videosCol, achievementsCol } from '@/services/collections'
import type { HomeContent, Project, Skill, VideoItem, Achievement, SiteSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/services/portfolio'

export default function Home() {
  const [home, setHome] = useState<HomeContent>(DEFAULT_HOME)
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    portfolioService.getHome().then(setHome).catch(() => {})
    portfolioService.getSettings().then(setSettings).catch(() => {})
    projectsCol.listPublished().then((p) => setProjects(p.filter((x) => x.featured).slice(0, 3))).catch(() => {})
    skillsCol.listPublished().then((s) => setSkills(s.slice(0, 8))).catch(() => {})
    videosCol.listPublished().then((v) => setVideos(v.slice(0, 3))).catch(() => {})
    achievementsCol.listPublished().then((a) => setAchievements(a.slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="relative section-container min-h-[86vh] flex flex-col lg:flex-row items-center justify-between gap-12 pb-20">
        <div className="flex-1 max-w-2xl">
          {home.profilePhoto && (
            <Reveal>
              <img
                src={home.profilePhoto}
                alt="Tejeshwar"
                className="h-20 w-20 rounded-2xl object-cover border border-white/10 mb-8"
              />
            </Reveal>
          )}
          <Reveal>
            <p className="badge mb-6 text-neon-cyan border-neon-cyan/30">Available for opportunities</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="font-display text-5xl sm:text-7xl font-semibold tracking-tight text-glow">
              {home.heroName || 'TEJESHWAR'}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 text-xl sm:text-2xl heading-gradient font-display font-medium">
              {home.heroTagline || 'Building. Creating. Exploring.'}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-white/60 leading-relaxed max-w-lg">{home.heroIntro}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-4">
              <MagneticButton as="link" to="/projects" className="btn-primary">
                View My Work
              </MagneticButton>
              <MagneticButton as="link" to="/resume" className="btn-secondary">
                Resume
              </MagneticButton>
              <MagneticButton as="link" to="/contact" className="btn-secondary">
                Contact
              </MagneticButton>
            </div>
          </Reveal>
          {(settings.socialLinks.github || settings.socialLinks.linkedin) && (
            <Reveal delay={0.36}>
              <div className="mt-8 flex gap-4 text-sm text-white/50">
                {settings.socialLinks.github && (
                  <a href={settings.socialLinks.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    GitHub ↗
                  </a>
                )}
                {settings.socialLinks.linkedin && (
                  <a href={settings.socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </Reveal>
          )}
        </div>

        <div className="flex-1 w-full max-w-md aspect-square">
          <HeroOrb />
        </div>
      </section>

      <motion.div
        className="section-container flex justify-center pb-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        aria-hidden="true"
      >
        <div className="h-9 w-5 rounded-full border border-white/20 flex justify-center pt-1.5">
          <div className="h-1.5 w-1 rounded-full bg-neon-violet" />
        </div>
      </motion.div>

      {/* FEATURED PROJECTS */}
      {projects.length > 0 && (
        <section className="section-container py-20">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Featured projects</h2>
              <Link to="/projects" className="text-sm text-white/50 hover:text-white transition-colors">
                View all →
              </Link>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Link to={`/projects/${p.id}`}>
                  <TiltCard className="p-5 h-full">
                    <div className="aspect-video rounded-xl overflow-hidden bg-white/5 mb-4">
                      {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" />}
                    </div>
                    <p className="badge mb-3">{p.category}</p>
                    <h3 className="font-display text-lg font-medium">{p.title}</h3>
                    <p className="text-sm text-white/50 mt-2 line-clamp-2">{p.description}</p>
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED SKILLS */}
      {skills.length > 0 && (
        <section className="section-container py-20">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-10">Core skills</h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {skills.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-sm font-medium">{s.name}</p>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-violet"
                      style={{ width: `${s.level}%` }}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED VIDEOS */}
      {videos.length > 0 && (
        <section className="section-container py-20">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Featured videos</h2>
              <Link to="/videos" className="text-sm text-white/50 hover:text-white transition-colors">
                View all →
              </Link>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((v, i) => (
              <Reveal key={v.id} delay={i * 0.08}>
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-black">
                    <video src={v.url} poster={v.thumbnail} controls className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-sm">{v.title}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <section className="section-container py-20">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-10">Achievements</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.08}>
                <div className="glass rounded-2xl p-5">
                  {a.image && <img src={a.image} alt="" className="rounded-lg mb-4 h-32 w-full object-cover" />}
                  <p className="text-xs text-white/40">{a.date}</p>
                  <h3 className="font-medium mt-1">{a.title}</h3>
                  <p className="text-sm text-white/50 mt-2 line-clamp-2">{a.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
