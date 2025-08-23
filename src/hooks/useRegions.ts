import { useState, useCallback, useEffect } from 'react'
import { Region } from '../types'
import { generateId, generateRegionYAML } from '../utils/polygonUtils'
import { saveRegions, loadRegions, saveSelectedRegion, loadSelectedRegion } from '../utils/persistenceUtils'

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [drawingRegion, setDrawingRegion] = useState<Region | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load saved data on mount
  useEffect(() => {
    const savedRegions = loadRegions()
    const savedSelectedRegion = loadSelectedRegion()
    
    setRegions(savedRegions)
    setSelectedRegionId(savedSelectedRegion)
    setIsInitialized(true)
  }, [])

  // Save regions whenever they change (but not during initial load)
  useEffect(() => {
    if (isInitialized) {
      saveRegions(regions)
    }
  }, [regions, isInitialized])

  // Save selected region whenever it changes (but not during initial load)
  useEffect(() => {
    if (isInitialized) {
      saveSelectedRegion(selectedRegionId)
    }
  }, [selectedRegionId, isInitialized])

  const addRegion = useCallback((region: Omit<Region, 'id'>) => {
    const newRegion: Region = {
      ...region,
      id: generateId()
    }
    setRegions(prev => [...prev, newRegion])
    setSelectedRegionId(newRegion.id)
    setDrawingRegion(null)
  }, [])

  const updateRegion = useCallback((id: string, updates: Partial<Region>) => {
    setRegions(prev => prev.map(region => 
      region.id === id ? { ...region, ...updates } : region
    ))
  }, [])

  const deleteRegion = useCallback((id: string) => {
    setRegions(prev => prev.filter(region => region.id !== id))
    if (selectedRegionId === id) {
      setSelectedRegionId(null)
    }
  }, [selectedRegionId])

  const startDrawingRegion = useCallback((name: string) => {
    const newRegion: Region = {
      id: generateId(),
      name,
      points: [],
      minY: 0,
      maxY: 255
    }
    setDrawingRegion(newRegion)
  }, [])

  const addPointToDrawing = useCallback((x: number, z: number) => {
    if (!drawingRegion) return
    
    setDrawingRegion(prev => prev ? {
      ...prev,
      points: [...prev.points, { x, z }]
    } : null)
  }, [drawingRegion])

  const finishDrawingRegion = useCallback(() => {
    if (drawingRegion && drawingRegion.points.length >= 3) {
      addRegion(drawingRegion)
    }
  }, [drawingRegion, addRegion])

  const getSelectedRegion = useCallback(() => {
    return regions.find(region => region.id === selectedRegionId) || null
  }, [regions, selectedRegionId])

  const getRegionYAML = useCallback((regionId: string) => {
    const region = regions.find(r => r.id === regionId)
    return region ? generateRegionYAML(region) : ''
  }, [regions])

  const replaceRegions = useCallback((newRegions: Region[]) => {
    setRegions(newRegions)
  }, [])

  return {
    regions,
    selectedRegionId,
    drawingRegion,
    addRegion,
    updateRegion,
    deleteRegion,
    setSelectedRegionId,
    replaceRegions,
    startDrawingRegion,
    addPointToDrawing,
    finishDrawingRegion,
    getSelectedRegion,
    getRegionYAML
  }
}
