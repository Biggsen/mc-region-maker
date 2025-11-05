import { useState, useCallback, useRef } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type }])
    
    // Auto-dismiss after 3 seconds (5 seconds for errors)
    const dismissTime = type === 'error' ? 5000 : 3000
    const timeout = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      timeoutRefs.current.delete(id)
    }, dismissTime)
    
    timeoutRefs.current.set(id, timeout)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    const timeout = timeoutRefs.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRefs.current.delete(id)
    }
  }, [])

  return { toasts, showToast, dismissToast }
}

