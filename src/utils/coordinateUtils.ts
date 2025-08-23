import { WorldCoordinate, PixelCoordinate } from '../types'

export function pixelToWorld(
  pixelX: number,
  pixelY: number,
  imageWidth: number,
  imageHeight: number
): WorldCoordinate {
  return {
    x: pixelX - Math.floor(imageWidth / 2),
    z: pixelY - Math.floor(imageHeight / 2)
  }
}

export function worldToPixel(
  worldX: number,
  worldZ: number,
  imageWidth: number,
  imageHeight: number
): PixelCoordinate {
  return {
    x: worldX + Math.floor(imageWidth / 2),
    y: worldZ + Math.floor(imageHeight / 2)
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
