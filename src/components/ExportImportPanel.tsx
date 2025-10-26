import React, { useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { exportRegionsYAML, importMapData, loadImageFromSrc, loadImageFromBase64 } from '../utils/exportUtils'
import { ExportDialog } from './ExportDialog'

export function ExportImportPanel() {
  const { regions, mapState, worldName, spawn, worldType } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [importRegionsOnly, setImportRegionsOnly] = useState(false)


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


  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)

    try {
      const importData = await importMapData(file)
      
      if (importRegionsOnly) {
        // Import only regions, ignore all other data
        regions.replaceRegions(importData.regions)
        regions.setSelectedRegionId(null)
        console.log('Imported regions only from map export')
      } else {
        // Import everything (original behavior)
        // Load the image if it exists
        if ('imageData' in importData && importData.imageData) {
          // New format with embedded image data
          try {
            const image = await loadImageFromBase64(importData.imageData)
            mapState.setImage(image)
            console.log('Loaded embedded image from complete map export')
          } catch (error) {
            console.warn('Failed to load embedded image, continuing without image')
          }
        } else if (importData.mapState.imageSrc) {
          // Legacy format with image source URL
          try {
            const image = await loadImageFromSrc(importData.mapState.imageSrc)
            mapState.setImage(image)
          } catch (error) {
            console.warn('Failed to load image from import, continuing without image')
          }
        }

        // Update map state
        mapState.setScale(importData.mapState.scale)
        mapState.setOffset(importData.mapState.offsetX, importData.mapState.offsetY)
        mapState.setOriginSelected(importData.mapState.originSelected)
        if (importData.mapState.originOffset) {
          mapState.setOriginOffset(importData.mapState.originOffset)
        }

        // Replace all regions
        regions.replaceRegions(importData.regions)
        regions.setSelectedRegionId(null)

        // Update world name if it exists in import data
        if (importData.worldName) {
          worldName.updateWorldName(importData.worldName)
        }

        // Update world type if it exists in import data
        if (importData.worldType) {
          worldType.setWorldType(importData.worldType)
        }

        // Update spawn coordinates if they exist in import data
        if (importData.spawnCoordinates) {
          spawn.setSpawnCoordinates(importData.spawnCoordinates)
          // Update radius if it exists in import data
          if (importData.spawnCoordinates.radius) {
            spawn.setSpawnRadius(importData.spawnCoordinates.radius)
          }
        }
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={importRegionsOnly}
              onChange={(e) => setImportRegionsOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Import regions only</span>
          </label>
          <div className="text-xs text-gray-500">
            {importRegionsOnly 
              ? 'Will only import regions, ignoring map state, world name, spawn, and image data'
              : 'Supports complete map exports (with embedded image)'
            }
          </div>
        </div>

        <button
          onClick={triggerFileInput}
          disabled={isImporting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isImporting ? 'Importing...' : (importRegionsOnly ? 'Import Regions Only' : 'Import')}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />


        {importError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
            {importError}
          </div>
        )}

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
