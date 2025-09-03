import { useState, useCallback, useEffect } from 'react'
import { SpawnState, WorldCoordinate } from '../types'

const SPAWN_STORAGE_KEY = 'mc-region-maker-spawn'

export function useSpawn() {
  const [spawnState, setSpawnState] = useState<SpawnState>({
    coordinates: null,
    isPlacing: false,
    radius: 50
  })

  // Load spawn coordinates and radius from localStorage on mount
  useEffect(() => {
    try {
      const savedSpawn = localStorage.getItem(SPAWN_STORAGE_KEY)
      if (savedSpawn) {
        const parsedSpawn = JSON.parse(savedSpawn)
        if (parsedSpawn && typeof parsedSpawn.x === 'number' && typeof parsedSpawn.z === 'number') {
          setSpawnState(prev => ({
            ...prev,
            coordinates: parsedSpawn,
            radius: parsedSpawn.radius || 50
          }))
        }
      }
    } catch (error) {
      console.warn('Failed to load spawn data from localStorage:', error)
    }
  }, [])

  const setSpawnCoordinates = useCallback((coordinates: WorldCoordinate | null) => {
    setSpawnState(prev => ({
      ...prev,
      coordinates,
      isPlacing: false
    }))

    // Save to localStorage
    if (coordinates) {
      try {
        const spawnData = { ...coordinates, radius: spawnState.radius }
        localStorage.setItem(SPAWN_STORAGE_KEY, JSON.stringify(spawnData))
      } catch (error) {
        console.warn('Failed to save spawn data to localStorage:', error)
      }
    } else {
      // Remove from localStorage if coordinates are null
      try {
        localStorage.removeItem(SPAWN_STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to remove spawn data from localStorage:', error)
      }
    }
  }, [spawnState.radius])

  const setSpawnRadius = useCallback((radius: number) => {
    setSpawnState(prev => ({
      ...prev,
      radius
    }))

    // Save radius to localStorage if coordinates exist
    if (spawnState.coordinates) {
      try {
        const spawnData = { ...spawnState.coordinates, radius }
        localStorage.setItem(SPAWN_STORAGE_KEY, JSON.stringify(spawnData))
      } catch (error) {
        console.warn('Failed to save spawn radius to localStorage:', error)
      }
    }
  }, [spawnState.coordinates])

  const startPlacingSpawn = useCallback(() => {
    setSpawnState(prev => ({
      ...prev,
      isPlacing: true
    }))
  }, [])

  const cancelPlacingSpawn = useCallback(() => {
    setSpawnState(prev => ({
      ...prev,
      isPlacing: false
    }))
  }, [])

  return {
    spawnState,
    setSpawnCoordinates,
    setSpawnRadius,
    startPlacingSpawn,
    cancelPlacingSpawn
  }
}
