import { Subregion, Region } from '../types'
import { isPointInPolygon } from './polygonUtils'
import { generateVillageName } from './nameGenerator'

export interface VillageData {
  x: number
  z: number
  details: string
  type: string
}

export function parseVillageCSV(csvContent: string): VillageData[] {
  const lines = csvContent.split('\n')
  const villages: VillageData[] = []
  
  // Skip header lines and find the data start
  let dataStartIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('seed;structure;x;z;details')) {
      dataStartIndex = i + 1
      break
    }
  }
  
  // Parse village data
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const parts = line.split(';')
    if (parts.length >= 5) {
      const [seed, structure, x, z, details] = parts
      villages.push({
        x: parseInt(x),
        z: parseInt(z),
        details: details,
        type: structure
      })
    }
  }
  
  return villages
}

export function findParentRegion(village: VillageData, regions: Region[]): Region | null {
  // Find the first region that contains this village
  for (const region of regions) {
    if (region.points.length >= 3 && isPointInPolygon({ x: village.x, z: village.z }, region.points)) {
      return region
    }
  }
  return null
}

export function createVillageSubregion(village: VillageData, index: number, parentRegionId?: string): Subregion {
  const generatedName = generateVillageName()
  
  return {
    id: `village_${index}`,
    name: generatedName,
    x: village.x,
    z: village.z,
    radius: 64, // Default village radius
    type: 'village',
    details: village.details, // Keep original details for reference
    minY: 0,
    maxY: 255,
    parentRegionId
  }
}

export function generateSubregionYAML(subregion: Subregion, parentRegionName: string): string {
  const subregionName = `${parentRegionName}_${subregion.name.toLowerCase().replace(/\s+/g, '_')}`
  
  return `  ${subregionName}:
    type: cuboid
    min-y: ${subregion.minY}
    max-y: ${subregion.maxY}
    priority: 0
    parent: ${parentRegionName}
    flags: {greeting-title: Welcome to ${subregion.name} village, farewell-title: Leaving ${subregion.name} village., passthrough: allow}
    min: {x: ${subregion.x - subregion.radius}, y: ${subregion.minY}, z: ${subregion.z - subregion.radius}}
    max: {x: ${subregion.x + subregion.radius}, y: ${subregion.maxY}, z: ${subregion.z + subregion.radius}}`
}
