import React, { useState } from 'react'
import { WorldCoordinate } from '../types'

interface CoordinateInputDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (coordinates: WorldCoordinate) => void
}

export function CoordinateInputDialog({ isOpen, onClose, onSubmit }: CoordinateInputDialogProps) {
  const [x, setX] = useState('')
  const [z, setZ] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const xNum = parseInt(x)
    const zNum = parseInt(z)
    
    if (!isNaN(xNum) && !isNaN(zNum)) {
      onSubmit({ x: xNum, z: zNum })
      setX('')
      setZ('')
      onClose()
    }
  }

  const handleClose = () => {
    setX('')
    setZ('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-80">
        <h3 className="text-white text-lg font-semibold mb-4">Add Custom Marker</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">X Coordinate</label>
            <input
              type="number"
              value={x}
              onChange={(e) => setX(e.target.value)}
              placeholder="Enter X coordinate"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              autoFocus
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-2">Z Coordinate</label>
            <input
              type="number"
              value={z}
              onChange={(e) => setZ(e.target.value)}
              placeholder="Enter Z coordinate"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Add Marker
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
