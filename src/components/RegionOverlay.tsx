import { useEffect, useRef } from 'react'
import { MapState, Region, EditMode, HighlightMode, Subregion, WorldCoordinate, ChallengeLevel } from '../types'
import { worldToPixel, imageToCanvas, canvasToImage, pixelToWorld } from '../utils/coordinateUtils'

const CHALLENGE_LEVEL_COLORS: Record<ChallengeLevel, { fill: string; stroke: string }> = {
  Vanilla: { fill: 'rgba(34, 139, 34, 0.7)', stroke: 'rgba(34, 139, 34, 0.9)' }, // Forest Green
  Bronze: { fill: 'rgba(255, 140, 0, 0.7)', stroke: 'rgba(255, 140, 0, 0.9)' }, // Dark Orange
  Silver: { fill: 'rgba(255, 69, 0, 0.7)', stroke: 'rgba(255, 69, 0, 0.9)' }, // Red Orange
  Gold: { fill: 'rgba(200, 0, 0, 0.7)', stroke: 'rgba(200, 0, 0, 0.9)' }, // Pure Red
  Platinum: { fill: 'rgba(80, 0, 0, 0.7)', stroke: 'rgba(80, 0, 0, 0.9)' } // Very Dark Red
}

interface RegionOverlayProps {
  canvas: HTMLCanvasElement | null
  mapState: MapState
  drawingRegion: Region | null
  selectedRegionId: string | null
  editMode: EditMode
  highlightMode: HighlightMode
  regions?: Region[]
  spawnCoordinates?: WorldCoordinate | null
  onPointMouseDown?: (regionId: string, pointIndex: number, event: React.MouseEvent) => void
  onPointMouseMove?: (regionId: string, pointIndex: number, x: number, z: number) => void
  onPointMouseUp?: () => void
  onInsertPointClick?: (regionId: string, pointIndex: number, x: number, z: number) => void
  onPointDoubleClick?: (regionId: string, pointIndex: number) => void
}

