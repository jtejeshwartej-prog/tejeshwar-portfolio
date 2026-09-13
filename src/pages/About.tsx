import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { portfolioService, DEFAULT_ABOUT } from '@/services/portfolio'
import type { AboutContent } from '@/types'

export default function About() {
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT)

  useEffect(() => {
    portfolioService.getAbout().then(setAbout).catch(() => {})
  }, [])

  const blocks = [
    { label: 'Education', value: about.education },
    { label: 'Interests', value: about.interests },
    { label: 'Goals', value: about.goals },
    { label: 'Technology interests', value: about.techInterests },
  ].filter((b) => !!b.value)

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">About</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold max-w-3xl">A bit more about who I am and what I'm working toward.</h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 text-white/60 leading-relaxed max-w-2xl text-lg">{about.intro}</p>
      </Reveal>

      {blocks.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-6 mt-16">
          {blocks.map((b, i) => (
            <Reveal key={b.label} delay={i * 0.08}>
              <div className="glass rounded-2xl p-6">
                <p className="badge mb-3">{b.label}</p>
                <p className="text-white/70 leading-relaxed whitespace-pre-line">{b.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {about.timeline.length > 0 && (
        <div className="mt-24">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold mb-12">Timeline</h2>
          </Reveal>
          <ol className="relative border-l border-white/10 ml-2">
            {about.timeline.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.08} className="relative mb-10 pl-8">
                <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-r from-neon-blue to-neon-violet shadow-glow" />
                <p className="text-sm text-neon-cyan font-mono">{t.year}</p>
                <h3 className="font-medium text-lg mt-1">{t.title}</h3>
                <p className="text-white/50 mt-1 leading-relaxed">{t.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
