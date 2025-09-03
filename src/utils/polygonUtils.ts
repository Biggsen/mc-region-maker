import { Region } from '../types'
import { generateSubregionYAML } from './villageUtils'

// Mob list for random spawn generation
const MOB_LIST = [
  'ZOMBIE', 'ZOMBIE_VILLAGER', 'HUSK', 'DROWNED', 'SKELETON', 'STRAY', 'BOGGED', 
  'CREEPER', 'SPIDER', 'CAVE_SPIDER', 'ENDERMAN', 'WITCH', 'SLIME', 'PHANTOM', 
  'SILVERFISH', 'PILLAGER', 'VINDICATOR', 'EVOKER', 'VEX', 'RAVAGER', 'ILLUSIONER', 
  'GUARDIAN', 'ELDER_GUARDIAN', 'DOLPHIN', 'SQUID', 'GLOW_SQUID', 'COD', 'SALMON', 
  'TROPICAL_FISH', 'PUFFERFISH', 'AXOLOTL', 'TURTLE', 'VILLAGER', 'WANDERING_TRADER', 
  'IRON_GOLEM', 'SNOW_GOLEM', 'ALLAY', 'SHEEP', 'COW', 'MUSHROOM_COW', 'PIG', 
  'CHICKEN', 'RABBIT', 'HORSE', 'DONKEY', 'MULE', 'LLAMA', 'TRADER_LLAMA', 'CAMEL', 
  'CAT', 'OCELOT', 'WOLF', 'FOX', 'PANDA', 'POLAR_BEAR', 'GOAT', 'SNIFFER', 
  'ARMADILLO', 'PARROT', 'BAT', 'BEE', 'FROG', 'TADPOLE'
]

// Generate a random list of mobs for deny-spawn
function generateRandomMobList(): string[] {
  const count = Math.floor(Math.random() * 8) + 1 // 1 to 8 mobs
  const shuffled = [...MOB_LIST].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function generateRegionYAML(region: Region, includeVillages: boolean = true, randomMobSpawn: boolean = false, includeHeartRegions: boolean = true): string {
  const points = region.points.map(point => `      - {x: ${Math.round(point.x)}, z: ${Math.round(point.z)}}`).join('\n')
  
  // Generate deny-spawn flag if randomMobSpawn is enabled
  let flags = `{greeting-title: Welcome to ${region.name}, farewell-title: Leaving ${region.name}., passthrough: allow}`
  if (randomMobSpawn) {
    const randomMobs = generateRandomMobList()
    flags = `{greeting-title: Welcome to ${region.name}, farewell-title: Leaving ${region.name}., passthrough: allow, deny-spawn: [${randomMobs.join(',')}]}`
  }

  let yaml = `  ${region.name}:
    type: poly2d
    min-y: ${region.minY}
    max-y: ${region.maxY}
    priority: 0
    flags: ${flags}
    points:
${points}`

  // Add heart_of_[region] subregion for each main region if enabled
  if (includeHeartRegions) {
    const regionCenter = calculateRegionCenter(region)
    const heartRegionName = `heart_of_${region.name.toLowerCase().replace(/\s+/g, '_')}`
    const heartSize = 7 // 7x7 size as requested
    
    yaml += `\n\n  ${heartRegionName}:
    type: cuboid
    min: {x: ${Math.round(regionCenter.x - Math.floor(heartSize / 2))}, y: ${region.minY}, z: ${Math.round(regionCenter.z - Math.floor(heartSize / 2))}}
    max: {x: ${Math.round(regionCenter.x + Math.floor(heartSize / 2))}, y: ${region.maxY}, z: ${Math.round(regionCenter.z + Math.floor(heartSize / 2))}}
    members: {}
    owners: {}
    flags: {greeting-title: Heart of ${region.name}, build: deny, interact: allow, creeper-explosion: deny, other-explosion: deny, tnt: deny}
    priority: 10`
  }

  // Add subregions if they exist and includeVillages is true
  if (includeVillages && region.subregions && region.subregions.length > 0) {
    yaml += '\n\n'
    yaml += region.subregions.map(subregion => 
      generateSubregionYAML(subregion, region.name)
    ).join('\n\n')
  }
  
  return yaml
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isPointInPolygon(
  point: { x: number; z: number },
  polygon: { x: number; z: number }[]
): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (
      ((polygon[i].z > point.z) !== (polygon[j].z > point.z)) &&
      (point.x < (polygon[j].x - polygon[i].x) * (point.z - polygon[i].z) / (polygon[j].z - polygon[i].z) + polygon[i].x)
    ) {
      inside = !inside
    }
  }
  return inside
}

/**
 * Calculate the area of a polygon using the shoelace formula
 * @param points Array of polygon points with x and z coordinates
 * @returns Area in square blocks (since each block = 1 unit)
 */
export function calculatePolygonArea(points: { x: number; z: number }[]): number {
  if (points.length < 3) return 0
  
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].z
    area -= points[j].x * points[i].z
  }
  
  return Math.abs(area) / 2
}

/**
 * Format area for display with appropriate units
 * @param areaInBlocks Area in square blocks
 * @returns Formatted string with area in hectares when available
 */
export function formatArea(areaInBlocks: number): string {
  const squareMeters = areaInBlocks // 1 block ≈ 1 square meter in Minecraft
  
  if (squareMeters >= 10000) {
    const hectares = squareMeters / 10000
    return `${Math.round(hectares)} ha`
  } else {
    return `${Math.round(areaInBlocks).toLocaleString()} blocks²`
  }
}

/**
 * Calculate the center point (centroid) of a polygon
 * @param points Array of polygon points with x and z coordinates
 * @returns Center point coordinates {x, z}
 */
export function calculatePolygonCenter(points: { x: number; z: number }[]): { x: number; z: number } {
  if (points.length === 0) {
    return { x: 0, z: 0 }
  }
  
  if (points.length === 1) {
    return { x: points[0].x, z: points[0].z }
  }
  
  let sumX = 0
  let sumZ = 0
  
  for (const point of points) {
    sumX += point.x
    sumZ += point.z
  }
  
  return {
    x: sumX / points.length,
    z: sumZ / points.length
  }
}

/**
 * Calculate the center point of a region
 * @param region The region to calculate the center for
 * @returns Center point coordinates {x, z}
 */
export function calculateRegionCenter(region: Region): { x: number; z: number } {
  // Use custom center point if set, otherwise calculate from polygon
  if (region.centerPoint) {
    return region.centerPoint
  }
  return calculatePolygonCenter(region.points)
}
