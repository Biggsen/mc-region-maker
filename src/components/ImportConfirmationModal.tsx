import React from 'react'
import { X } from 'lucide-react'

interface ImportConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ImportConfirmationModal({ isOpen, onConfirm, onCancel }: ImportConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-eerie-back border border-gunmetal rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Import New Map</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-3">
            Importing this map will clear all current data and start fresh.
          </p>
          <div className="bg-yellow-900 border border-yellow-600 rounded p-3">
            <p className="text-yellow-200 text-sm">
              ⚠️ All existing regions will be lost.
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-viridian hover:bg-viridian/80 text-white rounded-md transition-colors font-medium"
          >
            Import Map
          </button>
        </div>
      </div>
    </div>
  )
}
