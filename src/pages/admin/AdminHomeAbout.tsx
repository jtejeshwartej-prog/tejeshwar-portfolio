import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import FileUploadField from '@/components/admin/FileUploadField'
import { Toast } from '@/components/admin/AdminAtoms'
import { portfolioService, DEFAULT_HOME, DEFAULT_ABOUT } from '@/services/portfolio'
import { useToast } from '@/hooks/useToast'
import type { HomeContent, AboutContent, TimelineEntry } from '@/types'

function newTimelineEntry(): TimelineEntry {
  return { id: crypto.randomUUID(), year: '', title: '', description: '' }
}

export default function AdminHomeAbout() {
  const [home, setHome] = useState<HomeContent>(DEFAULT_HOME)
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT)
  const [loading, setLoading] = useState(true)
  const [savingHome, setSavingHome] = useState(false)
  const [savingAbout, setSavingAbout] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    Promise.all([portfolioService.getHome(), portfolioService.getAbout()])
      .then(([h, a]) => {
        setHome(h)
        setAbout(a)
      })
      .catch(() => showToast('Failed to load content.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveHome() {
    setSavingHome(true)
    try {
      await portfolioService.setHome(home)
      showToast('Home content saved.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSavingHome(false)
    }
  }

  async function saveAbout() {
    setSavingAbout(true)
    try {
      await portfolioService.setAbout(about)
      showToast('About content saved.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSavingAbout(false)
    }
  }

  function updateTimeline(id: string, patch: Partial<TimelineEntry>) {
    setAbout((a) => ({ ...a, timeline: a.timeline.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  }

  function removeTimeline(id: string) {
    setAbout((a) => ({ ...a, timeline: a.timeline.filter((t) => t.id !== id) }))
  }

  if (loading) return <p className="text-white/40 text-sm">Loading…</p>

  return (
    <div className="max-w-2xl space-y-12">
      <div>
        <Reveal>
          <h1 className="font-display text-3xl font-semibold">Home content</h1>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-6 glass rounded-2xl p-6 space-y-5">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Hero name</label>
              <input className="input-field" value={home.heroName} onChange={(e) => setHome({ ...home, heroName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Tagline</label>
              <input className="input-field" value={home.heroTagline} onChange={(e) => setHome({ ...home, heroTagline: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Short intro</label>
              <textarea className="input-field resize-none" rows={4} value={home.heroIntro} onChange={(e) => setHome({ ...home, heroIntro: e.target.value })} />
            </div>
            <FileUploadField label="Profile photo" ruleKey="profile" value={home.profilePhoto} onUploaded={(url) => setHome({ ...home, profilePhoto: url })} accept="image/*" />
            <button onClick={saveHome} disabled={savingHome} className="btn-primary text-sm">
              {savingHome ? 'Saving…' : 'Save home content'}
            </button>
          </div>
        </Reveal>
      </div>

      <div>
        <Reveal>
          <h1 className="font-display text-3xl font-semibold">About content</h1>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-6 glass rounded-2xl p-6 space-y-5">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Introduction</label>
              <textarea className="input-field resize-none" rows={3} value={about.intro} onChange={(e) => setAbout({ ...about, intro: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Education</label>
              <textarea className="input-field resize-none" rows={2} value={about.education} onChange={(e) => setAbout({ ...about, education: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Interests</label>
              <textarea className="input-field resize-none" rows={2} value={about.interests} onChange={(e) => setAbout({ ...about, interests: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Goals</label>
              <textarea className="input-field resize-none" rows={2} value={about.goals} onChange={(e) => setAbout({ ...about, goals: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Technology interests</label>
              <textarea className="input-field resize-none" rows={2} value={about.techInterests} onChange={(e) => setAbout({ ...about, techInterests: e.target.value })} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-white/60 block">Timeline</label>
                <button
                  type="button"
                  onClick={() => setAbout((a) => ({ ...a, timeline: [...a.timeline, newTimelineEntry()] }))}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  + Add entry
                </button>
              </div>
              <div className="space-y-3">
                {about.timeline.map((t) => (
                  <div key={t.id} className="rounded-xl border border-white/10 p-4 space-y-2">
                    <div className="flex gap-2">
                      <input
                        className="input-field w-28"
                        placeholder="Year"
                        value={t.year}
                        onChange={(e) => updateTimeline(t.id, { year: e.target.value })}
                      />
                      <input
                        className="input-field"
                        placeholder="Title"
                        value={t.title}
                        onChange={(e) => updateTimeline(t.id, { title: e.target.value })}
                      />
                    </div>
                    <textarea
                      className="input-field resize-none"
                      rows={2}
                      placeholder="Description"
                      value={t.description}
                      onChange={(e) => updateTimeline(t.id, { description: e.target.value })}
                    />
                    <button type="button" onClick={() => removeTimeline(t.id)} className="text-xs text-red-300 hover:text-red-200">
                      Remove entry
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveAbout} disabled={savingAbout} className="btn-primary text-sm">
              {savingAbout ? 'Saving…' : 'Save about content'}
            </button>
          </div>
        </Reveal>
      </div>

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
