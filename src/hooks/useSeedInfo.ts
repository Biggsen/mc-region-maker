import { useState, useCallback, useEffect } from 'react'

const WORLD_SEED_STORAGE_KEY = 'mc-region-maker-world-seed'

export interface SeedInfo {
  seed?: string
  dimension?: string
}

export function useSeedInfo() {
  const [seedInfo, setSeedInfo] = useState<SeedInfo>({})

  // Load seed info from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WORLD_SEED_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setSeedInfo(parsed || {})
      }
    } catch (error) {
      console.warn('Failed to load seed info from localStorage:', error)
    }
  }, [])

  const updateSeedInfo = useCallback((info: Partial<SeedInfo>) => {
    setSeedInfo(prev => {
      const updated = { ...prev, ...info }
      
      // Save to localStorage
      try {
        localStorage.setItem(WORLD_SEED_STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to save seed info to localStorage:', error)
      }
      
      return updated
    })
  }, [])

  return {
    seedInfo,
    updateSeedInfo
  }
}

