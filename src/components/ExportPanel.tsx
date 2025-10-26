import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { exportRegionsYAML } from '../utils/exportUtils'
import { ExportDialog } from './ExportDialog'

export function ExportPanel() {
  const { regions, spawn, worldType } = useAppContext()
  const [showExportDialog, setShowExportDialog] = useState(false)


  const handleExportYAML = () => {
    setShowExportDialog(true)
  }


  const handleExportYAMLWithOptions = (includeVillages: boolean, randomMobSpawn: boolean, includeHeartRegions: boolean, includeSpawnRegion: boolean) => {
    const spawnData = spawn.spawnState.coordinates ? {
      x: spawn.spawnState.coordinates.x,
      z: spawn.spawnState.coordinates.z,
      radius: spawn.spawnState.radius
    } : null
    // Force spawn region to false for nether since it doesn't exist
    const finalIncludeSpawnRegion = worldType.worldType === 'nether' ? false : includeSpawnRegion
    exportRegionsYAML(regions.regions, includeVillages, randomMobSpawn, includeHeartRegions, finalIncludeSpawnRegion, spawnData, worldType.worldType)
  }




  const computedHasVillages = regions.regions.some(region => region.subregions && region.subregions.length > 0)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
      
      <div className="space-y-4">
        
        <div className="space-y-2">
          <button
            onClick={handleExportYAML}
            disabled={regions.regions.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Export YAML
          </button>

        </div>





       </div>

       <ExportDialog
         isOpen={showExportDialog}
         onClose={() => setShowExportDialog(false)}
         onExport={handleExportYAMLWithOptions}
         hasVillages={computedHasVillages}
         hasSpawn={!!spawn.spawnState.coordinates}
         worldType={worldType.worldType}
       />
     </div>
   )
 }
