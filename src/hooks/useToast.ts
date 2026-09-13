import { useCallback, useRef, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const showToast = useCallback((message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ message, tone })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  return { toast, showToast }
}
