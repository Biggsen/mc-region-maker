import { useState, useCallback } from 'react'
import { CustomMarker, WorldCoordinate } from '../types'

export function useCustomMarkers() {
  const [customMarker, setCustomMarker] = useState<CustomMarker | null>(null)
  const [orphanedVillageMarkers, setOrphanedVillageMarkers] = useState<CustomMarker[]>([])
  const [showOrphanedVillages, setShowOrphanedVillages] = useState(true)

  const setMarker = useCallback((coordinates: WorldCoordinate) => {
    const newMarker: CustomMarker = {
      id: `marker-${Date.now()}`,
      coordinates,
      type: 'custom'
    }
    setCustomMarker(newMarker)
  }, [])

  const addOrphanedVillageMarkers = useCallback((villages: { x: number; z: number; details: string; type: string }[]) => {
    const villageMarkers: CustomMarker[] = villages.map((village, index) => ({
      id: `orphaned-village-${index}-${Date.now()}`,
      coordinates: { x: village.x, z: village.z },
      type: 'orphaned_village',
      details: village.details,
      villageType: village.type
    }))
    setOrphanedVillageMarkers(villageMarkers)
  }, [])

  const clearMarker = useCallback(() => {
    setCustomMarker(null)
  }, [])

  const clearOrphanedVillageMarkers = useCallback(() => {
    setOrphanedVillageMarkers([])
  }, [])

  const toggleShowOrphanedVillages = useCallback(() => {
    setShowOrphanedVillages(prev => !prev)
  }, [])

  return {
    customMarker,
    orphanedVillageMarkers,
    showOrphanedVillages,
    setMarker,
    addOrphanedVillageMarkers,
    clearMarker,
    clearOrphanedVillageMarkers,
    toggleShowOrphanedVillages
  }
}
