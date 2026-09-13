import { useEffect, useMemo, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { skillsCol } from '@/services/collections'
import type { Skill } from '@/types'

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([])

  useEffect(() => {
    skillsCol.listPublished().then(setSkills).catch(() => {})
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, Skill[]>()
    for (const s of skills) {
      const arr = map.get(s.category) || []
      arr.push(s)
      map.set(s.category, arr)
    }
    return Array.from(map.entries())
  }, [skills])

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Skills</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">What I work with.</h1>
      </Reveal>

      <div className="mt-14 space-y-14">
        {grouped.map(([category, items], gi) => (
          <div key={category}>
            <Reveal delay={gi * 0.05}>
              <h2 className="font-display text-2xl font-semibold mb-6">{category}</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.04}>
                  <div className="glass rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{s.name}</p>
                      <span className="text-xs text-white/40 font-mono">{s.level}%</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-violet transition-[width] duration-700"
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>

      {skills.length === 0 && <p className="text-white/40 mt-16 text-center">Skills haven't been added yet.</p>}
    </div>
  )
}
