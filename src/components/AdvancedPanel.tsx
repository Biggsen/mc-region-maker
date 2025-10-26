import React, { useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { generateAchievementsYAML, generateEventConditionsYAML, generateLevelledMobsRulesYAML, importMapData } from '../utils/exportUtils'
import { RegionActions } from './RegionActions'
import { SpawnButton } from './SpawnButton'

export function AdvancedPanel() {
  const { regions, worldType } = useAppContext()
  const villageFileInputRef = useRef<HTMLInputElement>(null)
  const importFileInputRef = useRef<HTMLInputElement>(null)
  const [isImportingVillages, setIsImportingVillages] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [villageImportError, setVillageImportError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleGenerateAchievements = () => {
    generateAchievementsYAML(regions.regions, worldType.worldType)
  }

  const handleGenerateEventConditions = () => {
    generateEventConditionsYAML(regions.regions, worldType.worldType)
  }

  const handleGenerateLevelledMobsRules = () => {
    generateLevelledMobsRulesYAML(regions.regions, worldType.worldType)
  }

  const handleRandomizeChallengeLevels = () => {
    regions.randomizeChallengeLevels()
  }

  const handleVillageImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImportingVillages(true)
    setVillageImportError(null)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        throw new Error('File is empty or contains no valid data')
      }

      // Parse CSV data
      const villages = lines.map((line, index) => {
        const [x, z, name] = line.split(',').map(field => field.trim())
        
        if (!x || !z || isNaN(Number(x)) || isNaN(Number(z))) {
          throw new Error(`Invalid data on line ${index + 1}: ${line}`)
        }

        return {
          x: Number(x),
          z: Number(z),
          name: name || `Village ${index + 1}`
        }
      })

      // Add villages to regions
      const csvContent = villages.map(v => `${v.x},${v.z},${v.name}`).join('\n')
      regions.importVillagesFromCSV(csvContent)
      
      // Clear the file input
      if (villageFileInputRef.current) {
        villageFileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Village import error:', error)
      setVillageImportError(error instanceof Error ? error.message : 'Failed to import villages')
    } finally {
      setIsImportingVillages(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)

    try {
      const importData = await importMapData(file)
      
      // Import only regions, ignore all other data
      regions.replaceRegions(importData.regions)
      regions.setSelectedRegionId(null)
      console.log('Imported regions only from map export')
      
      // Clear the file input
      if (importFileInputRef.current) {
        importFileInputRef.current.value = ''
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const triggerFileInput = () => {
    importFileInputRef.current?.click()
  }

  const triggerVillageFileInput = () => {
    villageFileInputRef.current?.click()
  }

  const availableRegions = regions.regions.filter(r => r.points.length >= 3)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Advanced Tools</h3>
      
      <div className="space-y-4">
        {worldType.worldType !== 'nether' && <SpawnButton />}

        <RegionActions
          regions={availableRegions}
          onRandomizeChallengeLevels={handleRandomizeChallengeLevels}
        />

        <div className="space-y-2">
          <button
            onClick={handleGenerateAchievements}
            disabled={availableRegions.length === 0}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Generate Achievements
          </button>

          <button
            onClick={handleGenerateEventConditions}
            disabled={availableRegions.length === 0}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Generate Event Conditions
          </button>

          <button
            onClick={handleGenerateLevelledMobsRules}
            disabled={availableRegions.length === 0}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Generate LevelledMobs Rules
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-300">
            Import regions from JSON project files
          </div>
          
          <button
            onClick={triggerFileInput}
            disabled={isImporting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isImporting ? 'Importing...' : 'Import regions'}
          </button>

          <input
            ref={importFileInputRef}
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

        <div className="space-y-2">
          <div className="text-sm text-gray-300">
            Import villages from CSV files generated by seed map tools
          </div>
          
          <button
            onClick={triggerVillageFileInput}
            disabled={isImportingVillages}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
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

          {villageImportError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
              {villageImportError}
            </div>
          )}
        </div>

        {availableRegions.length === 0 && (
          <div className="text-orange-400 text-sm">
            No regions available. Create at least one region first.
          </div>
        )}
      </div>
    </div>
  )
}
