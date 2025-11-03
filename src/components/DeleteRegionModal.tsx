import { X } from 'lucide-react'
import { Button } from './Button'

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
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={onCancel}
    >
      <div 
        className="bg-eerie-back border border-gunmetal rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Delete Region</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
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
      </div>
    </div>
  )
}

