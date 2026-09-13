import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider, ADMIN_EMAIL } from '@/lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  isAdmin: boolean
}

export function useAuth(): AuthState & {
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  error: string | null
} {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const isAdmin = !!user?.email && user.emailVerified && user.email.toLowerCase() === ADMIN_EMAIL

  const signInWithGoogle = async () => {
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const email = result.user.email?.toLowerCase()
      // Client-side UX guard only. The real enforcement is in
      // firestore.rules / storage.rules — a non-admin who somehow
      // keeps a session can still never read/write protected data.
      if (email !== ADMIN_EMAIL) {
        await signOut(auth)
        setError('This Google account is not authorized for admin access.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.')
    }
  }

  const logout = () => signOut(auth)

  return { user, loading, isAdmin, signInWithGoogle, logout, error }
}
