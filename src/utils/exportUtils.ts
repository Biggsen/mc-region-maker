import { Region, MapState } from '../types'
import { generateRegionYAML } from './polygonUtils'

export interface ExportData {
  version: string
  worldName: string
  regions: Region[]
  mapState: Omit<MapState, 'image'> & { imageSrc?: string }
  spawnCoordinates?: { x: number; z: number; radius?: number } | null
  exportDate: string
}

const CURRENT_VERSION = '1.0.0'

// Export regions and map state to JSON file
export function exportMapData(regions: Region[], mapState: MapState, worldName: string, spawnCoordinates?: { x: number; z: number; radius?: number } | null): void {
  const exportData: ExportData = {
    version: CURRENT_VERSION,
    worldName,
    regions,
    mapState: {
      scale: mapState.scale,
      offsetX: mapState.offsetX,
      offsetY: mapState.offsetY,
      isDragging: mapState.isDragging,
      lastMousePos: mapState.lastMousePos,
      originSelected: mapState.originSelected,
      originOffset: mapState.originOffset,
      imageSrc: mapState.image?.imageSrc || undefined
    },
    spawnCoordinates,
    exportDate: new Date().toISOString()
  }

  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  const worldNameSlug = worldName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  link.download = `mc-region-map-${worldNameSlug}-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(link.href)
}

// Export all regions to YAML file in WorldGuard format
export function exportRegionsYAML(regions: Region[], includeVillages: boolean = true, randomMobSpawn: boolean = false, includeHeartRegions: boolean = true): void {
  if (regions.length === 0) {
    alert('No regions to export')
    return
  }

  let yamlContent = 'regions:\n'
  
  regions.forEach((region, index) => {
    yamlContent += generateRegionYAML(region, includeVillages, randomMobSpawn, includeHeartRegions)
    // Add a blank line between regions (except after the last one)
    if (index < regions.length - 1) {
      yamlContent += '\n'
    }
  })

  const dataBlob = new Blob([yamlContent], { type: 'text/yaml' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `regions.yml`
  link.click()
  
  URL.revokeObjectURL(link.href)
}

// Generate achievements YAML for regions and villages
export function generateAchievementsYAML(regions: Region[]): void {
  if (regions.length === 0) {
    alert('No regions to generate achievements for')
    return
  }

  let yamlContent = 'Commands:\n'
  let achievementCount = 0

  // Generate achievements for each region
  regions.forEach(region => {
    const regionKey = region.name.replace(/\s+/g, '')
    const achievementKey = `discover${regionKey}`
    
    yamlContent += `  ${achievementKey}:\n`
    yamlContent += `    Goal: Discover ${region.name} Region\n`
    yamlContent += `    Message: You discovered the region of ${region.name}\n`
    yamlContent += `    Name: discover_${region.name.toLowerCase().replace(/\s+/g, '_')}\n`
    yamlContent += `    DisplayName: Region Discovery\n`
    yamlContent += `    Type: normal\n`
    achievementCount++

    // Generate achievements for villages in this region
    if (region.subregions && region.subregions.length > 0) {
      region.subregions.forEach(subregion => {
        if (subregion.type === 'village') {
          const villageKey = subregion.name.replace(/\s+/g, '')
          const villageAchievementKey = `discover${villageKey}`
          
          yamlContent += `  ${villageAchievementKey}:\n`
          yamlContent += `    Goal: Discover ${subregion.name} Village\n`
          yamlContent += `    Message: You discovered the village of ${subregion.name}\n`
          yamlContent += `    Name: discover_${subregion.name.toLowerCase().replace(/\s+/g, '_')}\n`
          yamlContent += `    DisplayName: Village Discovery\n`
          yamlContent += `    Type: normal\n`
          achievementCount++
        }
      })
    }
  })

  const dataBlob = new Blob([yamlContent], { type: 'text/yaml' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `achievements.yml`
  link.click()
  
  URL.revokeObjectURL(link.href)
  
  alert(`Generated ${achievementCount} achievements`)
}

// Generate event conditions YAML for regions and villages
export function generateEventConditionsYAML(regions: Region[]): void {
  if (regions.length === 0) {
    alert('No regions to generate event conditions for')
    return
  }

  let yamlContent = 'Events:\n'
  let eventCount = 0

  // Generate event conditions for each region
  regions.forEach(region => {
    const regionKey = region.name.toLowerCase().replace(/\s+/g, '_')
    const eventKey = `${regionKey}_discover_once`
    
    yamlContent += `  ${eventKey}:\n`
    yamlContent += `    type: wgevents_region_enter\n`
    yamlContent += `    conditions:\n`
    yamlContent += `      - '%region% == ${region.name.toLowerCase().replace(/\s+/g, '_')}'\n`
    yamlContent += `    one_time: true\n`
    yamlContent += `    actions:\n`
    yamlContent += `      default:\n`
    yamlContent += `        - 'console_command: aach give discover${region.name.replace(/\s+/g, '')} %player%'\n`
    yamlContent += `        - 'console_command: aach add 1 Custom.regions_discovered %player%'\n`
    yamlContent += `        - 'console_command: cc give virtual RegionCrate 1 %player%'\n`
    yamlContent += `      one_time:\n`
    eventCount++

    // Generate event conditions for villages in this region
    if (region.subregions && region.subregions.length > 0) {
      region.subregions.forEach(subregion => {
        if (subregion.type === 'village') {
          const villageKey = subregion.name.toLowerCase().replace(/\s+/g, '_')
          const villageEventKey = `${villageKey}_discover_once`
          
          yamlContent += `  ${villageEventKey}:\n`
          yamlContent += `    type: wgevents_region_enter\n`
          yamlContent += `    conditions:\n`
          yamlContent += `      - '%region% == ${subregion.name.toLowerCase().replace(/\s+/g, '_')}'\n`
          yamlContent += `    one_time: true\n`
          yamlContent += `    actions:\n`
          yamlContent += `      default:\n`
          yamlContent += `        - 'console_command: aach give discover${subregion.name.replace(/\s+/g, '')} %player%'\n`
          yamlContent += `        - 'console_command: aach add 1 Custom.villages_discovered %player%'\n`
          yamlContent += `        - 'console_command: cc give virtual VillageCrate 1 %player%'\n`
          yamlContent += `      one_time:\n`
          eventCount++
        }
      })
    }
  })

  const dataBlob = new Blob([yamlContent], { type: 'text/yaml' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `event_conditions.yml`
  link.click()
  
  URL.revokeObjectURL(link.href)
  
  alert(`Generated ${eventCount} event conditions`)
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
        
        // Handle legacy imports that don't have worldName
        if (!data.worldName) {
          data.worldName = 'world'
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
