import { Button } from './Button'
import { BaseModal } from './BaseModal'

interface ClearDataModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ClearDataModal({ 
  isOpen, 
  onConfirm, 
  onCancel
}: ClearDataModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      title="Clear All Data"
      size="md"
    >
      <div className="mb-6">
        <p className="text-gray-300">
          Are you sure you want to clear all saved data? This will remove the loaded image and all regions.
        </p>
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
          Clear All Data
        </Button>
      </div>
    </BaseModal>
  )
}

