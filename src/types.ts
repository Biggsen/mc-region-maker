export type Region = {
  id: string
  name: string
  points: { x: number; z: number }[]
  minY: number
  maxY: number
}

export type WorldCoordinate = {
  x: number
  z: number
}

export type PixelCoordinate = {
  x: number
  y: number
}

export type MapState = {
  image: HTMLImageElement | null
  scale: number
  offsetX: number
  offsetY: number
  isDragging: boolean
  lastMousePos: { x: number; y: number } | null
}
