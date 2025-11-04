import { useState } from 'react'
import { Button } from './Button'
import { BaseModal } from './BaseModal'

interface ImportConfirmationModalProps {
  isOpen: boolean
  onConfirm: (deleteRegions: boolean) => void
  onCancel: () => void
  title?: string
  message?: string
  showRegionOption?: boolean
  confirmLabel?: string
}

export function ImportConfirmationModal({ 
  isOpen, 
  onConfirm, 
  onCancel,
  title = 'Import New Map',
  message = 'This will replace the current map image. Your regions will be preserved by default.',
  showRegionOption = true,
  confirmLabel = 'Import Map'
}: ImportConfirmationModalProps) {
  const [deleteRegions, setDeleteRegions] = useState(false)

  const handleConfirm = () => {
    onConfirm(deleteRegions)
    setDeleteRegions(false) // Reset for next time
  }

  const handleCancel = () => {
    setDeleteRegions(false) // Reset for next time
    onCancel()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="md"
    >
      <div className="mb-6">
        <p className="text-gray-300 mb-4">
          {message}
        </p>
        {showRegionOption && (
          <label className="flex items-center cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={deleteRegions}
              onChange={(e) => setDeleteRegions(e.target.checked)}
              className="w-4 h-4 text-lapis-light bg-input-bg border-input-border rounded focus:ring-lapis-lighter focus:ring-2"
            />
            <span className="ml-3 text-base text-gray-300">
              Delete all existing regions
            </span>
          </label>
        )}
      </div>
      
      <div className="flex space-x-3">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={handleConfirm}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
      </div>
    </BaseModal>
  )
}
