import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { copyToClipboard, calculatePolygonArea, formatArea, calculateRegionCenter } from '../utils/polygonUtils'
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
    toggleHighlightAll,
    toggleShowVillages,
    toggleShowCenterPoints,
    removeSubregionFromRegion,
    updateSubregionName,
    setCustomCenterPoint
  } = regions

  const { startSettingCenterPoint, stopSettingCenterPoint } = useAppContext().mapCanvas

  const [newRegionName, setNewRegionName] = useState('')
  const [showNewRegionForm, setShowNewRegionForm] = useState(false)
  const [showYAML, setShowYAML] = useState(false)
  const [showAllRegions, setShowAllRegions] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingVillageId, setEditingVillageId] = useState<string | null>(null)
  const [editingVillageName, setEditingVillageName] = useState('')
  const [customCenterX, setCustomCenterX] = useState('')
  const [customCenterZ, setCustomCenterZ] = useState('')
  const [showCustomCenterForm, setShowCustomCenterForm] = useState(false)

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

  const handleStartVillageRename = (villageId: string, currentName: string) => {
    setEditingVillageId(villageId)
    setEditingVillageName(currentName)
  }

  const handleSaveVillageRename = () => {
    if (editingVillageId && selectedRegion && editingVillageName.trim()) {
      updateSubregionName(selectedRegion.id, editingVillageId, editingVillageName.trim())
      setEditingVillageId(null)
      setEditingVillageName('')
    }
  }

  const handleCancelVillageRename = () => {
    setEditingVillageId(null)
    setEditingVillageName('')
  }

  const handleSetCustomCenter = () => {
    if (selectedRegion && customCenterX && customCenterZ) {
      const x = parseInt(customCenterX)
      const z = parseInt(customCenterZ)
      if (!isNaN(x) && !isNaN(z)) {
        setCustomCenterPoint(selectedRegion.id, { x, z })
        setCustomCenterX('')
        setCustomCenterZ('')
        setShowCustomCenterForm(false)
      }
    }
  }

  const handleUseCalculatedCenter = () => {
    if (selectedRegion) {
      setCustomCenterPoint(selectedRegion.id, null)
      setCustomCenterX('')
      setCustomCenterZ('')
      setShowCustomCenterForm(false)
    }
  }

  const handleShowCustomCenterForm = () => {
    if (selectedRegion?.centerPoint) {
      setCustomCenterX(selectedRegion.centerPoint.x.toString())
      setCustomCenterZ(selectedRegion.centerPoint.z.toString())
    } else {
      setCustomCenterX('')
      setCustomCenterZ('')
    }
    setShowCustomCenterForm(true)
  }

  const selectedRegion = regionsList.find(r => r.id === selectedRegionId)
  const isEditing = editMode.isEditing && editMode.editingRegionId === selectedRegionId
  const hasVillages = regionsList.some(region => region.subregions && region.subregions.length > 0)
  const totalVillages = regionsList.reduce((total, region) => total + (region.subregions?.length || 0), 0)
  

  
  // Filter regions based on search query
  const filteredRegions = regionsList.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full">
      {!selectedRegion ? (
        // Region List View
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Regions ({regionsList.length})</h2>
            
            {hasVillages && (
              <h3 className="text-lg font-semibold text-white mb-4">Villages ({totalVillages})</h3>
            )}
            
            <div className="flex space-x-2 mb-4">
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
                onClick={toggleShowVillages}
                className={`text-sm px-2 py-1 rounded border ${
                  highlightMode.showVillages
                    ? 'bg-orange-600 text-white border-orange-500'
                    : 'text-orange-400 hover:text-orange-300 border-orange-400 hover:border-orange-300'
                }`}
                title="Show/hide villages on map"
              >
                {highlightMode.showVillages ? 'Hide' : 'Show'} Villages
              </button>
              <button
                onClick={toggleShowCenterPoints}
                className={`text-sm px-2 py-1 rounded border ${
                  highlightMode.showCenterPoints
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'text-purple-400 hover:text-purple-300 border-purple-400 hover:border-purple-300'
                }`}
                title="Show/hide region hearts on map"
              >
                {highlightMode.showCenterPoints ? 'Hide' : 'Show'} Region Hearts
              </button>
              <button
                onClick={handleClearData}
                className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded border border-red-400 hover:border-red-300"
                title="Clear all saved data"
              >
                Clear Data
              </button>
            </div>
            
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search regions..."
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
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

          <div className="space-y-2 mb-6">
            {(showAllRegions ? [...filteredRegions].reverse() : filteredRegions.slice(-5).reverse()).map(region => {
              const area = calculatePolygonArea(region.points)
              return (
                <div
                  key={region.id}
                  className="p-3 rounded cursor-pointer border bg-gray-700 border-gray-600 hover:bg-gray-600"
                  onClick={() => setSelectedRegionId(region.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-white font-medium">{region.name}</span>
                      <div className="text-gray-400 text-xs mt-1">
                        {formatArea(area)}
                      </div>
                    </div>
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
              )
            })}
            
            {filteredRegions.length > 5 && (
              <button
                onClick={() => setShowAllRegions(!showAllRegions)}
                className="w-full text-blue-400 hover:text-blue-300 text-sm py-2 border border-blue-400 hover:border-blue-300 rounded"
              >
                {showAllRegions ? 'Show Less' : `Show All (${filteredRegions.length - 5} more)`}
              </button>
            )}
          </div>
        </>
      ) : (
        // Region Details View
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setSelectedRegionId(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded border border-blue-500 text-sm mr-3 transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold text-white">Region Details</h2>
          </div>

          {isEditing && (
            <div className="mb-4 p-3 bg-green-900 border border-green-600 rounded">
              <p className="text-green-200 text-sm">
                Editing: <strong>{selectedRegion.name}</strong>
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

          <div>
            <input
              type="text"
              value={selectedRegion.name}
              onChange={(e) => updateRegion(selectedRegion.id, { name: e.target.value })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-gray-400 text-xs">
                {selectedRegion.points.length} points
              </p>
              <p className="text-blue-400 text-xs">
                {formatArea(calculatePolygonArea(selectedRegion.points))}
              </p>
            </div>

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
              <label className="block text-sm text-gray-300">Region Heart</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (showCustomCenterForm) {
                      setShowCustomCenterForm(false)
                    } else {
                      startSettingCenterPoint(selectedRegion.id)
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                  title="Click on map to set region heart"
                >
                  Click Map
                </button>
                <button
                  onClick={handleShowCustomCenterForm}
                  className="text-gray-400 hover:text-gray-300 text-sm px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                  title="Manually enter coordinates"
                >
                  Manual
                </button>
              </div>
            </div>
            
            {!showCustomCenterForm ? (
              <div className="bg-gray-700 p-3 rounded border border-gray-600">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-400">Current: </span>
                    <span className="text-white">
                      X: {Math.round(calculateRegionCenter(selectedRegion).x)}, Z: {Math.round(calculateRegionCenter(selectedRegion).z)}
                    </span>
                    {selectedRegion.centerPoint && (
                      <span className="text-blue-400 text-xs ml-2">(Custom)</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const center = calculateRegionCenter(selectedRegion)
                      const tpCommand = `/tp @s ${Math.round(center.x)} ~ ${Math.round(center.z)}`
                      navigator.clipboard.writeText(tpCommand)
                    }}
                    className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                    title="Copy /tp command to clipboard"
                  >
                    Copy /tp
                  </button>
                </div>
                {useAppContext().mapCanvas.isSettingCenterPoint && useAppContext().mapCanvas.centerPointRegionId === selectedRegion.id && (
                  <div className="mt-2 p-2 bg-purple-900 border border-purple-600 rounded text-xs text-purple-200">
                    Click anywhere on the map to set the region heart for this region
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-700 p-3 rounded border border-gray-600 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">X Coordinate</label>
                    <input
                      type="number"
                      value={customCenterX}
                      onChange={(e) => setCustomCenterX(e.target.value)}
                      placeholder="X"
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-blue-400 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Z Coordinate</label>
                    <input
                      type="number"
                      value={customCenterZ}
                      onChange={(e) => setCustomCenterZ(e.target.value)}
                      placeholder="Z"
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-blue-400 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSetCustomCenter}
                    disabled={!customCenterX || !customCenterZ}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 text-white text-sm px-2 py-1 rounded"
                  >
                    Set Region Heart
                  </button>
                  <button
                    onClick={handleUseCalculatedCenter}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm px-2 py-1 rounded"
                  >
                    Use Calculated
                  </button>
                  <button
                    onClick={() => setShowCustomCenterForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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

          {selectedRegion.subregions && selectedRegion.subregions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Villages ({selectedRegion.subregions.length})</h4>
              <div className="space-y-2">
                {selectedRegion.subregions.map(subregion => (
                  <div key={subregion.id} className="bg-gray-600 rounded p-2 text-sm">
                    {editingVillageId === subregion.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1">
                          <input
                            type="text"
                            value={editingVillageName}
                            onChange={(e) => setEditingVillageName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveVillageRename()
                              } else if (e.key === 'Escape') {
                                handleCancelVillageRename()
                              }
                            }}
                            className="flex-1 bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-500 focus:outline-none focus:border-blue-400"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveVillageRename}
                            className="text-green-400 hover:text-green-300 text-xs px-1"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelVillageRename}
                            className="text-gray-400 hover:text-gray-300 text-xs px-1"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="text-gray-400 text-xs">
                          ({subregion.x}, {subregion.z}) - {subregion.details}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center">
                          <span 
                            className="cursor-pointer hover:text-blue-300 transition-colors"
                            onClick={() => handleStartVillageRename(subregion.id, subregion.name)}
                            title="Click to rename"
                          >
                            {subregion.name}
                          </span>
                          <button
                            onClick={() => removeSubregionFromRegion(selectedRegion.id, subregion.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                            title="Remove village"
                          >
                            ×
                          </button>
                        </div>
                        <div className="text-gray-400 text-xs">
                          ({subregion.x}, {subregion.z}) - {subregion.details}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
