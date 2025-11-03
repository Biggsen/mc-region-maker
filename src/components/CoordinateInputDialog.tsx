import React, { useState } from 'react'
import { WorldCoordinate } from '../types'
import { BaseModal } from './BaseModal'
import { Button } from './Button'

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Custom Marker"
      size="sm"
      contentClassName="w-80"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 text-sm mb-2">X Coordinate</label>
            <input
              type="number"
              value={x}
              onChange={(e) => setX(e.target.value)}
              placeholder="Enter X"
              className="w-full bg-input-bg text-input-text px-3 py-2 rounded border border-input-border focus:border-lapis-lighter focus:outline-none placeholder:text-gray-500"
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
              placeholder="Enter Z"
              className="w-full bg-input-bg text-input-text px-3 py-2 rounded border border-input-border focus:border-lapis-lighter focus:outline-none placeholder:text-gray-500"
              required
            />
          </div>
        </div>
        
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            Add Marker
          </Button>
        </div>
      </form>
    </BaseModal>
  )
}
