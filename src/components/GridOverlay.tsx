import { useEffect, useRef } from 'react'
import { MapState } from '../types'
import { worldToPixel, imageToCanvas } from '../utils/coordinateUtils'

interface GridOverlayProps {
  canvas: HTMLCanvasElement | null
  mapState: MapState
  isVisible: boolean
}

export function GridOverlay({ canvas, mapState, isVisible }: GridOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay || !canvas || !mapState.image || !mapState.originSelected || !isVisible) return

    overlay.width = canvas.width
    overlay.height = canvas.height

    const ctx = overlay.getContext('2d')
    if (!ctx) return

    // Clear overlay
    ctx.clearRect(0, 0, overlay.width, overlay.height)

    // Draw chunk grid (16x16 blocks)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1

    const chunkSize = 16
    const imageWidth = mapState.image.width
    const imageHeight = mapState.image.height

    // Calculate grid bounds relative to origin (if set) or image center
    let startX, endX, startZ, endZ
    if (mapState.originOffset) {
      // Use origin as reference point - ensure origin aligns with grid intersection
      const originX = mapState.originOffset.x
      const originZ = mapState.originOffset.y
      // Calculate grid bounds so origin falls on a grid intersection
      const gridRadius = Math.max(imageWidth, imageHeight) / 2
      // Align grid so origin is at a grid intersection
      startX = originX - Math.floor(gridRadius / chunkSize) * chunkSize
      endX = originX + Math.ceil(gridRadius / chunkSize) * chunkSize
      startZ = originZ - Math.floor(gridRadius / chunkSize) * chunkSize
      endZ = originZ + Math.ceil(gridRadius / chunkSize) * chunkSize
    } else {
      // Fallback to image center
      startX = Math.floor(-imageWidth / 2 / chunkSize) * chunkSize
      endX = Math.ceil(imageWidth / 2 / chunkSize) * chunkSize
      startZ = Math.floor(-imageHeight / 2 / chunkSize) * chunkSize
      endZ = Math.ceil(imageHeight / 2 / chunkSize) * chunkSize
    }

    // Draw vertical lines using raw pixel coordinates
    for (let x = startX; x <= endX; x += chunkSize) {
      const pixelX = x
      const canvasPos = imageToCanvas(pixelX, 0, mapState.scale, mapState.offsetX, mapState.offsetY)
      
      ctx.beginPath()
      ctx.moveTo(canvasPos.x, 0)
      ctx.lineTo(canvasPos.x, overlay.height)
      ctx.stroke()
    }

    // Draw horizontal lines using raw pixel coordinates
    for (let z = startZ; z <= endZ; z += chunkSize) {
      const pixelY = z
      const canvasPos = imageToCanvas(0, pixelY, mapState.scale, mapState.offsetX, mapState.offsetY)
      
      ctx.beginPath()
      ctx.moveTo(0, canvasPos.y)
      ctx.lineTo(overlay.width, canvasPos.y)
      ctx.stroke()
    }

    // Draw origin lines (thicker)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
    ctx.lineWidth = 2

    // Use the actual origin offset (where user clicked) for origin lines
    if (mapState.originOffset) {
      const originCanvas = imageToCanvas(mapState.originOffset.x, mapState.originOffset.y, mapState.scale, mapState.offsetX, mapState.offsetY)
      
      ctx.beginPath()
      ctx.moveTo(originCanvas.x, 0)
      ctx.lineTo(originCanvas.x, overlay.height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, originCanvas.y)
      ctx.lineTo(overlay.width, originCanvas.y)
      ctx.stroke()
    }

  }, [canvas, mapState, isVisible])

  if (!isVisible) return null

  if (!canvas || !mapState.image || !mapState.originSelected) return null

  return (
    <canvas
      ref={overlayRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: canvas.width, height: canvas.height }}
    />
  )
}
