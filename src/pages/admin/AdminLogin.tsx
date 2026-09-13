import Reveal from '@/components/ui/Reveal'
import MagneticButton from '@/components/ui/MagneticButton'
import { useAuthContext } from '@/hooks/AuthContext'
import { ADMIN_EMAIL, isFirebaseConfigured } from '@/lib/firebase'

export default function AdminLogin() {
  const { user, isAdmin, signInWithGoogle, logout, error } = useAuthContext()

  return (
    <div className="min-h-screen flex items-center justify-center section-container pt-28">
      <Reveal>
        <div className="glass rounded-2xl p-8 max-w-sm w-full text-center">
          <p className="badge mb-4 mx-auto w-fit">Admin</p>
          <h1 className="font-display text-2xl font-semibold">Restricted area</h1>
          <p className="text-white/50 text-sm mt-3">
            Only the site owner's Google account can access this dashboard.
          </p>

          {!isFirebaseConfigured && (
            <p className="text-xs text-amber-300 mt-4 bg-amber-500/10 border border-amber-400/20 rounded-lg p-3">
              Firebase isn't configured yet — sign-in is disabled until <code className="font-mono">.env</code> is filled in.
            </p>
          )}

          {user && !isAdmin && (
            <p className="text-xs text-red-300 mt-4 bg-red-500/10 border border-red-400/20 rounded-lg p-3">
              Signed in as {user.email}, which isn't the authorized admin account ({ADMIN_EMAIL}).
            </p>
          )}

          {error && <p className="text-xs text-red-300 mt-4">{error}</p>}

          <div className="mt-6 flex flex-col gap-3">
            {user ? (
              <MagneticButton as="button" onClick={logout} className="btn-secondary w-full">
                Sign out
              </MagneticButton>
            ) : (
              <MagneticButton as="button" onClick={signInWithGoogle} className="btn-primary w-full" >
                Sign in with Google
              </MagneticButton>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
