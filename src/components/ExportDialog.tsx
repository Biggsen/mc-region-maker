import { useState } from 'react'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (includeVillages: boolean, randomMobSpawn: boolean, includeHeartRegions: boolean, includeSpawnRegion: boolean, useModernWorldHeight: boolean) => void
  hasVillages: boolean
  hasSpawn: boolean
  worldType?: 'overworld' | 'nether'
}

export function ExportDialog({ isOpen, onClose, onExport, hasVillages, hasSpawn, worldType }: ExportDialogProps) {
  const [includeVillages, setIncludeVillages] = useState(true)
  const [randomMobSpawn, setRandomMobSpawn] = useState(false)
  const [includeHeartRegions, setIncludeHeartRegions] = useState(true)
  const [includeSpawnRegion, setIncludeSpawnRegion] = useState(true)
  const [useModernWorldHeight, setUseModernWorldHeight] = useState(true)

  if (!isOpen) return null

  const handleExport = () => {
    onExport(includeVillages, randomMobSpawn, includeHeartRegions, includeSpawnRegion, useModernWorldHeight)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4 text-white">Export Options</h3>
        
        <div className="space-y-4">
          {/* Settings Section */}
          <div className="border-t border-gray-600 pt-4">
            <h4 className="text-md font-medium text-white mb-3">Settings</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useModernWorldHeight"
                checked={useModernWorldHeight}
                onChange={(e) => setUseModernWorldHeight(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="useModernWorldHeight" className="ml-2 text-white">
                Use modern world height (1.18+)
              </label>
            </div>
            <p className="text-gray-400 text-xs mt-1 ml-6">
              {useModernWorldHeight ? 'Y: -64 to 320' : 'Y: 0 to 255 (legacy)'}
            </p>
          </div>

          {/* Export Options */}
          <div className="border-t border-gray-600 pt-4">
            <h4 className="text-md font-medium text-white mb-3">Export Options</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeVillages"
                checked={includeVillages}
                onChange={(e) => setIncludeVillages(e.target.checked)}
                disabled={!hasVillages}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="includeVillages" className="ml-2 text-white">
                Include Villages
                {!hasVillages && <span className="text-gray-400 ml-1">(No villages available)</span>}
              </label>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeHeartRegions"
              checked={includeHeartRegions}
              onChange={(e) => setIncludeHeartRegions(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="includeHeartRegions" className="ml-2 text-white">
              Include Heart of Regions (7x7 centered subregions)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="randomMobSpawn"
              checked={randomMobSpawn}
              onChange={(e) => setRandomMobSpawn(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="randomMobSpawn" className="ml-2 text-white">
              Random mob spawn
            </label>
          </div>
          {worldType !== 'nether' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeSpawnRegion"
                checked={includeSpawnRegion}
                onChange={(e) => setIncludeSpawnRegion(e.target.checked)}
                disabled={!hasSpawn}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="includeSpawnRegion" className="ml-2 text-white">
                Include Spawn Region
                {!hasSpawn && <span className="text-gray-400 ml-1">(No spawn point set)</span>}
              </label>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Export YAML
          </button>
        </div>
      </div>
    </div>
  )
}
