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

    const imageWidth = mapState.image.width
    const imageHeight = mapState.image.height

    // Calculate pixels per block based on image size
    // mcseedmap shows 8x8 chunks, each chunk is 16 blocks, so 128 blocks total
    // Each block = imageSize / 128
    const pixelsPerBlock = imageWidth / 128
    const blockSize = pixelsPerBlock

    // Calculate grid bounds relative to origin (if set) or image center
    let startX, endX, startZ, endZ
    if (mapState.originOffset) {
      // Use origin as reference point - ensure origin aligns with grid intersection
      const originX = mapState.originOffset.x
      const originZ = mapState.originOffset.y
      // Grid extends from -4096 to +4096 blocks (8192 blocks total = 64 chunks)
      // In pixels: 8192 * pixelsPerBlock
      const gridRadiusInPixels = 4096 * pixelsPerBlock
      // Align grid so origin is at a grid intersection
      startX = originX - Math.floor(gridRadiusInPixels / blockSize) * blockSize
      endX = originX + Math.ceil(gridRadiusInPixels / blockSize) * blockSize
      startZ = originZ - Math.floor(gridRadiusInPixels / blockSize) * blockSize
      endZ = originZ + Math.ceil(gridRadiusInPixels / blockSize) * blockSize
    } else {
      // Fallback to image center
      startX = Math.floor(-imageWidth / 2 / blockSize) * blockSize
      endX = Math.ceil(imageWidth / 2 / blockSize) * blockSize
      startZ = Math.floor(-imageHeight / 2 / blockSize) * blockSize
      endZ = Math.ceil(imageHeight / 2 / blockSize) * blockSize
    }

    // Draw vertical lines using raw pixel coordinates
    for (let x = startX; x <= endX; x += blockSize) {
      const pixelX = x
      const canvasPos = imageToCanvas(pixelX, 0, mapState.scale, mapState.offsetX, mapState.offsetY)
      
      ctx.beginPath()
      ctx.moveTo(canvasPos.x, 0)
      ctx.lineTo(canvasPos.x, overlay.height)
      ctx.stroke()
    }

    // Draw horizontal lines using raw pixel coordinates
    for (let z = startZ; z <= endZ; z += blockSize) {
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
