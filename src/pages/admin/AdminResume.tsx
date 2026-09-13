import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import FileUploadField from '@/components/admin/FileUploadField'
import { Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { portfolioService } from '@/services/portfolio'
import { deleteFileByUrl } from '@/services/storage'
import { useToast } from '@/hooks/useToast'

export default function AdminResume() {
  const [resumeUrl, setResumeUrl] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    portfolioService
      .getSettings()
      .then((s) => setResumeUrl(s.resumeUrl))
      .catch(() => showToast('Failed to load resume settings.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUploaded(url: string) {
    try {
      await portfolioService.setSettings({ resumeUrl: url })
      setResumeUrl(url)
      showToast('Resume updated — it is now live on the public Resume page.')
    } catch {
      showToast('Uploaded, but could not save the reference. Try again.', 'error')
    }
  }

  async function handleRemove() {
    try {
      if (resumeUrl) await deleteFileByUrl(resumeUrl)
      await portfolioService.setSettings({ resumeUrl: '' })
      setResumeUrl(undefined)
      showToast('Resume removed.')
    } catch {
      showToast('Could not remove resume.', 'error')
    } finally {
      setConfirmRemove(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Resume</h1>
        <p className="text-white/50 mt-2 text-sm">Uploading a new file replaces the one visitors currently see.</p>
      </Reveal>

      {loading ? (
        <p className="text-white/40 mt-8 text-sm">Loading…</p>
      ) : (
        <Reveal delay={0.05}>
          <div className="mt-8 glass rounded-2xl p-6 space-y-5">
            <FileUploadField label="Resume PDF" ruleKey="resume" value={resumeUrl} onUploaded={handleUploaded} accept="application/pdf" hint="PDF only, up to 15MB." />
            {resumeUrl && (
              <>
                <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: '60vh' }}>
                  <iframe src={resumeUrl} title="Resume preview" className="w-full h-full" />
                </div>
                <button onClick={() => setConfirmRemove(true)} className="text-xs text-red-300 hover:text-red-200">
                  Remove current resume
                </button>
              </>
            )}
          </div>
        </Reveal>
      )}

      <ConfirmDialog
        open={confirmRemove}
        title="Remove current resume?"
        description="Visitors won't see a downloadable resume until you upload a new one."
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove(false)}
      />
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
