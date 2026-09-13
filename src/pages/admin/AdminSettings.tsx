import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { Toast } from '@/components/admin/AdminAtoms'
import { portfolioService, DEFAULT_SETTINGS } from '@/services/portfolio'
import { useToast } from '@/hooks/useToast'
import type { SiteSettings } from '@/types'

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    portfolioService
      .getSettings()
      .then(setSettings)
      .catch(() => showToast('Failed to load settings.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    setSaving(true)
    try {
      await portfolioService.setSettings(settings)
      showToast('Settings saved.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-white/40 text-sm">Loading…</p>

  return (
    <div className="max-w-2xl">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="text-white/50 mt-2 text-sm">Social links and site-wide configuration.</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 glass rounded-2xl p-6 space-y-5">
          <h2 className="font-medium text-sm">Contact & social links</h2>
          {(['email', 'github', 'linkedin', 'twitter', 'instagram', 'youtube'] as const).map((key) => (
            <div key={key}>
              <label className="text-sm text-white/60 mb-1.5 block capitalize">{key}</label>
              <input
                className="input-field"
                type={key === 'email' ? 'email' : 'url'}
                value={settings.socialLinks[key] || ''}
                onChange={(e) => setSettings((s) => ({ ...s, socialLinks: { ...s.socialLinks, [key]: e.target.value } }))}
                placeholder={key === 'email' ? 'you@example.com' : `https://${key}.com/yourhandle`}
              />
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-6 glass rounded-2xl p-6 space-y-4">
          <h2 className="font-medium text-sm">Site status</h2>
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings((s) => ({ ...s, maintenanceMode: e.target.checked }))}
            />
            Maintenance mode (flag other tooling / future banner off; does not hide pages by itself)
          </label>
          <p className="text-xs text-white/30">
            Resume file is managed from the <a href="/admin/resume" className="text-neon-cyan hover:underline">Resume</a> page. Home & About copy is managed from{' '}
            <a href="/admin/content" className="text-neon-cyan hover:underline">Home & About</a>.
          </p>
        </div>
      </Reveal>

      <div className="mt-6">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
