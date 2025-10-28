import { useState, useEffect, useRef, useCallback } from 'react'
import { Region, MapState } from '../types'

interface LastSavedState {
  regions: Region[]
  worldName: string
  spawnCoordinates: { x: number; z: number; radius?: number } | null
  worldType: 'overworld' | 'nether'
  mapImageSrc: string | null
}

export function useDataChanged(
  regions: Region[],
  mapState: MapState,
  worldName: string,
  spawnCoordinates: { x: number; z: number; radius?: number } | null,
  worldType: 'overworld' | 'nether'
) {
  const [hasChanged, setHasChanged] = useState(false)
  const lastSavedRef = useRef<LastSavedState | null>(null)

  // Get a stable representation of the map image
  const getMapImageKey = useCallback((): string | null => {
    if (!mapState.image) return null
    const image = mapState.image as any
    return image.src || `${image.width}x${image.height}`
  }, [mapState.image])

  // Check if current state differs from last saved
  const checkForChanges = useCallback(() => {
    if (!lastSavedRef.current) {
      const hasData = 
        regions.length > 0 ||
        mapState.image !== null ||
        worldName !== 'world' ||
        spawnCoordinates !== null
      setHasChanged(hasData)
      return
    }

    const last = lastSavedRef.current
    const currentImageKey = getMapImageKey()

    const regionsChanged = JSON.stringify(regions) !== JSON.stringify(last.regions)
    const worldNameChanged = worldName !== last.worldName
    const spawnChanged = JSON.stringify(spawnCoordinates) !== JSON.stringify(last.spawnCoordinates)
    const worldTypeChanged = worldType !== last.worldType
    const mapImageChanged = currentImageKey !== last.mapImageSrc

    setHasChanged(
      regionsChanged ||
      worldNameChanged ||
      spawnChanged ||
      worldTypeChanged ||
      mapImageChanged
    )
  }, [regions, mapState.image, worldName, spawnCoordinates, worldType, getMapImageKey])

  // Check for changes whenever monitored data changes
  useEffect(() => {
    checkForChanges()
  }, [checkForChanges])

  // Mark data as saved (call this after successful export)
  const markAsSaved = () => {
    lastSavedRef.current = {
      regions: JSON.parse(JSON.stringify(regions)), // Deep clone (includes subregions/villages)
      worldName,
      spawnCoordinates: spawnCoordinates ? JSON.parse(JSON.stringify(spawnCoordinates)) : null,
      worldType,
      mapImageSrc: getMapImageKey()
    }
    setHasChanged(false)
  }

  return { hasChanged, markAsSaved }
}

