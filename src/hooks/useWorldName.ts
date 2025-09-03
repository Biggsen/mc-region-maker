import { useState, useCallback, useEffect } from 'react'

const WORLD_NAME_STORAGE_KEY = 'mc-region-maker-world-name'

export function useWorldName() {
  const [worldName, setWorldName] = useState('world')

  // Load world name from localStorage on mount
  useEffect(() => {
    try {
      const savedWorldName = localStorage.getItem(WORLD_NAME_STORAGE_KEY)
      if (savedWorldName) {
        setWorldName(savedWorldName)
      }
    } catch (error) {
      console.warn('Failed to load world name from localStorage:', error)
    }
  }, [])

  const updateWorldName = useCallback((newName: string) => {
    setWorldName(newName)
    
    // Save to localStorage
    try {
      localStorage.setItem(WORLD_NAME_STORAGE_KEY, newName)
    } catch (error) {
      console.warn('Failed to save world name to localStorage:', error)
    }
  }, [])

  return {
    worldName,
    updateWorldName
  }
}
