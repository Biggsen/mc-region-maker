import React, { useEffect, useRef } from 'react'
import { MapState } from '../types'
import { worldToPixel, imageToCanvas } from '../utils/coordinateUtils'

interface GridOverlayProps {
  canvas: HTMLCanvasElement | null
  mapState: MapState
}

export function GridOverlay({ canvas, mapState }: GridOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay || !canvas || !mapState.image || !mapState.originSelected) return

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

    // Calculate grid bounds
    const startX = Math.floor(-imageWidth / 2 / chunkSize) * chunkSize
    const endX = Math.ceil(imageWidth / 2 / chunkSize) * chunkSize
    const startZ = Math.floor(-imageHeight / 2 / chunkSize) * chunkSize
    const endZ = Math.ceil(imageHeight / 2 / chunkSize) * chunkSize

    // Draw vertical lines
    for (let x = startX; x <= endX; x += chunkSize) {
      const pixelPos = worldToPixel(x, 0, imageWidth, imageHeight, mapState.originOffset)
      const canvasPos = imageToCanvas(pixelPos.x, pixelPos.y, mapState.scale, mapState.offsetX, mapState.offsetY)
      
      ctx.beginPath()
      ctx.moveTo(canvasPos.x, 0)
      ctx.lineTo(canvasPos.x, overlay.height)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let z = startZ; z <= endZ; z += chunkSize) {
      const pixelPos = worldToPixel(0, z, imageWidth, imageHeight, mapState.originOffset)
      const canvasPos = imageToCanvas(pixelPos.x, pixelPos.y, mapState.scale, mapState.offsetX, mapState.offsetY)
      
      ctx.beginPath()
      ctx.moveTo(0, canvasPos.y)
      ctx.lineTo(overlay.width, canvasPos.y)
      ctx.stroke()
    }

    // Draw origin lines (thicker)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
    ctx.lineWidth = 2

    const originPixel = worldToPixel(0, 0, imageWidth, imageHeight, mapState.originOffset)
    const originCanvas = imageToCanvas(originPixel.x, originPixel.y, mapState.scale, mapState.offsetX, mapState.offsetY)

    ctx.beginPath()
    ctx.moveTo(originCanvas.x, 0)
    ctx.lineTo(originCanvas.x, overlay.height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, originCanvas.y)
    ctx.lineTo(overlay.width, originCanvas.y)
    ctx.stroke()

  }, [canvas, mapState])

  if (!canvas || !mapState.image || !mapState.originSelected) return null

  return (
    <canvas
      ref={overlayRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: canvas.width, height: canvas.height }}
    />
  )
}
