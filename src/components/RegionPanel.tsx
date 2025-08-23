import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { copyToClipboard } from '../utils/polygonUtils'
import { clearSavedData } from '../utils/persistenceUtils'

export function RegionPanel() {
  const { regions } = useAppContext()
  const {
    regions: regionsList,
    selectedRegionId,
    drawingRegion,
    setSelectedRegionId,
    startDrawingRegion,
    deleteRegion,
    updateRegion,
    getRegionYAML
  } = regions

  const [newRegionName, setNewRegionName] = useState('')
  const [showNewRegionForm, setShowNewRegionForm] = useState(false)

  const handleStartDrawing = () => {
    if (newRegionName.trim()) {
      startDrawingRegion(newRegionName.trim())
      setNewRegionName('')
      setShowNewRegionForm(false)
    }
  }

  const handleCopyYAML = async (regionId: string) => {
    const yaml = getRegionYAML(regionId)
    try {
      await copyToClipboard(yaml)
      alert('YAML copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all saved data? This will remove the loaded image and all regions.')) {
      clearSavedData()
      window.location.reload()
    }
  }

  const selectedRegion = regionsList.find(r => r.id === selectedRegionId)

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Regions</h2>
          <button
            onClick={handleClearData}
            className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded border border-red-400 hover:border-red-300"
            title="Clear all saved data"
          >
            Clear Data
          </button>
        </div>
        
        {!showNewRegionForm ? (
          <button
            onClick={() => setShowNewRegionForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Create New Region
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={newRegionName}
              onChange={(e) => setNewRegionName(e.target.value)}
              placeholder="Region name"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleStartDrawing()}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleStartDrawing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Start Drawing
              </button>
              <button
                onClick={() => setShowNewRegionForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {drawingRegion && (
        <div className="mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded">
          <p className="text-yellow-200 text-sm">
            Drawing: <strong>{drawingRegion.name}</strong>
          </p>
          <p className="text-yellow-300 text-xs mt-1">
            Click on map to add points. Click on a previous point to finish.
          </p>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {regionsList.map(region => (
          <div
            key={region.id}
            className={`p-3 rounded cursor-pointer border ${
              region.id === selectedRegionId
                ? 'bg-green-900 border-green-600'
                : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
            }`}
            onClick={() => setSelectedRegionId(region.id)}
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">{region.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteRegion(region.id)
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                ×
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              {region.points.length} points
            </p>
          </div>
        ))}
      </div>

      {selectedRegion && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Region Details</h3>
            <input
              type="text"
              value={selectedRegion.name}
              onChange={(e) => updateRegion(selectedRegion.id, { name: e.target.value })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Min Y</label>
              <input
                type="number"
                value={selectedRegion.minY}
                onChange={(e) => updateRegion(selectedRegion.id, { minY: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Max Y</label>
              <input
                type="number"
                value={selectedRegion.maxY}
                onChange={(e) => updateRegion(selectedRegion.id, { maxY: parseInt(e.target.value) || 255 })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">YAML Output</h3>
              <button
                onClick={() => handleCopyYAML(selectedRegion.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
              >
                Copy
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
              {getRegionYAML(selectedRegion.id)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
