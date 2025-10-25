import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { copyToClipboard, calculatePolygonArea, formatArea } from '../utils/polygonUtils'
import { clearSavedData } from '../utils/persistenceUtils'
import { ChallengeLevel } from '../types'
import { MapControls } from './MapControls'
import { RegionActions } from './RegionActions'
import { RegionCreationForm } from './RegionCreationForm'
import { RegionDetailsView } from './RegionDetailsView'

export function RegionPanel() {
  const { regions, worldType, customMarkers } = useAppContext()
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
    toggleShowChallengeLevels,
    toggleShowGrid,
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
  const { orphanedVillageMarkers, showOrphanedVillages, toggleShowOrphanedVillages } = customMarkers

  const [showAllRegions, setShowAllRegions] = useState(false)
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

  const handleRandomizeChallengeLevels = () => {
    console.log('Starting randomization for', regionsList.length, 'regions')
    
    // Find regions with spawn and exclude them from randomization
    const spawnRegions = regionsList.filter(region => region.hasSpawn)
    const regionsToRandomize = regionsList.filter(region => !region.hasSpawn)
    
    console.log('Spawn regions found:', spawnRegions.map(r => r.name))
    console.log('Regions to randomize:', regionsToRandomize.length)
    
    // Define the balanced distribution
    const distribution = {
      Platinum: 2,
      Gold: 4,
      Silver: 6,
      Bronze: 8,
      Vanilla: Math.max(0, regionsToRandomize.length - 20) // Rest go to vanilla
    }
    
    console.log('Distribution:', distribution)
    
    // Create array of challenge levels based on distribution
    const challengeLevels: ChallengeLevel[] = []
    Object.entries(distribution).forEach(([level, count]) => {
      for (let i = 0; i < count; i++) {
        challengeLevels.push(level as ChallengeLevel)
      }
    })
    
    console.log('Challenge levels array:', challengeLevels)
    
    // Shuffle the array
    const shuffledLevels = [...challengeLevels].sort(() => Math.random() - 0.5)
    console.log('Shuffled levels:', shuffledLevels)
    
    // Apply challenge levels to non-spawn regions
    regionsToRandomize.forEach((region, index) => {
      const challengeLevel = shuffledLevels[index] || 'Vanilla'
      console.log(`Setting region ${region.name} to ${challengeLevel}`)
      updateRegion(region.id, { challengeLevel })
    })
    
    // Ensure spawn regions are always vanilla
    spawnRegions.forEach(region => {
      console.log(`Setting spawn region ${region.name} to Vanilla`)
      updateRegion(region.id, { challengeLevel: 'Vanilla' })
    })
  }



  const selectedRegion = regionsList.find(r => r.id === selectedRegionId)
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
            
            {/* Map Visibility Controls */}
            <MapControls
              highlightMode={highlightMode}
              orphanedVillageMarkers={orphanedVillageMarkers}
              showOrphanedVillages={showOrphanedVillages}
              toggleHighlightAll={toggleHighlightAll}
              toggleShowVillages={toggleShowVillages}
              toggleShowOrphanedVillages={toggleShowOrphanedVillages}
              toggleShowCenterPoints={toggleShowCenterPoints}
              toggleShowChallengeLevels={toggleShowChallengeLevels}
              toggleShowGrid={toggleShowGrid}
            />


            <RegionActions
              regions={regionsList}
              onRandomizeChallengeLevels={handleRandomizeChallengeLevels}
            />
            
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
            
            <RegionCreationForm
              worldType={worldType.worldType}
              regionsCount={regionsList.length}
              onStartDrawing={(name, freehand) => {
                regions.setFreehandEnabled(freehand)
                startDrawingRegion(name)
              }}
              onDeleteAllRegions={() => {
                      if (confirm(`Are you sure you want to delete all ${regionsList.length} regions? This action cannot be undone.`)) {
                        regions.replaceRegions([])
                        regions.setSelectedRegionId(null)
                      }
                    }}
            />
          </div>

          {drawingRegion && (
            <div className="mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-yellow-200 text-sm">
                  Drawing: <strong>{drawingRegion.name}</strong>
                </p>
                <span className="text-xs text-gray-200">{drawingRegion.points.length} pts</span>
              </div>
              <p className="text-yellow-300 text-xs">
                {regions.freehandEnabled ? 'Drag to draw; release to place points.' : 'Click to add points.'}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => regions.finishDrawingRegion()}
                  disabled={drawingRegion.points.length < 3}
                  className={`flex-1 font-medium py-2 px-4 rounded ${drawingRegion.points.length < 3 ? 'bg-gray-600 text-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  Finish
                </button>
                <button
                  onClick={() => regions.cancelDrawingRegion()}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
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

          {/* Clear Data Button - Bottom of sidebar */}
          <div className="mt-auto pt-4 border-t border-gray-600">
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
