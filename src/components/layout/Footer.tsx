import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { portfolioService } from '@/services/portfolio'
import type { SocialLinks } from '@/types'

export default function Footer() {
  const [links, setLinks] = useState<SocialLinks>({})

  useEffect(() => {
    portfolioService.getSettings().then((s) => setLinks(s.socialLinks)).catch(() => {})
  }, [])

  const socials = [
    { key: 'github', label: 'GitHub', href: links.github },
    { key: 'linkedin', label: 'LinkedIn', href: links.linkedin },
    { key: 'twitter', label: 'Twitter / X', href: links.twitter },
    { key: 'instagram', label: 'Instagram', href: links.instagram },
    { key: 'youtube', label: 'YouTube', href: links.youtube },
  ].filter((s) => !!s.href)

  return (
    <footer className="relative border-t border-white/10 mt-32">
      <div className="section-container py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-display text-xl heading-gradient font-semibold">TEJESHWAR</p>
          <p className="text-white/40 text-sm mt-2 max-w-sm">Building. Creating. Exploring.</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
          <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
          <Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link>
          <Link to="/achievements" className="hover:text-white transition-colors">Achievements</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>

        {socials.length > 0 && (
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="badge hover:text-white hover:border-white/30 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="section-container pb-8 text-xs text-white/30">
        © {new Date().getFullYear()} Tejeshwar. All rights reserved.
      </div>
    </footer>
  )
}
