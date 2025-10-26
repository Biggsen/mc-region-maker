import React, { useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { exportRegionsYAML, importMapData, loadImageFromSrc, loadImageFromBase64, generateAchievementsYAML, generateEventConditionsYAML, generateLevelledMobsRulesYAML } from '../utils/exportUtils'
import { ExportDialog } from './ExportDialog'

export function ExportImportPanel() {
  const { regions, mapState, worldName, spawn, worldType, customMarkers } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const villageFileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isImportingVillages, setIsImportingVillages] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [villageImportError, setVillageImportError] = useState<string | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [hasVillages, setHasVillages] = useState(false)
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

  const handleGenerateAchievements = () => {
    generateAchievementsYAML(regions.regions, worldType.worldType)
  }

  const handleGenerateEventConditions = () => {
    generateEventConditionsYAML(regions.regions, worldType.worldType)
  }

  const handleGenerateLevelledMobsRules = () => {
    const spawnData = spawn.spawnState.coordinates ? {
      x: spawn.spawnState.coordinates.x,
      z: spawn.spawnState.coordinates.z,
      radius: spawn.spawnState.radius
    } : null
    generateLevelledMobsRulesYAML(regions.regions, worldName.worldName, spawnData)
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

  const handleVillageImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if there are existing villages
    const existingVillages = regions.regions.some(region => 
      region.subregions && region.subregions.some(sub => sub.type === 'village')
    )

    if (existingVillages) {
      const confirmed = confirm(
        'You already have villages imported. Importing new villages will replace all existing villages. Continue?'
      )
      if (!confirmed) {
        // Clear the file input
        if (villageFileInputRef.current) {
          villageFileInputRef.current.value = ''
        }
        return
      }
    }

    setIsImportingVillages(true)
    setVillageImportError(null)

    try {
      const content = await file.text()
      const results = regions.importVillagesFromCSV(content)
      
      let message = `Imported ${results.added} villages into regions.`
      if (results.orphaned > 0) {
        message += `\n${results.orphaned} villages were outside all regions and skipped.`
        
        if (results.orphanedVillages && results.orphanedVillages.length > 0) {
          message += '\n\nOrphaned village coordinates:'
          results.orphanedVillages.forEach(village => {
            message += `\n• ${village.type} at (${village.x}, ${village.z}) - ${village.details}`
          })
          
          // Add orphaned villages as markers
          customMarkers.addOrphanedVillageMarkers(results.orphanedVillages)
        }
      }
      
      alert(message)
      setHasVillages(results.added > 0)
      
      // Clear the file input
      if (villageFileInputRef.current) {
        villageFileInputRef.current.value = ''
      }
    } catch (error) {
      setVillageImportError(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImportingVillages(false)
    }
  }

  const handleRegenerateNames = () => {
    if (confirm('This will regenerate all village names with new medieval names. Continue?')) {
      regions.regenerateVillageNames()
      setHasVillages(true)
    }
  }

  const triggerVillageFileInput = () => {
    villageFileInputRef.current?.click()
  }

  const availableRegions = regions.regions.filter(r => r.points.length >= 3)
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

        <button
          onClick={handleGenerateAchievements}
          disabled={regions.regions.length === 0}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Generate Achievements
        </button>

        <button
          onClick={handleGenerateEventConditions}
          disabled={regions.regions.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Generate Event Conditions
        </button>

        <button
          onClick={handleGenerateLevelledMobsRules}
          disabled={regions.regions.length === 0 && !spawn.spawnState.coordinates}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Generate LevelledMobs Rules
        </button>

        {importError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
            {importError}
          </div>
        )}

        {/* Village Import Section */}
        <div className="text-xs text-gray-500 mb-2">
          Import villages from CSV files generated by seed map tools
          {worldType.worldType === 'nether' && (
            <div className="text-yellow-400 mt-1">
              Note: Villages use overworld naming (villages don't exist in the nether)
            </div>
          )}
        </div>
        <button
          onClick={triggerVillageFileInput}
          disabled={availableRegions.length === 0 || isImportingVillages}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isImportingVillages ? 'Importing...' : 'Import Villages (CSV)'}
        </button>

        <input
          ref={villageFileInputRef}
          type="file"
          accept=".csv"
          onChange={handleVillageImport}
          className="hidden"
        />

        {hasVillages && (
          <button
            onClick={handleRegenerateNames}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            🎲 Regenerate Village Names
          </button>
        )}

        {availableRegions.length === 0 && (
          <div className="text-yellow-600 text-sm">
            No regions available. Create at least one region first.
          </div>
        )}

                 {villageImportError && (
           <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
             {villageImportError}
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
