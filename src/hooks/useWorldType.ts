import { useState, useCallback, useEffect } from 'react'

export type WorldType = 'overworld' | 'nether'

export function useWorldType() {
  const [worldType, setWorldType] = useState<WorldType>(() => {
    const saved = localStorage.getItem('mc-region-maker-world-type')
    return (saved === 'overworld' || saved === 'nether') ? saved as WorldType : 'overworld'
  })

  // Save world type whenever it changes
  useEffect(() => {
    localStorage.setItem('mc-region-maker-world-type', worldType)
  }, [worldType])

  const toggleWorldType = useCallback(() => {
    setWorldType(prev => prev === 'overworld' ? 'nether' : 'overworld')
  }, [])

  const setWorldTypeValue = useCallback((type: WorldType) => {
    setWorldType(type)
  }, [])

  return {
    worldType,
    toggleWorldType,
    setWorldType: setWorldTypeValue
  }
}