import React, { useState, useRef, useEffect } from 'react'
import { loadImageDetails, saveImageDetails } from '../utils/persistenceUtils'
import { Pencil } from 'lucide-react'

const WORLD_SIZE_OPTIONS = [2, 4, 6, 8, 10, 12, 14, 16]

export function WorldSizeHeading() {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<string>('')
  const selectRef = useRef<HTMLSelectElement>(null)
  
  const imageDetails = loadImageDetails()
  const worldSize = imageDetails?.worldSize

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    if (worldSize) {
      setEditValue(worldSize.toString())
    } else {
      setEditValue('')
    }
  }, [worldSize])

  const handleClick = () => {
    setIsEditing(true)
    setEditValue(worldSize?.toString() || '')
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setEditValue(value)
    if (value) {
      const size = parseInt(value, 10)
      if (!isNaN(size)) {
        const currentDetails = loadImageDetails() || {}
        const imageSize = size * 125 // Calculate image size from world size
        saveImageDetails({
          ...currentDetails,
          worldSize: size,
          imageSize: { width: imageSize, height: imageSize }
        })
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('imageDetailsUpdated'))
      }
    }
    setIsEditing(false)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue) {
      const size = parseInt(editValue, 10)
      if (!isNaN(size) && size > 0) {
        const currentDetails = loadImageDetails() || {}
        const imageSize = size * 125 // Calculate image size from world size
        saveImageDetails({
          ...currentDetails,
          worldSize: size,
          imageSize: { width: imageSize, height: imageSize }
        })
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('imageDetailsUpdated'))
      } else {
        setEditValue(worldSize?.toString() || '')
      }
    } else {
      // Allow clearing
      const currentDetails = loadImageDetails() || {}
      const updatedDetails = { ...currentDetails }
      delete updatedDetails.worldSize
      delete updatedDetails.imageSize
      saveImageDetails(updatedDetails)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('imageDetailsUpdated'))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(worldSize?.toString() || '')
    }
  }

  const displayValue = worldSize ? `${worldSize}k x ${worldSize}k` : 'Not set'

  return (
    <div>
      <div className="text-sm text-gray-300 px-2 py-1 rounded flex items-center gap-2">
        <span className="font-medium w-28">World Size:</span>
        {isEditing ? (
          <select
            ref={selectRef}
            value={editValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm text-input-text bg-input-bg border border-input-border rounded px-2 py-1 focus:outline-none focus:border-lapis-lighter"
            autoFocus
          >
            <option value="">Not set</option>
            {WORLD_SIZE_OPTIONS.map(size => (
              <option key={size} value={size.toString()}>{size}k</option>
            ))}
          </select>
        ) : (
          <>
            <span>{displayValue}</span>
            <Pencil 
              className="w-3 h-3 text-gray-400 hover:text-lapis-lazuli/80 transition-colors cursor-pointer" 
              onClick={handleClick}
            />
          </>
        )}
      </div>
    </div>
  )
}
