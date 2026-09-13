import type { ReactNode } from 'react'
import { useAuthContext } from '@/hooks/AuthContext'
import AdminLogin from '@/pages/admin/AdminLogin'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-neon-violet animate-spin" />
      </div>
    )
  }

  // Not signed in, or signed in as someone other than the admin
  // account: both cases render the same gated sign-in screen. This
  // is a UX convenience only — firestore.rules / storage.rules are
  // what actually stop a non-admin from reading or writing data.
  if (!user || !isAdmin) {
    return <AdminLogin />
  }

  return <>{children}</>
}