export function RegionOverlay({ 
  canvas, 
  mapState, 
  drawingRegion, 
  selectedRegionId,
  editMode,
  highlightMode,
  regions = [],
  spawnCoordinates,
  onPointMouseDown,
  onPointMouseMove,
  onPointMouseUp,
  onInsertPointClick,
  onPointDoubleClick
}: RegionOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay || !canvas || !mapState.image) return

    overlay.width = canvas.width
    overlay.height = canvas.height

    const ctx = overlay.getContext('2d')
    if (!ctx) return

    // Clear overlay
    ctx.clearRect(0, 0, overlay.width, overlay.height)

    // Draw villages first (so they appear behind region labels)
    if (highlightMode.showVillages) {
      regions.forEach(region => {
        if (region.subregions) {
          region.subregions.forEach(subregion => {
            drawVillage(ctx, subregion, mapState, region.id === selectedRegionId)
          })
        }
      })
    }

    // Draw all regions (with labels on top)
    regions.forEach(region => {
      const isSelected = region.id === selectedRegionId
      const isEditing = editMode.isEditing && editMode.editingRegionId === region.id
      const isHighlighted = highlightMode.highlightAll
      const showChallengeLevels = highlightMode.showChallengeLevels
      drawRegion(ctx, region, mapState, isSelected, false, isEditing, isHighlighted, showChallengeLevels)
      
      // Draw center point for each region
      if (highlightMode.showCenterPoints) {
        drawCenterPoint(ctx, region, mapState, isSelected)
      }
    })

    // Draw drawing region
    if (drawingRegion && drawingRegion.points.length > 0) {
      drawRegion(ctx, drawingRegion, mapState, false, true, false, false)
      
      // Draw center point for drawing region
      if (highlightMode.showCenterPoints) {
        drawCenterPoint(ctx, drawingRegion, mapState, false)
      }
    }

    // Draw spawn point
    if (spawnCoordinates) {
      drawSpawnPoint(ctx, spawnCoordinates, mapState)
    }

  }, [canvas, mapState, drawingRegion, selectedRegionId, editMode, highlightMode, regions, spawnCoordinates])

  const drawRegion = (
    ctx: CanvasRenderingContext2D, 
    region: Region, 
    mapState: MapState, 
    isSelected: boolean = false,
    isDrawing: boolean = false,
    isEditing: boolean = false,
    isHighlighted: boolean = false,
    showChallengeLevels: boolean = false
  ) => {
    if (region.points.length < 2) return

    // Convert world coordinates to canvas coordinates
    const canvasPoints = region.points.map(point => {
      const pixelPos = worldToPixel(point.x, point.z, mapState.image!.width, mapState.image!.height, mapState.originOffset)
      return imageToCanvas(pixelPos.x, pixelPos.y, mapState.scale, mapState.offsetX, mapState.offsetY)
    })

    // Draw polygon fill
    let fillColor: string
    if (isSelected) {
      fillColor = 'rgba(0, 255, 0, 0.3)'
    } else if (isDrawing) {
      fillColor = 'rgba(255, 255, 0, 0.2)'
    } else if (isHighlighted) {
      fillColor = 'rgba(255, 255, 0, 0.4)'
    } else if (showChallengeLevels) {
      const challengeLevel = region.challengeLevel || 'Vanilla'
      fillColor = CHALLENGE_LEVEL_COLORS[challengeLevel].fill
    } else {
      fillColor = 'rgba(0, 100, 255, 0.2)'
    }
    ctx.fillStyle = fillColor
    
    ctx.beginPath()
    ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y)
    for (let i = 1; i < canvasPoints.length; i++) {
      ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y)
    }
    ctx.closePath()
    ctx.fill()

    // Draw polygon outline
    let strokeColor: string
    if (isSelected) {
      strokeColor = 'rgba(0, 255, 0, 0.8)'
    } else if (isDrawing) {
      strokeColor = 'rgba(255, 255, 0, 0.8)'
    } else if (isHighlighted) {
      strokeColor = 'rgba(255, 255, 0, 1)'
    } else if (showChallengeLevels) {
      const challengeLevel = region.challengeLevel || 'Vanilla'
      strokeColor = CHALLENGE_LEVEL_COLORS[challengeLevel].stroke
    } else {
      strokeColor = 'rgba(0, 100, 255, 0.8)'
    }
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = isSelected ? 3 : isHighlighted ? 4 : 2
    
    ctx.beginPath()
    ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y)
    for (let i = 1; i < canvasPoints.length; i++) {
      ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y)
    }
    if (!isDrawing) {
      ctx.closePath()
    }
    ctx.stroke()

    // Draw points only when region is selected or being edited
    if (isSelected || isEditing || isDrawing) {
      canvasPoints.forEach((point, index) => {
        const isDragging = editMode.draggingPointIndex === index && editMode.editingRegionId === region.id
        const pointSize = isEditing ? 8 : 4
        
        // Draw point background (white circle)
        if (isEditing) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.beginPath()
          ctx.arc(point.x, point.y, pointSize + 2, 0, 2 * Math.PI)
          ctx.fill()
        }
        
        // Draw point
        ctx.fillStyle = isSelected 
          ? 'rgba(0, 255, 0, 1)' 
          : isDrawing 
            ? 'rgba(255, 255, 0, 1)'
            : isEditing
              ? 'rgba(255, 100, 0, 1)'
              : isHighlighted
                ? 'rgba(255, 255, 0, 1)'
                : 'rgba(0, 100, 255, 1)'
        
        ctx.beginPath()
        ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI)
        ctx.fill()

        // Draw point border for editing mode
        if (isEditing) {
          ctx.strokeStyle = isDragging ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.8)'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    }

    // Draw insertion points between existing points when in edit mode
    if (isEditing && canvasPoints.length >= 2) {
      ctx.fillStyle = 'rgba(0, 255, 255, 0.8)'
      ctx.strokeStyle = 'rgba(0, 255, 255, 1)'
      ctx.lineWidth = 1
      
      for (let i = 0; i < canvasPoints.length; i++) {
        const currentPoint = canvasPoints[i]
        const nextPoint = canvasPoints[(i + 1) % canvasPoints.length]
        
        // Calculate midpoint between current and next point
        const midX = (currentPoint.x + nextPoint.x) / 2
        const midY = (currentPoint.y + nextPoint.y) / 2
        
        // Draw insertion point
        ctx.beginPath()
        ctx.arc(midX, midY, 4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      }
    }

    // Draw region name
    if (canvasPoints.length > 0) {
      const centerX = canvasPoints.reduce((sum, p) => sum + p.x, 0) / canvasPoints.length
      const centerY = canvasPoints.reduce((sum, p) => sum + p.y, 0) / canvasPoints.length
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(centerX - 30, centerY - 10, 60, 20)
      
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(region.name, centerX, centerY)
    }
  }

  const drawCenterPoint = (
    ctx: CanvasRenderingContext2D,
    region: Region,
    mapState: MapState,
    isSelected: boolean = false
  ) => {
    // Only draw center points for regions with custom center points
    if (!region.centerPoint) return

    // Convert world coordinates to canvas coordinates
    const pixelPos = worldToPixel(region.centerPoint.x, region.centerPoint.z, mapState.image!.width, mapState.image!.height, mapState.originOffset)
    const canvasPos = imageToCanvas(pixelPos.x, pixelPos.y, mapState.scale, mapState.offsetX, mapState.offsetY)

    // Draw center point marker (smaller size)
    const markerSize = isSelected ? 6 : 4
    
    // Draw outer ring (white background)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.beginPath()
    ctx.arc(canvasPos.x, canvasPos.y, markerSize + 1, 0, 2 * Math.PI)
    ctx.fill()
    
    // Draw center point (purple for custom center points)
    ctx.fillStyle = 'rgba(255, 0, 255, 1)'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.lineWidth = 1
    
    ctx.beginPath()
    ctx.arc(canvasPos.x, canvasPos.y, markerSize, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    // Draw center point label only for selected regions
    if (isSelected) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(canvasPos.x - 40, canvasPos.y - markerSize - 20, 80, 16)
      
      ctx.fillStyle = 'white'
      ctx.font = '9px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Region Heart', canvasPos.x, canvasPos.y - markerSize - 12)
    }
  }

  const drawVillage = (
    ctx: CanvasRenderingContext2D,
    subregion: Subregion,
    mapState: MapState,
    isParentSelected: boolean = false
  ) => {
    // Convert village world coordinates to canvas coordinates
    const pixelPos = worldToPixel(subregion.x, subregion.z, mapState.image!.width, mapState.image!.height, mapState.originOffset)
    const canvasPos = imageToCanvas(pixelPos.x, pixelPos.y, mapState.scale, mapState.offsetX, mapState.offsetY)
    
    // Draw village center point
    ctx.fillStyle = isParentSelected 
      ? 'rgba(255, 255, 255, 1)' // White center
      : 'rgba(255, 255, 255, 0.8)' // White center
    
    ctx.strokeStyle = isParentSelected 
      ? 'rgba(0, 0, 0, 1)' // Black border
      : 'rgba(0, 0, 0, 0.8)' // Black border
    
    ctx.lineWidth = 2
    
    // Draw village marker (small circle)
    ctx.beginPath()
    ctx.arc(canvasPos.x, canvasPos.y, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // Draw village name
    if (isParentSelected) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(canvasPos.x - 40, canvasPos.y - 25, 80, 20)
      
      ctx.fillStyle = 'white'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(subregion.name, canvasPos.x, canvasPos.y - 15)
    }
  }

  const drawSpawnPoint = (
    ctx: CanvasRenderingContext2D,
    spawnCoordinates: WorldCoordinate,
    mapState: MapState
  ) => {
    const pixelPos = worldToPixel(spawnCoordinates.x, spawnCoordinates.z, mapState.image!.width, mapState.image!.height, mapState.originOffset)
    const canvasPos = imageToCanvas(pixelPos.x, pixelPos.y, mapState.scale, mapState.offsetX, mapState.offsetY)

    ctx.fillStyle = 'rgba(255, 0, 0, 1)' // Red spawn point
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)' // Black border
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.arc(canvasPos.x, canvasPos.y, 8, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Spawn', canvasPos.x, canvasPos.y + 10)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPointMouseDown || !editMode.isEditing || !editMode.editingRegionId) return

    const canvas = overlayRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on a point
    const editingRegion = regions.find(r => r.id === editMode.editingRegionId)
    if (!editingRegion) return

    const canvasPoints = editingRegion.points.map(point => {
      const pixelPos = worldToPixel(point.x, point.z, mapState.image!.width, mapState.image!.height, mapState.originOffset)
      return imageToCanvas(pixelPos.x, pixelPos.y, mapState.scale, mapState.offsetX, mapState.offsetY)
    })

    // Check each point for click
    for (let i = 0; i < canvasPoints.length; i++) {
      const point = canvasPoints[i]
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2))
      const clickRadius = 12 // Larger click area for editing

      if (distance <= clickRadius) {
        onPointMouseDown(editingRegion.id, i, e)
        return
      }
    }

    // Check insertion points if we have the callback
    if (onInsertPointClick && canvasPoints.length >= 2) {
      for (let i = 0; i < canvasPoints.length; i++) {
        const currentPoint = canvasPoints[i]
        const nextPoint = canvasPoints[(i + 1) % canvasPoints.length]
        
        // Calculate midpoint between current and next point
        const midX = (currentPoint.x + nextPoint.x) / 2
        const midY = (currentPoint.y + nextPoint.y) / 2
        
        const distance = Math.sqrt(Math.pow(x - midX, 2) + Math.pow(y - midY, 2))
        const clickRadius = 8 // Click area for insertion points
        
        if (distance <= clickRadius) {
          // Convert canvas coordinates to world coordinates
          const imagePos = canvasToImage(midX, midY, mapState.scale, mapState.offsetX, mapState.offsetY)
          const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image!.width, mapState.image!.height, mapState.originOffset)
          
          // Insert point after the current point
          const insertIndex = (i + 1) % canvasPoints.length
          onInsertPointClick(editingRegion.id, insertIndex, worldPos.x, worldPos.z)
          return
        }
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPointMouseMove || !editMode.isEditing || !editMode.editingRegionId || editMode.draggingPointIndex === null) return

    const canvas = overlayRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert canvas coordinates to world coordinates
    const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
    const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image!.width, mapState.image!.height, mapState.originOffset)

    onPointMouseMove(editMode.editingRegionId, editMode.draggingPointIndex, worldPos.x, worldPos.z)
  }

  const handleMouseUp = () => {
    if (onPointMouseUp) {
      onPointMouseUp()
    }
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPointDoubleClick || !editMode.isEditing || !editMode.editingRegionId) return

    const canvas = overlayRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if double-clicking on a point
    const editingRegion = regions.find(r => r.id === editMode.editingRegionId)
    if (!editingRegion) return

    const canvasPoints = editingRegion.points.map(point => {
      const pixelPos = worldToPixel(point.x, point.z, mapState.image!.width, mapState.image!.height, mapState.originOffset)
      return imageToCanvas(pixelPos.x, pixelPos.y, mapState.scale, mapState.offsetX, mapState.offsetY)
    })

    // Check each point for double-click
    for (let i = 0; i < canvasPoints.length; i++) {
      const point = canvasPoints[i]
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2))
      const clickRadius = 12 // Click area for points

      if (distance <= clickRadius) {
        onPointDoubleClick(editingRegion.id, i)
        return
      }
    }
  }

  if (!canvas || !mapState.image) return null

  return (
    <canvas
      ref={overlayRef}
      className={`absolute top-0 left-0 ${editMode.isEditing ? 'pointer-events-auto cursor-grab' : 'pointer-events-none'}`}
      style={{ width: canvas.width, height: canvas.height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    />
  )
}
