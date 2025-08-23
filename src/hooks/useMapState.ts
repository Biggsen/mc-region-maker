import { useState, useCallback } from 'react'
import { MapState } from '../types'

export function useMapState() {
  const [mapState, setMapState] = useState<MapState>({
    image: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastMousePos: null
  })

  const setImage = useCallback((image: HTMLImageElement) => {
    setMapState(prev => ({ ...prev, image }))
  }, [])

  const setScale = useCallback((scale: number) => {
    setMapState(prev => ({ ...prev, scale: Math.max(0.1, Math.min(5, scale)) }))
  }, [])

  const setOffset = useCallback((offsetX: number, offsetY: number) => {
    setMapState(prev => ({ ...prev, offsetX, offsetY }))
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
    const newScale = mapState.scale * zoomFactor

    // Zoom towards mouse position
    const scaleDiff = newScale - mapState.scale
    const newOffsetX = mapState.offsetX - (x - mapState.offsetX) * scaleDiff / mapState.scale
    const newOffsetY = mapState.offsetY - (y - mapState.offsetY) * scaleDiff / mapState.scale

    setMapState(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(5, newScale)),
      offsetX: newOffsetX,
      offsetY: newOffsetY
    }))
  }, [mapState.scale, mapState.offsetX, mapState.offsetY])

  return {
    mapState,
    setImage,
    setScale,
    setOffset,
    startDragging,
    stopDragging,
    handleMouseMove,
    handleWheel
  }
}
