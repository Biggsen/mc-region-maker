import { X } from 'lucide-react'
import { Button } from './Button'

interface ImportConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message?: string
  warningMessage?: string
  confirmLabel?: string
}

export function ImportConfirmationModal({ 
  isOpen, 
  onConfirm, 
  onCancel,
  title = 'Import New Map',
  message = 'Importing this map will clear all current data and start fresh.',
  warningMessage = '⚠️ All existing regions will be lost.',
  confirmLabel = 'Import Map'
}: ImportConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-eerie-back border border-gunmetal rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-3">
            {message}
          </p>
          <div className="bg-yellow-900 border border-yellow-600 rounded p-3">
            <p className="text-yellow-200 text-sm">
              {warningMessage}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
