import { Region, ChallengeLevel } from '../types'
import { generateSubregionYAML } from './villageUtils'

// Map challenge levels to their color codes and descriptions
function getChallengeLevelColor(challengeLevel: ChallengeLevel): string {
  switch (challengeLevel) {
    case 'Vanilla':
      return '§aA safe haven from stronger mobs'
    case 'Bronze':
      return '§eMobs here are a little bit stronger'
    case 'Silver':
      return '§6Mobs put up a decent fight here'
    case 'Gold':
      return '§cMobs here hit hard — be ready'
    case 'Platinum':
      return '§4Mobs here are extremely dangerous'
    default:
      return '§aMobs here fight as usual'
  }
}

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

export function generateRegionYAML(region: Region, includeVillages: boolean = true, randomMobSpawn: boolean = false, includeHeartRegions: boolean = true, worldType?: 'overworld' | 'nether'): string {
  const points = region.points.map(point => `      - {x: ${Math.round(point.x)}, z: ${Math.round(point.z)}}`).join('\n')
  
  // Check if this is a main region (not spawn, hearts, or villages)
  const isMainRegion = !region.name.toLowerCase().includes('spawn') && 
                      !region.name.toLowerCase().includes('heart') && 
                      !region.name.toLowerCase().includes('village')
  
  // Determine greeting text based on world type
  const greetingText = worldType === 'nether' ? 'You descend into' : 'Welcome to'
  
  // Generate flags based on region type
  let flags: string
  if (isMainRegion && region.challengeLevel) {
    // Main regions with challenge levels get the new multi-line format
    const challengeColor = getChallengeLevelColor(region.challengeLevel)
    
    if (randomMobSpawn) {
      const randomMobs = generateRandomMobList()
      flags = `    greeting-title: |-\n      §f${greetingText} ${region.name}\n      ${challengeColor}\n    farewell-title: |-\n      §fLeaving ${region.name}\n      §f\n    passthrough: allow\n    deny-spawn: [${randomMobs.join(',')}]`
    } else {
      flags = `    greeting-title: |-\n      §f${greetingText} ${region.name}\n      ${challengeColor}\n    farewell-title: |-\n      §fLeaving ${region.name}\n      §f\n    passthrough: allow`
    }
  } else {
    // Other regions (spawn, hearts, villages) keep the old format
    flags = `{greeting-title: ${greetingText} ${region.name}, farewell-title: Leaving ${region.name}., passthrough: allow}`
    if (randomMobSpawn) {
      const randomMobs = generateRandomMobList()
      flags = `{greeting-title: ${greetingText} ${region.name}, farewell-title: Leaving ${region.name}., passthrough: allow, deny-spawn: [${randomMobs.join(',')}]}`
    }
  }

  // Convert region name to snake_case for nether regions
  const regionNameForYAML = worldType === 'nether' 
    ? region.name.toLowerCase().replace(/\s+/g, '_')
    : region.name

  let yaml = `  ${regionNameForYAML}:
    type: poly2d
    min-y: ${region.minY}
    max-y: ${region.maxY}
    priority: 0
    flags:
${isMainRegion && region.challengeLevel ? '  ' + flags.replace(/\n/g, '\n  ') : '      ' + flags}
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
      generateSubregionYAML(subregion, region.name, worldType)
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

/**
 * Move all points in a region by an offset
 * @param points Array of region points
 * @param offsetX Offset to apply to x coordinate
 * @param offsetZ Offset to apply to z coordinate
 * @returns New array of points with offsets applied
 */
export function moveRegionPoints(
  points: { x: number; z: number }[],
  offsetX: number,
  offsetZ: number
): { x: number; z: number }[] {
  if (points.length === 0) return points
  return points.map(p => ({ x: p.x + offsetX, z: p.z + offsetZ }))
}

/**
 * Move a region to a new center position
 * @param points Array of region points
 * @param newCenterX New center X coordinate
 * @param newCenterZ New center Z coordinate
 * @returns New array of points centered at the new position
 */
export function moveRegionToCenter(
  points: { x: number; z: number }[],
  newCenterX: number,
  newCenterZ: number
): { x: number; z: number }[] {
  if (points.length === 0) return points
  
  // Calculate current center
  const currentCenter = calculatePolygonCenter(points)
  
  // Calculate offset needed
  const offsetX = newCenterX - currentCenter.x
  const offsetZ = newCenterZ - currentCenter.z
  
  // Apply offset to all points
  return moveRegionPoints(points, offsetX, offsetZ)
}

/**
 * Push points away from a center within a radius by a strength factor.
 * Strength is the maximum displacement at the center; it eases to 0 at radius.
 */
export function warpRegionPoints(
  points: { x: number; z: number }[],
  centerX: number,
  centerZ: number,
  radius: number,
  strength: number
): { x: number; z: number }[] {
  if (points.length === 0 || radius <= 0 || strength === 0) return points
  const radiusSq = radius * radius
  return points.map(p => {
    const dx = p.x - centerX
    const dz = p.z - centerZ
    const distSq = dx * dx + dz * dz
    if (distSq >= radiusSq) return p
    const dist = Math.sqrt(Math.max(distSq, 1e-8))
    const falloff = 1 - dist / radius
    const displacement = strength * falloff
    const ux = dx / dist
    const uz = dz / dist
    return { x: p.x + ux * displacement, z: p.z + uz * displacement }
  })
}

/**
 * Insert a midpoint between every consecutive pair of polygon vertices.
 */
export function doublePolygonVertices(
  points: { x: number; z: number }[]
): { x: number; z: number }[] {
  if (points.length < 2) return points
  const result: { x: number; z: number }[] = []
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    result.push(a)
    result.push({ x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 })
  }
  return result
}