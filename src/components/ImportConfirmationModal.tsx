import { Button } from './Button'
import { BaseModal } from './BaseModal'

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
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="md"
    >
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
    </BaseModal>
  )
}
