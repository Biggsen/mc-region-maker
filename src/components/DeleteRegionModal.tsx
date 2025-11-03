import { Button } from './Button'
import { BaseModal } from './BaseModal'

interface DeleteRegionModalProps {
  isOpen: boolean
  regionName: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteRegionModal({ 
  isOpen, 
  regionName,
  onConfirm, 
  onCancel
}: DeleteRegionModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      title="Delete Region"
      size="md"
    >
      <div className="mb-6">
        <p className="text-gray-300">
          Are you sure you want to delete <strong className="text-white">"{regionName}"</strong>?
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
          Delete Region
        </Button>
      </div>
    </BaseModal>
  )
}

