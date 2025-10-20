import { useState, useCallback } from 'react'
import { CustomMarker, WorldCoordinate } from '../types'

export function useCustomMarkers() {
  const [customMarker, setCustomMarker] = useState<CustomMarker | null>(null)

  const setMarker = useCallback((coordinates: WorldCoordinate) => {
    const newMarker: CustomMarker = {
      id: `marker-${Date.now()}`,
      coordinates
    }
    setCustomMarker(newMarker)
  }, [])

  const clearMarker = useCallback(() => {
    setCustomMarker(null)
  }, [])

  return {
    customMarker,
    setMarker,
    clearMarker
  }
}
