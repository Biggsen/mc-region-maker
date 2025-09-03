import React, { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'

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
    <div className="mb-4">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-3xl font-bold text-white bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-400 px-2 py-1"
        />
      ) : (
        <h1 
          onClick={handleClick}
          className="text-3xl font-bold text-white cursor-pointer hover:text-blue-300 transition-colors px-2 py-1 rounded"
        >
          {worldName.worldName}
        </h1>
      )}
    </div>
  )
}
