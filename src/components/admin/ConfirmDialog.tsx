interface Props {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-6" role="alertdialog" aria-modal="true">
      <div className="glass rounded-2xl p-6 max-w-sm w-full">
        <h3 className="font-display text-lg font-medium">{title}</h3>
        {description && <p className="text-sm text-white/50 mt-2">{description}</p>}
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary text-xs px-4 py-2 flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            className="text-xs px-4 py-2 flex-1 rounded-full bg-red-500/90 hover:bg-red-500 transition-colors font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
