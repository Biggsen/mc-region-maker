import { Region, MapState } from '../types'
import { generateRegionYAML } from './polygonUtils'

export interface ExportData {
  version: string
  worldName: string
  regions: Region[]
  mapState: Omit<MapState, 'image'> & { imageSrc?: string }
  spawnCoordinates?: { x: number; z: number; radius?: number } | null
  worldType?: 'overworld' | 'nether'
  exportDate: string
}

export interface MapExportData {
  version: string
  worldName: string
  regions: Region[]
  mapState: Omit<MapState, 'image'> & { imageSrc?: string }
  spawnCoordinates?: { x: number; z: number; radius?: number } | null
  worldType?: 'overworld' | 'nether'
  exportDate: string
  imageData?: string // Base64 encoded image data
  imageFilename?: string
}

const CURRENT_VERSION = '1.0.0'

// Export regions and map state to JSON file
export function exportMapData(regions: Region[], mapState: MapState, worldName: string, spawnCoordinates?: { x: number; z: number; radius?: number } | null, worldType?: 'overworld' | 'nether'): void {
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
    worldType,
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

// Export complete map with embedded image data
export async function exportCompleteMap(regions: Region[], mapState: MapState, worldName: string, spawnCoordinates?: { x: number; z: number; radius?: number } | null, worldType?: 'overworld' | 'nether'): Promise<void> {
  if (!mapState.image) {
    alert('No map image loaded. Please load an image first.')
    return
  }

  try {
    let imageData: string | null = null
    
    // Try to convert image to base64, but handle CORS issues gracefully
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      canvas.width = mapState.image.width
      canvas.height = mapState.image.height
      ctx.drawImage(mapState.image, 0, 0)
      
      imageData = canvas.toDataURL('image/png')
    } catch (corsError) {
      console.warn('Cannot export image data due to CORS restrictions:', corsError)
      
      // For cross-origin images, we'll include the image source URL instead
      // The user will need to manually save the image if they want a complete export
      const userConfirmed = confirm(
        'The map image is from a different origin and cannot be embedded in the export file.\n\n' +
        'The export will include the image URL instead. You can manually save the image separately if needed.\n\n' +
        'Continue with export?'
      )
      
      if (!userConfirmed) {
        return
      }
    }
    
    const exportData: MapExportData = {
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
      worldType,
      exportDate: new Date().toISOString(),
      imageData: imageData || undefined,
      imageFilename: imageData ? `map-image-${new Date().toISOString().split('T')[0]}.png` : undefined
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    const worldNameSlug = worldName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    link.download = `mc-complete-map-${worldNameSlug}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(link.href)
    
    if (imageData) {
      alert('Complete map exported successfully! This file includes both the regions and the map image.')
    } else {
      alert('Map data exported successfully! The image could not be embedded due to security restrictions, but the image URL is included in the export file.')
    }
  } catch (error) {
    console.error('Error exporting complete map:', error)
    alert('Failed to export complete map. Please try again.')
  }
}

// Export all regions to YAML file in WorldGuard format
export function exportRegionsYAML(
  regions: Region[], 
  includeVillages: boolean = true, 
  randomMobSpawn: boolean = false, 
  includeHeartRegions: boolean = true,
  includeSpawnRegion: boolean = false,
  spawnCoordinates?: { x: number; z: number; radius?: number } | null
): void {
  if (regions.length === 0 && !includeSpawnRegion) {
    alert('No regions to export')
    return
  }

  let yamlContent = 'regions:\n'
  
  // Add spawn region if requested and coordinates exist
  if (includeSpawnRegion && spawnCoordinates && spawnCoordinates.radius) {
    const spawnRegion = generateSpawnRegionYAML(spawnCoordinates)
    yamlContent += spawnRegion
    if (regions.length > 0) {
      yamlContent += '\n'
    }
  }
  
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

// Generate spawn region YAML
function generateSpawnRegionYAML(spawnCoordinates: { x: number; z: number; radius: number }): string {
  const { x, z, radius } = spawnCoordinates
  
  // Calculate cuboid bounds based on spawn point and radius
  const minX = x - radius
  const maxX = x + radius
  const minZ = z - radius
  const maxZ = z + radius
  
  let yaml = `  spawn:\n`
  yaml += `    min: {x: ${minX}, y: 0, z: ${minZ}}\n`
  yaml += `    max: {x: ${maxX}, y: 255, z: ${maxZ}}\n`
  yaml += `    members: {}\n`
  yaml += `    flags:\n`
  yaml += `      build: deny\n`
  yaml += `      pvp: deny\n`
  yaml += `      mob-spawning: deny\n`
  yaml += `      creeper-explosion: deny\n`
  yaml += `      other-explosion: deny\n`
  yaml += `      tnt: deny\n`
  yaml += `    owners: {}\n`
  yaml += `    type: cuboid\n`
  yaml += `    priority: 10\n`
  
  return yaml
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

    // Generate heart achievement for this region
    const heartKey = `discoverHeartOf${regionKey}`
    yamlContent += `  ${heartKey}:\n`
    yamlContent += `    Goal: Discover the Heart of ${region.name}\n`
    yamlContent += `    Message: You discovered the Heart of ${region.name}\n`
    yamlContent += `    Name: discover_heart_of_${region.name.toLowerCase().replace(/\s+/g, '_')}\n`
    yamlContent += `    DisplayName: Heart Discovery\n`
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
    yamlContent += `        - 'wait: 5'\n`
    yamlContent += `        - 'console_command: aach give discover${region.name.replace(/\s+/g, '')} %player%'\n`
    yamlContent += `        - 'console_command: aach add 1 Custom.regions_discovered %player%'\n`
    yamlContent += `        - 'console_command: aach add 1 Custom.total_discovered %player%'\n`
    yamlContent += `        - 'console_command: cc give virtual RegionCrate 1 %player%'\n`
    eventCount++

    // Generate heart event conditions for this region
    const heartEventKey = `heart_of_${regionKey}_discover_once`
    yamlContent += `  ${heartEventKey}:\n`
    yamlContent += `    type: wgevents_region_enter\n`
    yamlContent += `    conditions:\n`
    yamlContent += `      - '%region% == heart_of_${regionKey}'\n`
    yamlContent += `    one_time: true\n`
    yamlContent += `    actions:\n`
    yamlContent += `      default:\n`
    yamlContent += `        - 'wait: 5'\n`
    yamlContent += `        - 'console_command: aach give discoverHeartOf${region.name.replace(/\s+/g, '')} %player%'\n`
    yamlContent += `        - 'console_command: aach add 1 Custom.hearts_discovered %player%'\n`
    yamlContent += `        - 'console_command: cc give virtual RegionCrate 1 %player%'\n`
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
          yamlContent += `        - 'wait: 5'\n`
          yamlContent += `        - 'console_command: aach give discover${subregion.name.replace(/\s+/g, '')} %player%'\n`
          yamlContent += `        - 'console_command: aach add 1 Custom.villages_discovered %player%'\n`
          yamlContent += `        - 'console_command: aach add 1 Custom.total_discovered %player%'\n`
          yamlContent += `        - 'console_command: cc give virtual VillageCrate 1 %player%'\n`
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
export function importMapData(file: File): Promise<ExportData | MapExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const data: ExportData | MapExportData = JSON.parse(content)
        
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

// Load image from base64 data (for complete map imports)
export function loadImageFromBase64(base64Data: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = base64Data
  })
}

// Load image from source URL (for imports)
export function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    // Set crossOrigin to anonymous to allow canvas export if the server supports CORS
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

// Generate LevelledMobs rules YAML
export function generateLevelledMobsRulesYAML(
  regions: Region[], 
  worldName: string,
  spawnCoordinates?: { x: number; z: number; radius?: number } | null
): void {
  if (regions.length === 0 && !spawnCoordinates) {
    alert('No regions or spawn to generate LevelledMobs rules for')
    return
  }

  let yamlContent = '# LevelledMobs Rules Configuration\n'
  yamlContent += `# Generated for world: ${worldName}\n`
  yamlContent += `# Generated on: ${new Date().toISOString()}\n\n`

  let ruleCount = 0

  // 1. Spawn region rule (if spawn is set)
  if (spawnCoordinates) {
    yamlContent += `# Spawn region rule\n`
    yamlContent += `- custom-rule: 'Disable Leveling in Spawn Region'\n`
    yamlContent += `  is-enabled: true\n`
    yamlContent += `  use-preset: challenge-vanilla\n`
    yamlContent += `  conditions:\n`
    yamlContent += `    worlds: 'world'\n`
    yamlContent += `    worldguard-regions: 'spawn'\n\n`
    ruleCount++
  }

  // 2. Heart regions rule (all heart regions with vanilla level)
  const heartRegions = regions.map(region => `heart_of_${region.name.toLowerCase().replace(/\s+/g, '_')}`)
  if (heartRegions.length > 0) {
    yamlContent += `# Heart regions rule\n`
    yamlContent += `- custom-rule: 'Disable Leveling in Heart Regions'\n`
    yamlContent += `  is-enabled: true\n`
    yamlContent += `  use-preset: challenge-vanilla\n`
    yamlContent += `  conditions:\n`
    yamlContent += `    worlds: 'world'\n`
    yamlContent += `    worldguard-regions:\n`
    heartRegions.forEach(region => {
      yamlContent += `      - '${region}'\n`
    })
    yamlContent += `\n`
    ruleCount++
  }

  // 3. Village regions rule (all villages with vanilla level)
  const villageRegions: string[] = []
  regions.forEach(region => {
    if (region.subregions) {
      region.subregions.forEach(subregion => {
        if (subregion.type === 'village') {
          villageRegions.push(subregion.name.toLowerCase().replace(/\s+/g, '_'))
        }
      })
    }
  })
  
  if (villageRegions.length > 0) {
    yamlContent += `# Village regions rule\n`
    yamlContent += `- custom-rule: 'Disable Leveling in Village Regions'\n`
    yamlContent += `  is-enabled: true\n`
    yamlContent += `  use-preset: challenge-vanilla\n`
    yamlContent += `  conditions:\n`
    yamlContent += `    worlds: 'world'\n`
    yamlContent += `    worldguard-regions:\n`
    villageRegions.forEach(region => {
      yamlContent += `      - '${region}'\n`
    })
    yamlContent += `\n`
    ruleCount++
  }

  // 4. Individual region rules based on their challenge levels
  yamlContent += `# Region-specific challenge presets\n`
  regions.forEach(region => {
    if (region.challengeLevel) {
      const presetName = `challenge-${region.challengeLevel.toLowerCase()}`
      const regionName = region.name.toLowerCase().replace(/\s+/g, '_')
      
      yamlContent += `- custom-rule: '${region.name} - ${region.challengeLevel} Challenge'\n`
      yamlContent += `  is-enabled: true\n`
      yamlContent += `  use-preset: ${presetName}\n`
      yamlContent += `  conditions:\n`
      yamlContent += `    worlds: 'world'\n`
      yamlContent += `    worldguard-regions: '${regionName}'\n\n`
      ruleCount++
    }
  })

  const dataBlob = new Blob([yamlContent], { type: 'text/yaml' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${worldName}-rules.yml`
  link.click()
  
  URL.revokeObjectURL(link.href)
  
  alert(`Generated ${ruleCount} LevelledMobs rules`)
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
