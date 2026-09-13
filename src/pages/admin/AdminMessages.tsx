import { useEffect, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { EmptyState, Toast } from '@/components/admin/AdminAtoms'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { messagesCol } from '@/services/collections'
import { useToast } from '@/hooks/useToast'
import type { ContactMessage } from '@/types'

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<ContactMessage | null>(null)
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null)
  const { toast, showToast } = useToast()

  useEffect(() => {
    messagesCol
      .list()
      .then((d) => setMessages(d.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => showToast('Failed to load messages.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function openMessage(m: ContactMessage) {
    setActive(m)
    if (!m.read) {
      await messagesCol.update(m.id, { read: true })
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)))
    }
  }

  async function markUnread(m: ContactMessage) {
    await messagesCol.update(m.id, { read: false })
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: false } : x)))
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await messagesCol.remove(toDelete.id)
      setMessages((prev) => prev.filter((x) => x.id !== toDelete.id))
      if (active?.id === toDelete.id) setActive(null)
      showToast('Message deleted.')
    } catch {
      showToast('Could not delete message.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-3xl font-semibold">Messages</h1>
        <p className="text-white/50 mt-2 text-sm">
          {messages.length} total{unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
        </p>
      </Reveal>

      <div className="mt-8 grid lg:grid-cols-[1fr_1.3fr] gap-6">
        <div className="space-y-2">
          {loading && <p className="text-white/40 text-sm">Loading…</p>}
          {!loading && messages.length === 0 && <EmptyState>No messages yet.</EmptyState>}
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => openMessage(m)}
              className={`w-full text-left glass rounded-xl p-4 transition-colors ${
                active?.id === m.id ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={`font-medium truncate ${!m.read ? 'text-white' : 'text-white/60'}`}>{m.name}</p>
                {!m.read && <span className="h-2 w-2 rounded-full bg-neon-cyan shrink-0" />}
              </div>
              <p className="text-xs text-white/40 truncate mt-1">{m.subject || m.message}</p>
              <p className="text-[11px] text-white/25 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-6">
          {active ? (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium text-lg">{active.subject || '(no subject)'}</h2>
                  <p className="text-sm text-white/50 mt-1">
                    From {active.name} — <a href={`mailto:${active.email}`} className="text-neon-cyan hover:underline">{active.email}</a>
                  </p>
                  <p className="text-xs text-white/30 mt-1">{new Date(active.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-6 text-white/70 leading-relaxed whitespace-pre-line">{active.message}</p>
              <div className="flex gap-3 mt-8">
                <a href={`mailto:${active.email}?subject=${encodeURIComponent('Re: ' + (active.subject || 'your message'))}`} className="btn-primary text-xs px-4 py-2">
                  Reply by email
                </a>
                <button onClick={() => markUnread(active)} className="btn-secondary text-xs px-4 py-2">Mark unread</button>
                <button onClick={() => setToDelete(active)} className="text-xs px-4 py-2 text-red-300 hover:text-red-200">Delete</button>
              </div>
            </div>
          ) : (
            <p className="text-white/40 text-sm">Select a message to read it.</p>
          )}
        </div>
      </div>

      <ConfirmDialog open={!!toDelete} title="Delete this message?" onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  )
}
