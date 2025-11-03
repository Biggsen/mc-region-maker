import React, { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { Pencil } from 'lucide-react'

export function WorldNameHeading() {
  const { worldName } = useAppContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(worldName.worldName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = () => {
    setIsEditing(true)
    setEditValue(worldName.worldName)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue.trim()) {
      worldName.updateWorldName(editValue.trim())
    } else {
      setEditValue(worldName.worldName)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(worldName.worldName)
    }
  }

  return (
    <div>
      <div className="text-sm text-gray-300 px-2 py-1 rounded flex items-center gap-2">
        <span className="font-medium w-28">World Name:</span>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm text-input-text bg-transparent border-b-2 border-lapis-lazuli focus:outline-none focus:border-lapis-lighter px-2 py-1"
          />
        ) : (
          <>
            <span>{worldName.worldName}</span>
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
