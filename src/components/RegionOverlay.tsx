import { useEffect, useRef } from 'react'
import { MapState, Region, EditMode } from '../types'
import { worldToPixel, imageToCanvas, canvasToImage, pixelToWorld } from '../utils/coordinateUtils'

interface RegionOverlayProps {
  canvas: HTMLCanvasElement | null
  mapState: MapState
  drawingRegion: Region | null
  selectedRegionId: string | null
  editMode: EditMode
  regions?: Region[]
  onPointMouseDown?: (regionId: string, pointIndex: number, event: React.MouseEvent) => void
  onPointMouseMove?: (regionId: string, pointIndex: number, x: number, z: number) => void
  onPointMouseUp?: () => void
}

export function RegionOverlay({ 
  canvas, 
  mapState, 
  drawingRegion, 
  selectedRegionId,
  editMode,
  regions = [],
  onPointMouseDown,
  onPointMouseMove,
  onPointMouseUp
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

    // Draw all regions
    regions.forEach(region => {
      const isSelected = region.id === selectedRegionId
      const isEditing = editMode.isEditing && editMode.editingRegionId === region.id
      drawRegion(ctx, region, mapState, isSelected, false, isEditing)
    })

    // Draw drawing region
    if (drawingRegion && drawingRegion.points.length > 0) {
      drawRegion(ctx, drawingRegion, mapState, false, true, false)
    }

  }, [canvas, mapState, drawingRegion, selectedRegionId, editMode, regions])

  const drawRegion = (
    ctx: CanvasRenderingContext2D, 
    region: Region, 
    mapState: MapState, 
    isSelected: boolean = false,
    isDrawing: boolean = false,
    isEditing: boolean = false
  ) => {
    if (region.points.length < 2) return

    // Convert world coordinates to canvas coordinates
    const canvasPoints = region.points.map(point => {
      const pixelPos = worldToPixel(point.x, point.z, mapState.image!.width, mapState.image!.height, mapState.originOffset)
      return imageToCanvas(pixelPos.x, pixelPos.y, mapState.scale, mapState.offsetX, mapState.offsetY)
    })

    // Draw polygon fill
    ctx.fillStyle = isSelected 
      ? 'rgba(0, 255, 0, 0.3)' 
      : isDrawing 
        ? 'rgba(255, 255, 0, 0.2)'
        : 'rgba(0, 100, 255, 0.2)'
    
    ctx.beginPath()
    ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y)
    for (let i = 1; i < canvasPoints.length; i++) {
      ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y)
    }
    ctx.closePath()
    ctx.fill()

    // Draw polygon outline
    ctx.strokeStyle = isSelected 
      ? 'rgba(0, 255, 0, 0.8)' 
      : isDrawing 
        ? 'rgba(255, 255, 0, 0.8)'
        : 'rgba(0, 100, 255, 0.8)'
    ctx.lineWidth = isSelected ? 3 : 2
    
    ctx.beginPath()
    ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y)
    for (let i = 1; i < canvasPoints.length; i++) {
      ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y)
    }
    if (!isDrawing) {
      ctx.closePath()
    }
    ctx.stroke()

    // Draw points
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
        break
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

  if (!canvas || !mapState.image) return null

  return (
    <canvas
      ref={overlayRef}
      className={`absolute top-0 left-0 ${editMode.isEditing ? 'pointer-events-auto cursor-grab' : 'pointer-events-none'}`}
      style={{ width: canvas.width, height: canvas.height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
}
