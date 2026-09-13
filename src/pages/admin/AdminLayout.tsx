import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from 'firebase/auth'
import AmbientBackground from '@/components/layout/AmbientBackground'
import { useAuthContext } from '@/hooks/AuthContext'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', end: true }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/content', label: 'Home & About' },
      { to: '/admin/projects', label: 'Projects' },
      { to: '/admin/skills', label: 'Skills' },
      { to: '/admin/achievements', label: 'Achievements' },
    ],
  },
  {
    label: 'Media',
    items: [
      { to: '/admin/gallery', label: 'Gallery' },
      { to: '/admin/videos', label: 'Videos' },
      { to: '/admin/documents', label: 'Documents' },
      { to: '/admin/presentations', label: 'Presentations' },
      { to: '/admin/models', label: '3D Models' },
      { to: '/admin/animations', label: 'Animations' },
      { to: '/admin/resume', label: 'Resume' },
    ],
  },
  {
    label: 'Site',
    items: [
      { to: '/admin/messages', label: 'Messages' },
      { to: '/admin/settings', label: 'Settings' },
    ],
  },
]

export default function AdminLayout() {
  const { user, logout } = useAuthContext()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <AmbientBackground />

      <div className="lg:flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 glass border-r border-white/10 px-5 py-6">
          <SidebarContent user={user} onLogout={logout} />
        </aside>

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-40 glass border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <Link to="/admin" className="font-display font-semibold">Admin</Link>
          <button onClick={() => setMobileOpen((o) => !o)} className="badge" aria-expanded={mobileOpen}>
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden glass border-b border-white/10 overflow-hidden px-5"
            >
              <div className="py-4">
                <SidebarContent user={user} onLogout={logout} onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 min-w-0 px-5 sm:px-8 lg:px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import type { User } from 'firebase/auth'

function SidebarContent({ user, onLogout, onNavigate }: { user: User | null; onLogout: () => void; onNavigate?: () => void }) {
  return (
    <>
      <div className="mb-8">
        <Link to="/" className="text-xs text-white/40 hover:text-white transition-colors">← Back to site</Link>
        <p className="font-display text-lg font-semibold mt-2">Admin Dashboard</p>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2 px-2">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={'end' in item ? item.end : false}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="pt-6 mt-6 border-t border-white/10">
        <p className="text-xs text-white/40 truncate">{user?.email}</p>
        <button onClick={onLogout} className="mt-3 text-xs text-red-300 hover:text-red-200 transition-colors">
          Sign out
        </button>
      </div>
    </>
  )
}
