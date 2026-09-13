import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import MagneticButton from '@/components/ui/MagneticButton'
import { portfolioService } from '@/services/portfolio'

export default function Resume() {
  const [resumeUrl, setResumeUrl] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portfolioService
      .getSettings()
      .then((s) => setResumeUrl(s.resumeUrl))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Resume</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">My resume</h1>
          {resumeUrl && (
            <MagneticButton as="a" href={resumeUrl} target="_blank" rel="noreferrer" className="btn-primary">
              Download Resume
            </MagneticButton>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 glass rounded-2xl overflow-hidden" style={{ minHeight: '75vh' }}>
          {loading ? (
            <div className="h-[75vh] flex items-center justify-center text-white/40">Loading…</div>
          ) : resumeUrl ? (
            <iframe src={resumeUrl} title="Resume PDF" className="w-full" style={{ height: '80vh' }} />
          ) : (
            <div className="h-[75vh] flex flex-col items-center justify-center text-white/40 gap-2 px-6 text-center">
              <p>No resume has been uploaded yet.</p>
              <p className="text-sm">Check back soon, or reach out via the contact page.</p>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  )
}
