export type Region = {
  id: string
  name: string
  points: { x: number; z: number }[]
  minY: number
  maxY: number
  subregions?: Subregion[]
}

export type Subregion = {
  id: string
  name: string
  x: number
  z: number
  radius: number
  type: 'village' | 'structure'
  details?: string
  minY: number
  maxY: number
  parentRegionId?: string
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
  originSelected: boolean
  originOffset: { x: number; y: number } | null
}

export type EditMode = {
  isEditing: boolean
  editingRegionId: string | null
  draggingPointIndex: number | null
}

export type HighlightMode = {
  highlightAll: boolean
  showVillages: boolean
}
