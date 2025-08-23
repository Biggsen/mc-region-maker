import React, { useEffect, useRef } from 'react'
import { MapState, Region } from '../types'
import { worldToPixel, imageToCanvas } from '../utils/coordinateUtils'

interface RegionOverlayProps {
  canvas: HTMLCanvasElement | null
  mapState: MapState
  drawingRegion: Region | null
  selectedRegionId: string | null
  regions?: Region[]
}

export function RegionOverlay({ 
  canvas, 
  mapState, 
  drawingRegion, 
  selectedRegionId,
  regions = []
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
      drawRegion(ctx, region, mapState, region.id === selectedRegionId)
    })

    // Draw drawing region
    if (drawingRegion && drawingRegion.points.length > 0) {
      drawRegion(ctx, drawingRegion, mapState, false, true)
    }

  }, [canvas, mapState, drawingRegion, selectedRegionId, regions])

  const drawRegion = (
    ctx: CanvasRenderingContext2D, 
    region: Region, 
    mapState: MapState, 
    isSelected: boolean = false,
    isDrawing: boolean = false
  ) => {
    if (region.points.length < 2) return

    const imageWidth = mapState.image!.width
    const imageHeight = mapState.image!.height

    // Convert world coordinates to canvas coordinates
    const canvasPoints = region.points.map(point => {
      const pixelPos = worldToPixel(point.x, point.z, imageWidth, imageHeight)
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
    ctx.fillStyle = isSelected 
      ? 'rgba(0, 255, 0, 1)' 
      : isDrawing 
        ? 'rgba(255, 255, 0, 1)'
        : 'rgba(0, 100, 255, 1)'
    
    canvasPoints.forEach(point => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
      ctx.fill()
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

  if (!canvas || !mapState.image) return null

  return (
    <canvas
      ref={overlayRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: canvas.width, height: canvas.height }}
    />
  )
}
