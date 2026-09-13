import { isFirebaseConfigured } from '@/lib/firebase'

export default function ConfigBanner() {
  if (isFirebaseConfigured) return null
  return (
    <div className="fixed bottom-0 inset-x-0 z-[90] bg-amber-500/15 border-t border-amber-400/30 backdrop-blur-md">
      <div className="section-container py-3 text-xs sm:text-sm text-amber-200 flex flex-wrap items-center gap-2">
        <span className="font-medium">Firebase isn't configured yet.</span>
        <span className="text-amber-200/70">
          Content, auth, and uploads are disabled until you fill in <code className="font-mono">.env</code> from{' '}
          <code className="font-mono">.env.example</code>. See README.md.
        </span>
      </div>
    </div>
  )
}
