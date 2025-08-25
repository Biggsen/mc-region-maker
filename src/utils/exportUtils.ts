import { Region, MapState } from '../types'

export interface ExportData {
  version: string
  regions: Region[]
  mapState: Omit<MapState, 'image'> & { imageSrc?: string }
  exportDate: string
}

const CURRENT_VERSION = '1.0.0'

// Export regions and map state to JSON file
export function exportMapData(regions: Region[], mapState: MapState): void {
  const exportData: ExportData = {
    version: CURRENT_VERSION,
    regions,
    mapState: {
      scale: mapState.scale,
      offsetX: mapState.offsetX,
      offsetY: mapState.offsetY,
      isDragging: mapState.isDragging,
      lastMousePos: mapState.lastMousePos,
      originSelected: mapState.originSelected,
      originOffset: mapState.originOffset,
      imageSrc: mapState.image?.src || undefined
    },
    exportDate: new Date().toISOString()
  }

  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `mc-region-map-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(link.href)
}

// Export all regions to YAML file in WorldGuard format
export function exportRegionsYAML(regions: Region[]): void {
  if (regions.length === 0) {
    alert('No regions to export')
    return
  }

  let yamlContent = 'regions:\n'
  
  regions.forEach(region => {
    const points = region.points.map(point => 
      `    - {x: ${Math.round(point.x)}, z: ${Math.round(point.z)}}`
    ).join('\n')
    
    yamlContent += `  ${region.name}:\n`
    yamlContent += `    type: poly2d\n`
    yamlContent += `    min-y: ${region.minY}\n`
    yamlContent += `    max-y: ${region.maxY}\n`
    yamlContent += `    priority: 0\n`
    yamlContent += `    flags: {greeting: Welcome to ${region.name}!, farewell: Leaving ${region.name}.}\n`
    yamlContent += `    points:\n`
    yamlContent += `${points}\n`
  })

  const dataBlob = new Blob([yamlContent], { type: 'text/yaml' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `regions.yml`
  link.click()
  
  URL.revokeObjectURL(link.href)
}

// Import map data from JSON file
export function importMapData(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const data: ExportData = JSON.parse(content)
        
        // Validate the imported data
        if (!data.version || !data.regions || !data.mapState) {
          throw new Error('Invalid file format')
        }
        
        resolve(data)
      } catch (error) {
        reject(new Error('Failed to parse import file'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read import file'))
    }
    
    reader.readAsText(file)
  })
}

// Load image from source URL (for imports)
export function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

// Validate imported data structure
export function validateImportData(data: any): data is ExportData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.version === 'string' &&
    Array.isArray(data.regions) &&
    typeof data.mapState === 'object' &&
    data.mapState !== null &&
    typeof data.exportDate === 'string'
  )
}
