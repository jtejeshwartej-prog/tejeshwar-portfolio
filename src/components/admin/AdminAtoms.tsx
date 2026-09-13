import type { ReactNode } from 'react'

export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs text-white/40">{label}</p>
      <p className="font-display text-3xl font-semibold mt-2">{value}</p>
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="glass rounded-2xl p-10 text-center text-white/40 text-sm">{children}</div>
}

export function OrderButtons({ onUp, onDown, disableUp, disableDown }: { onUp: () => void; onDown: () => void; disableUp?: boolean; disableDown?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={onUp}
        disabled={disableUp}
        className="h-5 w-5 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 disabled:hover:text-white/40 text-xs"
        aria-label="Move up"
      >
        ▲
      </button>
      <button
        onClick={onDown}
        disabled={disableDown}
        className="h-5 w-5 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 disabled:hover:text-white/40 text-xs"
        aria-label="Move down"
      >
        ▼
      </button>
    </div>
  )
}

export function PublishToggle({ published, onToggle }: { published: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        published ? 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10' : 'border-white/15 text-white/40'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </button>
  )
}

export function Toast({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[120] px-4 py-3 rounded-xl text-sm glass border ${
        tone === 'success' ? 'border-emerald-400/30 text-emerald-300' : 'border-red-400/30 text-red-300'
      }`}
      role="status"
    >
      {message}
    </div>
  )
}
