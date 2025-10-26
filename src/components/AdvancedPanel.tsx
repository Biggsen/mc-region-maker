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
  const [isOtherRegionTypesExpanded, setIsOtherRegionTypesExpanded] = useState(false)
  const [isPluginsExpanded, setIsPluginsExpanded] = useState(false)
  const [isWorldTypeExpanded, setIsWorldTypeExpanded] = useState(false)
  const [isVillagesExpanded, setIsVillagesExpanded] = useState(false)
  const [isImportExpanded, setIsImportExpanded] = useState(false)
  const [isRegionSpecificExpanded, setIsRegionSpecificExpanded] = useState(false)

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
        {/* World Type Toggle */}
        <div>
          <button
            onClick={() => setIsWorldTypeExpanded(!isWorldTypeExpanded)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-300 mb-2 px-3 py-2 rounded-md border border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span>World Type</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isWorldTypeExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isWorldTypeExpanded && (
            <div className="ml-4">
              <div className="flex gap-2">
                <button
                  onClick={() => worldType.setWorldType('overworld')}
                  className={`text-sm px-3 py-1 rounded border ${
                    worldType.worldType === 'overworld'
                      ? 'bg-green-600 text-white border-green-500'
                      : 'text-green-400 hover:text-green-300 border-green-400 hover:border-green-300'
                  }`}
                  title="Generate overworld-style names"
                >
                  Overworld
                </button>
                <button
                  onClick={() => worldType.setWorldType('nether')}
                  className={`text-sm px-3 py-1 rounded border ${
                    worldType.worldType === 'nether'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'text-red-400 hover:text-red-300 border-red-400 hover:border-red-300'
                  }`}
                  title="Generate nether-style names"
                >
                  Nether
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Other region types */}
        <div>
          <button
            onClick={() => setIsOtherRegionTypesExpanded(!isOtherRegionTypesExpanded)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-300 mb-2 px-3 py-2 rounded-md border border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span>Spawn</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isOtherRegionTypesExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isOtherRegionTypesExpanded && (
            <div className="space-y-2 ml-4">
              {worldType.worldType !== 'nether' && <SpawnButton />}
            </div>
          )}
        </div>

        {/* Plugins */}
        <div>
          <button
            onClick={() => setIsPluginsExpanded(!isPluginsExpanded)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-300 mb-2 px-3 py-2 rounded-md border border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span>Plugins</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isPluginsExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isPluginsExpanded && (
            <div className="space-y-4 ml-4">
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide">AdvancedAchievements</h5>
                <button
                  onClick={handleGenerateAchievements}
                  disabled={availableRegions.length === 0}
                  className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Generate Achievements
                </button>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide">ConditionalEvents</h5>
                <button
                  onClick={handleGenerateEventConditions}
                  disabled={availableRegions.length === 0}
                  className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Generate Event Conditions
                </button>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide">LevelledMobs</h5>
                <button
                  onClick={handleGenerateLevelledMobsRules}
                  disabled={availableRegions.length === 0}
                  className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Generate LevelledMobs Rules
                </button>
                <RegionActions
                  regions={availableRegions}
                  onRandomizeChallengeLevels={handleRandomizeChallengeLevels}
                />
              </div>
            </div>
          )}
        </div>

        {/* Villages */}
        <div>
          <button
            onClick={() => setIsVillagesExpanded(!isVillagesExpanded)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-300 mb-2 px-3 py-2 rounded-md border border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span>Villages</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isVillagesExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isVillagesExpanded && (
            <div className="ml-4 space-y-4">
              {/* Villages Counter */}
              {(() => {
                const hasVillages = availableRegions.some(region => region.subregions && region.subregions.length > 0)
                const totalVillages = availableRegions.reduce((total, region) => total + (region.subregions?.length || 0), 0)
                
                if (hasVillages) {
                  return (
                    <div>
                      <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Village Count</h5>
                      <div className="text-lg font-semibold text-white">
                        {totalVillages} villages across {availableRegions.length} regions
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              {/* Village Import */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Import Villages</h5>
                <div className="text-sm text-gray-300">
                  Import villages from CSV files generated by seed map tools
                </div>
                
                <button
                  onClick={triggerVillageFileInput}
                  disabled={isImportingVillages}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
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
            </div>
          )}
        </div>

        {/* Import */}
        <div>
          <button
            onClick={() => setIsImportExpanded(!isImportExpanded)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-300 mb-2 px-3 py-2 rounded-md border border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span>Import</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isImportExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isImportExpanded && (
            <div className="ml-4 space-y-4">
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Import Regions</h5>
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
            </div>
          )}
        </div>

        {/* Region Specific */}
        <div>
          <button
            onClick={() => setIsRegionSpecificExpanded(!isRegionSpecificExpanded)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-300 mb-2 px-3 py-2 rounded-md border border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span>Region Specific</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isRegionSpecificExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isRegionSpecificExpanded && (
            <div className="ml-4 space-y-4">
              <div className="text-sm text-gray-400 p-3 bg-gray-800/50 rounded-md">
                Region-specific tools will be available here.
              </div>
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
