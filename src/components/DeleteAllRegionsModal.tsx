import { Button } from './Button'
import { BaseModal } from './BaseModal'

interface DeleteAllRegionsModalProps {
  isOpen: boolean
  regionCount: number
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteAllRegionsModal({ 
  isOpen, 
  regionCount,
  onConfirm, 
  onCancel
}: DeleteAllRegionsModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      title="Delete All Regions"
      size="md"
    >
      <div className="mb-6">
        <p className="text-gray-300">
          Are you sure you want to delete all <strong className="text-white">{regionCount}</strong> {regionCount === 1 ? 'region' : 'regions'}?
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
          Delete All Regions
        </Button>
      </div>
    </BaseModal>
  )
}

