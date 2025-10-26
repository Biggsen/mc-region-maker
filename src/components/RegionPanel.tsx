import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { copyToClipboard, calculatePolygonArea, formatArea } from '../utils/polygonUtils'
import { clearSavedData } from '../utils/persistenceUtils'
import { RegionCreationForm } from './RegionCreationForm'
import { RegionDetailsView } from './RegionDetailsView'
import { WorldNameHeading } from './WorldNameHeading'
import { Trash2, Search } from 'lucide-react'

export function RegionPanel() {
  const { regions, worldType } = useAppContext()
  const {
    regions: regionsList,
    selectedRegionId,
    drawingRegion,
    editMode,
    setSelectedRegionId,
    startDrawingRegion,
    deleteRegion,
    updateRegion,
    getRegionYAML,
    startEditMode,
    stopEditMode,
    removeSubregionFromRegion,
    updateSubregionName,
    setCustomCenterPoint,
    startMoveRegion,
    cancelMoveRegion,
    doubleRegionVertices,
    halveRegionVertices,
    simplifyRegionVertices,
    resizeRegion,
    startSplitRegion,
    finishSplitRegion,
    cancelSplitRegion
  } = regions

  const { startSettingCenterPoint } = useAppContext().mapCanvas
  const { isWarping, setIsWarping, warpRadius, setWarpRadius, warpStrength, setWarpStrength } = useAppContext().mapCanvas

  const [searchQuery, setSearchQuery] = useState('')





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



  const handleSpawnCheckboxChange = (regionId: string, checked: boolean) => {
    if (checked) {
      // If checking this region, uncheck all other regions first
      regionsList.forEach(region => {
        if (region.id !== regionId && region.hasSpawn) {
          updateRegion(region.id, { hasSpawn: false })
        }
      })
    }
    // Then update the selected region
    updateRegion(regionId, { hasSpawn: checked })
  }




  const selectedRegion = regionsList.find(r => r.id === selectedRegionId)

  

  
  // Filter regions based on search query
  const filteredRegions = regionsList.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full h-full flex flex-col">
      {!selectedRegion ? (
        // Region List View
        <>
          <div className="flex-shrink-0 mb-4">
            <WorldNameHeading />
          </div>
          
          <div className="flex-shrink-0 mb-2">
            <RegionCreationForm
              worldType={worldType.worldType}
              onStartDrawing={(name, freehand) => {
                regions.setFreehandEnabled(freehand)
                startDrawingRegion(name)
              }}
              onCancelDrawing={() => regions.cancelDrawingRegion()}
              isDrawing={!!drawingRegion}
            />
          </div>

          {drawingRegion && (
            <div className="flex-shrink-0 mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-yellow-200 text-base">
                  Drawing: <strong>{drawingRegion.name}</strong>
                </p>
                <span className="text-sm text-gray-200">{drawingRegion.points.length} pts</span>
              </div>
              <p className="text-yellow-300 text-sm">
                Click to place points or click and hold to draw
              </p>
              <button
                onClick={() => regions.finishDrawingRegion()}
                disabled={drawingRegion.points.length < 3}
                className={`w-full font-medium py-2 px-4 rounded ${drawingRegion.points.length < 3 ? 'bg-gray-600 text-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                Finish
              </button>
            </div>
          )}

          {/* Region Counter */}
          <div className="flex-shrink-0 mb-4 mt-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Regions ({regionsList.length})</h2>
            {regionsList.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete all ${regionsList.length} regions? This action cannot be undone.`)) {
                    regions.replaceRegions([])
                    regions.setSelectedRegionId(null)
                  }
                }}
                className="text-red-400 hover:text-red-300 text-sm underline hover:no-underline transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete all
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="flex-shrink-0 mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search regions..."
              className="w-full bg-gray-700 text-white pl-10 pr-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Scrollable Region List - Takes remaining space */}
          <div className="flex-1 overflow-y-auto space-y-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            {[...filteredRegions].reverse().map(region => {
              const area = calculatePolygonArea(region.points)
              return (
                <div
                  key={region.id}
                  className="p-2 rounded cursor-pointer border bg-gray-700 border-gray-600 hover:bg-gray-600"
                  onClick={() => setSelectedRegionId(region.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-white font-medium">{region.name}</span>
                      <div className="text-gray-400 text-xs">
                        Size: {formatArea(area)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteRegion(region.id)
                      }}
                      className="text-gray-300 hover:text-red-300 text-sm p-1 hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
            
            {filteredRegions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg mb-2">No regions</p>
                <p className="text-sm">Create your first region to get started</p>
              </div>
            )}
          </div>

          {/* Clear Data Button - Bottom of sidebar */}
          <div className="fixed bottom-0 left-0 w-96 border-r border-gray-700 px-4 py-2 z-10">
            <button
              onClick={handleClearData}
              className="w-full text-red-400 hover:text-red-300 text-sm py-2 px-4 rounded border border-red-400 hover:border-red-300 hover:bg-red-900/20 transition-colors"
              title="Clear all saved data"
            >
              Clear All Data
            </button>
          </div>
        </>
      ) : (
        <RegionDetailsView
          selectedRegion={selectedRegion}
          editMode={editMode}
          worldType={worldType.worldType}
          isWarping={isWarping}
          warpRadius={warpRadius}
          warpStrength={warpStrength}
          onBack={() => setSelectedRegionId(null)}
          onUpdateRegion={updateRegion}
          onStartEditMode={startEditMode}
          onStopEditMode={stopEditMode}
          onStartSettingCenterPoint={startSettingCenterPoint}
          onSetCustomCenterPoint={setCustomCenterPoint}
          onSpawnCheckboxChange={handleSpawnCheckboxChange}
          onStartMoveRegion={startMoveRegion}
          onCancelMoveRegion={cancelMoveRegion}
          onStartSplitRegion={startSplitRegion}
          onFinishSplitRegion={finishSplitRegion}
          onCancelSplitRegion={cancelSplitRegion}
          onDoubleRegionVertices={doubleRegionVertices}
          onHalveRegionVertices={halveRegionVertices}
          onSimplifyRegionVertices={simplifyRegionVertices}
          onResizeRegion={resizeRegion}
          onRemoveSubregionFromRegion={removeSubregionFromRegion}
          onUpdateSubregionName={updateSubregionName}
          onCopyYAML={handleCopyYAML}
          onClearData={handleClearData}
          onSetWarping={setIsWarping}
          onSetWarpRadius={setWarpRadius}
          onSetWarpStrength={setWarpStrength}
        />
      )}
    </div>
  )
}
