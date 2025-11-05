import { X } from 'lucide-react'
import { Toast } from '../hooks/useToast'

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map(toast => {
        const bgColor = toast.type === 'error' 
          ? 'bg-red-600' 
          : toast.type === 'success'
          ? 'bg-green-600'
          : toast.type === 'warning'
          ? 'bg-yellow-600'
          : 'bg-blue-600'
        
        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-start justify-between gap-3 animate-in slide-in-from-right`}
          >
            <p className="flex-1 text-sm">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
              aria-label="Dismiss notification"
            >
              <X size={18} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

