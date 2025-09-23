import { Subregion, Region } from '../types'
import { isPointInPolygon } from './polygonUtils'
import { generateVillageNameByWorldType } from './nameGenerator'

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

export function createVillageSubregion(village: VillageData, index: number, parentRegionId?: string, existingNames: Set<string> = new Set(), worldType: 'overworld' | 'nether' = 'overworld'): Subregion {
  let generatedName = generateVillageNameByWorldType(worldType)
  let attempts = 0
  const maxAttempts = 100 // Prevent infinite loops
  
  // Keep generating names until we find a unique one
  while (existingNames.has(generatedName) && attempts < maxAttempts) {
    generatedName = generateVillageNameByWorldType(worldType)
    attempts++
  }
  
  // If we still have a duplicate after max attempts, append a number
  if (existingNames.has(generatedName)) {
    let counter = 1
    let baseName = generatedName
    while (existingNames.has(generatedName) && counter < 1000) {
      generatedName = `${baseName} ${counter}`
      counter++
    }
  }
  
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

export function generateSubregionYAML(subregion: Subregion, parentRegionName: string, worldType?: 'overworld' | 'nether'): string {
  const subregionName = subregion.name.toLowerCase().replace(/\s+/g, '_')
  
  // Villages always use "Welcome to" regardless of world type since villages don't exist in the nether
  const greetingText = 'Welcome to'
  
  return `  ${subregionName}:
    type: cuboid
    min-y: ${subregion.minY}
    max-y: ${subregion.maxY}
    priority: 10
    parent: ${parentRegionName}
    flags: {greeting-title: ${greetingText} ${subregion.name} village, farewell-title: Leaving ${subregion.name} village., passthrough: allow}
    min: {x: ${subregion.x - subregion.radius}, y: ${subregion.minY}, z: ${subregion.z - subregion.radius}}
    max: {x: ${subregion.x + subregion.radius}, y: ${subregion.maxY}, z: ${subregion.z + subregion.radius}}`
}
