import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { copyToClipboard } from '../utils/polygonUtils'
import { clearSavedData } from '../utils/persistenceUtils'
import { generateMedievalName } from '../utils/nameGenerator'

export function RegionPanel() {
  const { regions } = useAppContext()
  const {
    regions: regionsList,
    selectedRegionId,
    drawingRegion,
    editMode,
    highlightMode,
    setSelectedRegionId,
    startDrawingRegion,
    deleteRegion,
    updateRegion,
    getRegionYAML,
    startEditMode,
    stopEditMode,
    toggleHighlightAll
  } = regions

  const [newRegionName, setNewRegionName] = useState('')
  const [showNewRegionForm, setShowNewRegionForm] = useState(false)
  const [showYAML, setShowYAML] = useState(false)
  const [showAllRegions, setShowAllRegions] = useState(false)

  // Generate a random name when the form is shown
  useEffect(() => {
    if (showNewRegionForm && !newRegionName) {
      setNewRegionName(generateMedievalName())
    }
  }, [showNewRegionForm, newRegionName])

  const handleGenerateNewName = () => {
    setNewRegionName(generateMedievalName())
  }

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
  const isEditing = editMode.isEditing && editMode.editingRegionId === selectedRegionId

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Regions ({regionsList.length})</h2>
          <div className="flex space-x-2">
            <button
              onClick={toggleHighlightAll}
              className={`text-sm px-2 py-1 rounded border ${
                highlightMode.highlightAll
                  ? 'bg-yellow-600 text-white border-yellow-500'
                  : 'text-yellow-400 hover:text-yellow-300 border-yellow-400 hover:border-yellow-300'
              }`}
              title="Highlight all regions"
            >
              {highlightMode.highlightAll ? 'Hide' : 'Highlight'} All
            </button>
            <button
              onClick={handleClearData}
              className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded border border-red-400 hover:border-red-300"
              title="Clear all saved data"
            >
              Clear Data
            </button>
          </div>
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
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                placeholder="Region name"
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleStartDrawing()}
              />
              <button
                onClick={handleGenerateNewName}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded border border-purple-500 focus:outline-none"
                title="Generate random medieval name"
              >
                🎲
              </button>
            </div>
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

      {isEditing && (
        <div className="mb-4 p-3 bg-green-900 border border-green-600 rounded">
          <p className="text-green-200 text-sm">
            Editing: <strong>{selectedRegion?.name}</strong>
          </p>
          <p className="text-green-300 text-xs mt-1">
            Drag orange points to move them. Click cyan dots between points to add new points. Double-click orange points to delete them.
          </p>
          <button
            onClick={stopEditMode}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
          >
            Save Changes
          </button>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {(showAllRegions ? [...regionsList].reverse() : regionsList.slice(-10).reverse()).map(region => (
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
          </div>
        ))}
        
        {regionsList.length > 10 && (
          <button
            onClick={() => setShowAllRegions(!showAllRegions)}
            className="w-full text-blue-400 hover:text-blue-300 text-sm py-2 border border-blue-400 hover:border-blue-300 rounded"
          >
            {showAllRegions ? 'Show Less' : `Show All (${regionsList.length - 10} more)`}
          </button>
        )}
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
            <p className="text-gray-400 text-xs mt-1">
              {selectedRegion.points.length} points
            </p>
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

          <div className="flex space-x-2">
            <button
              onClick={() => startEditMode(selectedRegion.id)}
              disabled={isEditing}
              className={`flex-1 font-medium py-2 px-4 rounded ${
                isEditing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isEditing ? 'Editing...' : 'Edit Points'}
            </button>
            <button
              onClick={() => handleCopyYAML(selectedRegion.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Copy YAML
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">YAML Output</h3>
              <button
                onClick={() => setShowYAML(!showYAML)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {showYAML ? 'Hide' : 'Show'}
              </button>
            </div>
            {showYAML && (
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                {getRegionYAML(selectedRegion.id)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
