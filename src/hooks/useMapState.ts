import { useState, useCallback, useEffect } from 'react'
import { MapState } from '../types'
import { saveMapState, loadMapState } from '../utils/persistenceUtils'

export function useMapState() {
  const [mapState, setMapState] = useState<MapState>({
    image: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastMousePos: null,
    originSelected: false,
    originOffset: null
  })

  // Load saved state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      const savedState = await loadMapState()
      if (savedState) {
        setMapState(savedState)
      }
    }
    loadSavedState()
  }, [])

  // Save state whenever it changes (but not during initial load)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Always save map state, even without image (to preserve zoom/position)
      saveMapState(mapState)
    }, 100) // Small delay to avoid saving during initial load
    
    return () => clearTimeout(timeoutId)
  }, [mapState])

  const setImage = useCallback((image: HTMLImageElement) => {
    setMapState(prev => ({ ...prev, image }))
  }, [])

  const setScale = useCallback((scale: number) => {
    setMapState(prev => ({ ...prev, scale: Math.max(0.1, Math.min(5, scale)) }))
  }, [])

  const setOffset = useCallback((offsetX: number, offsetY: number) => {
    setMapState(prev => ({ ...prev, offsetX, offsetY }))
  }, [])

  const setOrigin = useCallback((originX: number, originY: number) => {
    setMapState(prev => ({ 
      ...prev, 
      originSelected: true, 
      originOffset: { x: originX, y: originY } 
    }))
  }, [])

  const startDragging = useCallback((x: number, y: number) => {
    setMapState(prev => ({
      ...prev,
      isDragging: true,
      lastMousePos: { x, y }
    }))
  }, [])

  const stopDragging = useCallback(() => {
    setMapState(prev => ({
      ...prev,
      isDragging: false,
      lastMousePos: null
    }))
  }, [])

  const handleMouseMove = useCallback((x: number, y: number) => {
    if (!mapState.isDragging || !mapState.lastMousePos) return

    const deltaX = x - mapState.lastMousePos.x
    const deltaY = y - mapState.lastMousePos.y

    setMapState(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY,
      lastMousePos: { x, y }
    }))
  }, [mapState.isDragging, mapState.lastMousePos])

  const handleWheel = useCallback((deltaY: number, x: number, y: number) => {
    const zoomFactor = deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(10, mapState.scale * zoomFactor))

    // Calculate the point under the mouse before zoom
    const pointXBeforeZoom = (x - mapState.offsetX) / mapState.scale
    const pointYBeforeZoom = (y - mapState.offsetY) / mapState.scale

    // Calculate the point under the mouse after zoom
    const pointXAfterZoom = (x - mapState.offsetX) / newScale
    const pointYAfterZoom = (y - mapState.offsetY) / newScale

    // Calculate the new offset to keep the same point under the mouse
    const newOffsetX = mapState.offsetX + (pointXAfterZoom - pointXBeforeZoom) * newScale
    const newOffsetY = mapState.offsetY + (pointYAfterZoom - pointYBeforeZoom) * newScale

    setMapState(prev => ({
      ...prev,
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY
    }))
  }, [mapState.scale, mapState.offsetX, mapState.offsetY])

  return {
    mapState,
    setImage,
    setScale,
    setOffset,
    setOrigin,
    startDragging,
    stopDragging,
    handleMouseMove,
    handleWheel
  }
}
