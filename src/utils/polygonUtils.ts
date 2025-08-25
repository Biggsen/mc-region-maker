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

export function generateRegionYAML(region: Region, includeVillages: boolean = true, randomMobSpawn: boolean = false): string {
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
