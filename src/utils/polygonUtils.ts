import { Region } from '../types'
import { generateSubregionYAML } from './villageUtils'

export function generateRegionYAML(region: Region): string {
  const points = region.points.map(point => `      - {x: ${Math.round(point.x)}, z: ${Math.round(point.z)}}`).join('\n')
  
  let yaml = `  ${region.name}:
    type: poly2d
    min-y: ${region.minY}
    max-y: ${region.maxY}
    priority: 0
    flags: {greeting: Welcome to ${region.name}!, farewell: Leaving ${region.name}., passthrough: allow}
    points:
${points}`

  // Add subregions if they exist
  if (region.subregions && region.subregions.length > 0) {
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
