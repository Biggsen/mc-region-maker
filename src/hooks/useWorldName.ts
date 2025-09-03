import { useState, useCallback } from 'react'

export function useWorldName() {
  const [worldName, setWorldName] = useState('world')

  const updateWorldName = useCallback((newName: string) => {
    setWorldName(newName)
  }, [])

  return {
    worldName,
    updateWorldName
  }
}
