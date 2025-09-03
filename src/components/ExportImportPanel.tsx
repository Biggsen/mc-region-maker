import React, { useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { exportMapData, exportRegionsYAML, importMapData, loadImageFromSrc, generateAchievementsYAML, generateEventConditionsYAML } from '../utils/exportUtils'
import { ExportDialog } from './ExportDialog'

export function ExportImportPanel() {
  const { regions, mapState } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const villageFileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isImportingVillages, setIsImportingVillages] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [villageImportError, setVillageImportError] = useState<string | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [hasVillages, setHasVillages] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)

  const handleExport = () => {
    exportMapData(regions.regions, mapState.mapState)
  }

  const handleExportYAML = () => {
    setShowExportDialog(true)
  }

  const handleExportYAMLWithOptions = (includeVillages: boolean, randomMobSpawn: boolean, includeHeartRegions: boolean) => {
    exportRegionsYAML(regions.regions, includeVillages, randomMobSpawn, includeHeartRegions)
  }

  const handleGenerateAchievements = () => {
    generateAchievementsYAML(regions.regions)
  }

  const handleGenerateEventConditions = () => {
    generateEventConditionsYAML(regions.regions)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)

    try {
      const importData = await importMapData(file)
      
      // Load the image if it exists
      if (importData.mapState.imageSrc) {
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
    <div className="bg-white rounded-lg shadow-md mb-4">
      <div
        className={`flex justify-between items-center cursor-pointer py-2 px-4 ${!isCollapsed ? 'mb-3' : ''}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-lg font-semibold text-gray-800">Export & Import Map Data</h3>
        <span className="text-gray-600 hover:text-gray-800 transition-colors">
          {isCollapsed ? '▶' : '▼'}
        </span>
      </div>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            disabled={regions.regions.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Export JSON
          </button>

          <button
            onClick={handleExportYAML}
            disabled={regions.regions.length === 0}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Export YAML
          </button>

          <button
            onClick={triggerFileInput}
            disabled={isImporting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

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

        {importError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
            {importError}
          </div>
        )}

        {/* Village Import Section */}
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
       )}

       <ExportDialog
         isOpen={showExportDialog}
         onClose={() => setShowExportDialog(false)}
         onExport={handleExportYAMLWithOptions}
         hasVillages={computedHasVillages}
       />
     </div>
   )
 }
