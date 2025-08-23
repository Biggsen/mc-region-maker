import { WorldCoordinate, PixelCoordinate } from '../types'

export function pixelToWorld(
  pixelX: number,
  pixelY: number,
  imageWidth: number,
  imageHeight: number,
  originOffset: { x: number; y: number } | null
): WorldCoordinate {
  if (!originOffset) {
    // Fallback to center if no origin is selected
    return {
      x: (pixelX - Math.floor(imageWidth / 2)) * 8,
      z: (pixelY - Math.floor(imageHeight / 2)) * 8
    }
  }
  
  return {
    x: (pixelX - originOffset.x) * 8,
    z: (pixelY - originOffset.y) * 8
  }
}

export function worldToPixel(
  worldX: number,
  worldZ: number,
  imageWidth: number,
  imageHeight: number,
  originOffset: { x: number; y: number } | null
): PixelCoordinate {
  if (!originOffset) {
    // Fallback to center if no origin is selected
    return {
      x: (worldX / 8) + Math.floor(imageWidth / 2),
      y: (worldZ / 8) + Math.floor(imageHeight / 2)
    }
  }
  
  return {
    x: (worldX / 8) + originOffset.x,
    y: (worldZ / 8) + originOffset.y
  }
}

export function canvasToImage(
  canvasX: number,
  canvasY: number,
  scale: number,
  offsetX: number,
  offsetY: number
): PixelCoordinate {
  return {
    x: (canvasX - offsetX) / scale,
    y: (canvasY - offsetY) / scale
  }
}

export function imageToCanvas(
  imageX: number,
  imageY: number,
  scale: number,
  offsetX: number,
  offsetY: number
): PixelCoordinate {
  return {
    x: imageX * scale + offsetX,
    y: imageY * scale + offsetY
  }
}

export function isPointInPolygon(
  point: WorldCoordinate,
  polygon: WorldCoordinate[]
): boolean {
  if (polygon.length < 3) return false
  
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const zi = polygon[i].z
    const xj = polygon[j].x
    const zj = polygon[j].z
    
    if (((zi > point.z) !== (zj > point.z)) &&
        (point.x < (xj - xi) * (point.z - zi) / (zj - zi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}
