import { useEffect, useRef, useState, type FormEvent } from 'react'
import Reveal from '@/components/ui/Reveal'
import MagneticButton from '@/components/ui/MagneticButton'
import { messagesCol } from '@/services/collections'
import { portfolioService, DEFAULT_SETTINGS } from '@/services/portfolio'
import type { SiteSettings } from '@/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '', company: '' }) // `company` is the honeypot
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const mountedAt = useRef(Date.now())

  useEffect(() => {
    portfolioService.getSettings().then(setSettings).catch(() => {})
  }, [])

  function validate() {
    const e: Record<string, string> = {}
    if (!values.name.trim()) e.name = 'Please enter your name.'
    if (!EMAIL_RE.test(values.email)) e.email = 'Please enter a valid email address.'
    if (!values.message.trim() || values.message.trim().length < 10) e.message = 'Message should be at least 10 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    setErrorMsg('')

    // Honeypot: bots fill every field, humans never see this one.
    if (values.company.trim() !== '') {
      setStatus('sent') // pretend success, drop silently
      return
    }
    // Basic time-trap: a real visitor takes at least a couple seconds to fill this in.
    if (Date.now() - mountedAt.current < 1800) {
      setErrorMsg('Please take a moment before submitting.')
      return
    }
    if (!validate()) return

    setStatus('sending')
    try {
      await messagesCol.create({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        createdAt: Date.now(),
        read: false,
      })
      setStatus('sent')
      setValues({ name: '', email: '', subject: '', message: '', company: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong sending your message.')
    }
  }

  return (
    <div className="section-container pb-32">
      <Reveal>
        <p className="badge mb-4">Contact</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold max-w-2xl">Let's build something together.</h1>
      </Reveal>

      <div className="mt-14 grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <Reveal delay={0.05}>
          <div className="space-y-6">
            <p className="text-white/60 leading-relaxed max-w-sm">
              Have a project, opportunity, or question? Send a message and I'll get back to you.
            </p>
            {settings.socialLinks.email && (
              <a href={`mailto:${settings.socialLinks.email}`} className="block text-neon-cyan hover:underline">
                {settings.socialLinks.email}
              </a>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              {settings.socialLinks.github && (
                <a href={settings.socialLinks.github} target="_blank" rel="noreferrer" className="badge hover:text-white hover:border-white/30">
                  GitHub
                </a>
              )}
              {settings.socialLinks.linkedin && (
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noreferrer" className="badge hover:text-white hover:border-white/30">
                  LinkedIn
                </a>
              )}
              {settings.socialLinks.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="badge hover:text-white hover:border-white/30">
                  Twitter / X
                </a>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-5" noValidate>
            {/* Honeypot field: hidden from sighted/keyboard users, bots fill it anyway */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.company}
                onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="name" className="text-sm text-white/60 mb-1.5 block">Name</label>
              <input
                id="name"
                type="text"
                className="input-field"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <p id="name-error" className="text-xs text-red-400 mt-1.5">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="text-sm text-white/60 mb-1.5 block">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="subject" className="text-sm text-white/60 mb-1.5 block">Subject</label>
              <input
                id="subject"
                type="text"
                className="input-field"
                value={values.subject}
                onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="message" className="text-sm text-white/60 mb-1.5 block">Message</label>
              <textarea
                id="message"
                rows={5}
                className="input-field resize-none"
                value={values.message}
                onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message && <p id="message-error" className="text-xs text-red-400 mt-1.5">{errors.message}</p>}
            </div>

            {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
            {status === 'sent' && <p className="text-sm text-emerald-400">Message sent — thanks for reaching out!</p>}

            <MagneticButton as="button" type="submit" className="btn-primary w-full sm:w-auto" onClick={undefined}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </MagneticButton>
          </form>
        </Reveal>
      </div>
    </div>
  )
}
