import { useState, useCallback, useEffect } from 'react'
import { Region, EditMode } from '../types'
import { generateId, generateRegionYAML } from '../utils/polygonUtils'
import { saveRegions, loadRegions, saveSelectedRegion, loadSelectedRegion } from '../utils/persistenceUtils'

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [drawingRegion, setDrawingRegion] = useState<Region | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [editMode, setEditMode] = useState<EditMode>({
    isEditing: false,
    editingRegionId: null,
    draggingPointIndex: null
  })

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
    // Exit edit mode if the deleted region was being edited
    if (editMode.editingRegionId === id) {
      setEditMode({
        isEditing: false,
        editingRegionId: null,
        draggingPointIndex: null
      })
    }
  }, [selectedRegionId, editMode.editingRegionId])

  const startDrawingRegion = useCallback((name: string) => {
    const newRegion: Region = {
      id: generateId(),
      name,
      points: [],
      minY: 0,
      maxY: 255
    }
    setDrawingRegion(newRegion)
    // Exit edit mode when starting to draw
    setEditMode({
      isEditing: false,
      editingRegionId: null,
      draggingPointIndex: null
    })
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

  // Edit mode functions
  const startEditMode = useCallback((regionId: string) => {
    setEditMode({
      isEditing: true,
      editingRegionId: regionId,
      draggingPointIndex: null
    })
    setSelectedRegionId(regionId)
  }, [])

  const stopEditMode = useCallback(() => {
    setEditMode({
      isEditing: false,
      editingRegionId: null,
      draggingPointIndex: null
    })
  }, [])

  const startDraggingPoint = useCallback((regionId: string, pointIndex: number) => {
    setEditMode(prev => ({
      ...prev,
      editingRegionId: regionId,
      draggingPointIndex: pointIndex
    }))
  }, [])

  const stopDraggingPoint = useCallback(() => {
    setEditMode(prev => ({
      ...prev,
      draggingPointIndex: null
    }))
  }, [])

  const updatePointPosition = useCallback((regionId: string, pointIndex: number, x: number, z: number) => {
    setRegions(prev => prev.map(region => {
      if (region.id === regionId) {
        const newPoints = [...region.points]
        newPoints[pointIndex] = { x, z }
        return { ...region, points: newPoints }
      }
      return region
    }))
  }, [])

  const addPointToRegion = useCallback((regionId: string, pointIndex: number, x: number, z: number) => {
    setRegions(prev => prev.map(region => {
      if (region.id === regionId) {
        const newPoints = [...region.points]
        newPoints.splice(pointIndex, 0, { x, z })
        return { ...region, points: newPoints }
      }
      return region
    }))
  }, [])

  return {
    regions,
    selectedRegionId,
    drawingRegion,
    editMode,
    addRegion,
    updateRegion,
    deleteRegion,
    setSelectedRegionId,
    replaceRegions,
    startDrawingRegion,
    addPointToDrawing,
    finishDrawingRegion,
    getSelectedRegion,
    getRegionYAML,
    startEditMode,
    stopEditMode,
    startDraggingPoint,
    stopDraggingPoint,
    updatePointPosition,
    addPointToRegion
  }
}
