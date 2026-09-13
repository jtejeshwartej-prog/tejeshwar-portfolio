import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthContext } from '@/hooks/AuthContext'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/videos', label: 'Videos' },
  { to: '/3d', label: '3D' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isAdmin } = useAuthContext()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 glass shadow-[0_1px_0_rgba(255,255,255,0.06)]' : 'py-5 bg-transparent'
      }`}
    >
      <nav className="section-container flex items-center justify-between" aria-label="Primary">
        <NavLink to="/" className="font-display text-lg font-semibold tracking-wide text-white">
          TEJESHWAR
        </NavLink>

        <ul className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm rounded-full transition-colors ${
                    isActive ? 'text-white' : 'text-white/55 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-white/[0.06] border border-white/10"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
          {isAdmin && (
            <li>
              <NavLink to="/admin" className="ml-2 px-3 py-2 text-sm rounded-full badge text-neon-cyan border-neon-cyan/30">
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        <button
          className="lg:hidden relative h-9 w-9 flex items-center justify-center rounded-lg glass"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-3.5 w-4">
            <span
              className={`absolute left-0 top-0 h-[1.5px] w-full bg-white transition-transform duration-300 ${
                open ? 'translate-y-[6px] rotate-45' : ''
              }`}
            />
            <span className={`absolute left-0 top-1.5 h-[1.5px] w-full bg-white transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
            <span
              className={`absolute left-0 bottom-0 h-[1.5px] w-full bg-white transition-transform duration-300 ${
                open ? '-translate-y-[6px] -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden glass border-t border-white/10 mt-4"
          >
            <ul className="section-container py-4 flex flex-col gap-1">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-3 rounded-xl text-base ${isActive ? 'text-white bg-white/[0.06]' : 'text-white/60'}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <NavLink to="/admin" onClick={() => setOpen(false)} className="block px-3 py-3 rounded-xl text-base text-neon-cyan">
                    Admin Dashboard
                  </NavLink>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
