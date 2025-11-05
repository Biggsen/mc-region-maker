import { SIDEBAR_WIDTH, ZOOM_PADDING, MIN_ZOOM, MAX_ZOOM } from './constants'
import { worldToPixel } from './coordinateUtils'

export interface ZoomToFitResult {
  scale: number
  offsetX: number
  offsetY: number
}

/**
 * Calculate zoom and offset to fit a region on the canvas
 * @param regionPoints Array of region points in world coordinates
 * @param imageWidth Width of the map image
 * @param imageHeight Height of the map image
 * @param originOffset Origin offset for coordinate conversion
 * @returns Zoom and offset values, or null if calculation fails
 */
export function calculateZoomToFitRegion(
  regionPoints: { x: number; z: number }[],
  imageWidth: number,
  imageHeight: number,
  originOffset: { x: number; y: number } | null
): ZoomToFitResult | null {
  if (regionPoints.length < 2) {
    return null
  }

  // Convert all region points from world coordinates to pixel coordinates
  const pixelPoints = regionPoints.map(point => 
    worldToPixel(point.x, point.z, imageWidth, imageHeight, originOffset)
  )

  // Calculate bounding box in pixel coordinates
  const minX = Math.min(...pixelPoints.map(p => p.x))
  const maxX = Math.max(...pixelPoints.map(p => p.x))
  const minY = Math.min(...pixelPoints.map(p => p.y))
  const maxY = Math.max(...pixelPoints.map(p => p.y))

  const width = maxX - minX
  const height = maxY - minY
  
  if (width <= 0 || height <= 0) {
    return null
  }
  
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  // Calculate available canvas space (accounting for sidebar)
  const canvasWidth = window.innerWidth - SIDEBAR_WIDTH
  const canvasHeight = window.innerHeight

  // Add padding
  const availableWidth = canvasWidth * (1 - ZOOM_PADDING * 2)
  const availableHeight = canvasHeight * (1 - ZOOM_PADDING * 2)

  // Calculate scale to fit the region
  const scaleX = availableWidth / width
  const scaleY = availableHeight / height
  const newScale = Math.max(MIN_ZOOM, Math.min(scaleX, scaleY, MAX_ZOOM))

  if (!isFinite(newScale) || newScale <= 0) {
    return null
  }

  // Calculate offset to center the region on canvas
  // We want the center of the region (in pixel space) to be at the center of the canvas
  // offset = canvasCenter - (pixelCenter * scale)
  const canvasCenterX = canvasWidth / 2
  const canvasCenterY = canvasHeight / 2
  const newOffsetX = canvasCenterX - centerX * newScale
  const newOffsetY = canvasCenterY - centerY * newScale

  return {
    scale: newScale,
    offsetX: newOffsetX,
    offsetY: newOffsetY
  }
}

