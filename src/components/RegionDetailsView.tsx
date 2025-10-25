import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { calculatePolygonArea, formatArea, calculateRegionCenter } from '../utils/polygonUtils'
import { generateRegionName } from '../utils/nameGenerator'
import { ChallengeLevel, Region, EditMode } from '../types'
import { YAMLDisplay } from './YAMLDisplay'
import { VillageManager } from './VillageManager'

interface RegionDetailsViewProps {
  selectedRegion: Region
  editMode: EditMode
  worldType: string
  isWarping: boolean
  warpRadius: number
  warpStrength: number
  onBack: () => void
  onUpdateRegion: (regionId: string, updates: any) => void
  onStartEditMode: (regionId: string) => void
  onStopEditMode: () => void
  onStartSettingCenterPoint: (regionId: string) => void
  onSetCustomCenterPoint: (regionId: string, point: { x: number; z: number } | null) => void
  onSpawnCheckboxChange: (regionId: string, checked: boolean) => void
  onStartMoveRegion: (regionId: string, x: number, z: number) => void
  onCancelMoveRegion: () => void
  onStartSplitRegion: (regionId: string) => void
  onFinishSplitRegion: () => void
  onCancelSplitRegion: () => void
  onDoubleRegionVertices: (regionId: string) => void
  onHalveRegionVertices: (regionId: string) => void
  onSimplifyRegionVertices: (regionId: string, tolerance: number) => void
  onResizeRegion: (regionId: string, scaleFactor: number) => void
  onRemoveSubregionFromRegion: (regionId: string, subregionId: string) => void
  onUpdateSubregionName: (regionId: string, subregionId: string, newName: string) => void
  onCopyYAML: (regionId: string) => void
  onClearData: () => void
  onSetWarping: (warping: boolean) => void
  onSetWarpRadius: (radius: number) => void
  onSetWarpStrength: (strength: number) => void
}

export function RegionDetailsView({
  selectedRegion,
  editMode,
  worldType,
  isWarping,
  warpRadius,
  warpStrength,
  onBack,
  onUpdateRegion,
  onStartEditMode,
  onStopEditMode,
  onStartSettingCenterPoint,
  onSetCustomCenterPoint,
  onSpawnCheckboxChange,
  onStartMoveRegion,
  onCancelMoveRegion,
  onStartSplitRegion,
  onFinishSplitRegion,
  onCancelSplitRegion,
  onDoubleRegionVertices,
  onHalveRegionVertices,
  onSimplifyRegionVertices,
  onResizeRegion,
  onRemoveSubregionFromRegion,
  onUpdateSubregionName,
  onCopyYAML,
  onClearData,
  onSetWarping,
  onSetWarpRadius,
  onSetWarpStrength
}: RegionDetailsViewProps) {
  const [customCenterX, setCustomCenterX] = useState('')
  const [customCenterZ, setCustomCenterZ] = useState('')
  const [showCustomCenterForm, setShowCustomCenterForm] = useState(false)
  const [resizePercentage, setResizePercentage] = useState('100')

  const { mapCanvas } = useAppContext()

  const isEditing = editMode.isEditing && editMode.editingRegionId === selectedRegion.id

  // Update resize percentage when selected region changes
  useEffect(() => {
    if (selectedRegion) {
      const percentage = Math.round((selectedRegion.scaleFactor || 1.0) * 100)
      setResizePercentage(percentage.toString())
    } else {
      setResizePercentage('100')
    }
  }, [selectedRegion])

  const handleSetCustomCenter = () => {
    if (selectedRegion && customCenterX && customCenterZ) {
      const x = parseInt(customCenterX)
      const z = parseInt(customCenterZ)
      if (!isNaN(x) && !isNaN(z)) {
        onSetCustomCenterPoint(selectedRegion.id, { x, z })
        setCustomCenterX('')
        setCustomCenterZ('')
        setShowCustomCenterForm(false)
      }
    }
  }

  const handleUseCalculatedCenter = () => {
    if (selectedRegion) {
      onSetCustomCenterPoint(selectedRegion.id, null)
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

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
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
            onClick={onStopEditMode}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
          >
            Save Changes
          </button>
        </div>
      )}

      <div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={selectedRegion.name}
            onChange={(e) => onUpdateRegion(selectedRegion.id, { name: e.target.value })}
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => onUpdateRegion(selectedRegion.id, { name: generateRegionName(worldType as 'overworld' | 'nether') })}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded border border-purple-500 focus:outline-none"
            title="Generate random medieval name"
          >
            🎲
          </button>
        </div>
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
            onChange={(e) => onUpdateRegion(selectedRegion.id, { minY: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Max Y</label>
          <input
            type="number"
            value={selectedRegion.maxY}
            onChange={(e) => onUpdateRegion(selectedRegion.id, { maxY: parseInt(e.target.value) || 255 })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Challenge Level</label>
        <select
          value={selectedRegion.challengeLevel || 'Vanilla'}
          onChange={(e) => onUpdateRegion(selectedRegion.id, { challengeLevel: e.target.value as ChallengeLevel })}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="Vanilla">Vanilla</option>
          <option value="Bronze">Bronze</option>
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
          <option value="Platinum">Platinum</option>
        </select>
        <p className="text-gray-400 text-xs mt-1">
          Sets the difficulty level for LevelledMobs plugin
        </p>
      </div>

      {worldType !== 'nether' && (
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedRegion.hasSpawn || false}
              onChange={(e) => onSpawnCheckboxChange(selectedRegion.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300">Has Spawn</span>
          </label>
          <p className="text-gray-400 text-xs mt-1">
            Mark this region as containing the world spawn point (only one region can have spawn)
          </p>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm text-gray-300">Region Heart</label>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (showCustomCenterForm) {
                  setShowCustomCenterForm(false)
                } else {
                  onStartSettingCenterPoint(selectedRegion.id)
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
            {mapCanvas.isSettingCenterPoint && mapCanvas.centerPointRegionId === selectedRegion.id && (
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
          onClick={() => onStartEditMode(selectedRegion.id)}
          disabled={isEditing || editMode.isMovingRegion}
          className={`flex-1 font-medium py-2 px-4 rounded ${
            isEditing || editMode.isMovingRegion
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
        >
          {isEditing ? 'Editing...' : 'Edit Points'}
        </button>
      </div>

      <div className="bg-gray-700 rounded p-3 border border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-300">Warp Brush</div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isWarping}
              onChange={(e) => onSetWarping(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-xs text-gray-300">Enable</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Radius</label>
            <input
              type="number"
              value={warpRadius}
              onChange={(e) => onSetWarpRadius(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-purple-400 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Strength</label>
            <input
              type="number"
              value={warpStrength}
              onChange={(e) => onSetWarpStrength(parseInt(e.target.value) || 0)}
              className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-purple-400 focus:outline-none text-sm"
            />
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-2">Click map to push vertices outward within radius.</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onDoubleRegionVertices(selectedRegion.id)}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded"
        >
          Double Vertices
        </button>
        <button
          onClick={() => onHalveRegionVertices(selectedRegion.id)}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
        >
          Halve Vertices
        </button>
      </div>

      <div className="bg-gray-700 rounded p-3 border border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-300">Region Scale</div>
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            value={resizePercentage}
            onChange={(e) => {
              const value = e.target.value
              setResizePercentage(value)
              
              // Apply resize in real-time
              const percentage = parseFloat(value)
              if (!isNaN(percentage) && percentage > 0 && selectedRegion) {
                const scaleFactor = percentage / 100
                onResizeRegion(selectedRegion.id, scaleFactor)
              }
            }}
            placeholder="100"
            min="10"
            max="500"
            step="1"
            className="flex-1 bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <span className="text-gray-300 text-sm flex items-center">%</span>
        </div>
        <p className="text-gray-400 text-xs mt-2">Scale region around its center point. 100% = original size.</p>
      </div>

      <div className="bg-gray-700 rounded p-3 border border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-300">Simplify</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSimplifyRegionVertices(selectedRegion.id, 2)}
            className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-2 rounded"
          >
            Low
          </button>
          <button
            onClick={() => onSimplifyRegionVertices(selectedRegion.id, 5)}
            className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-2 rounded"
          >
            Medium
          </button>
          <button
            onClick={() => onSimplifyRegionVertices(selectedRegion.id, 10)}
            className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-2 rounded"
          >
            High
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">Reduces vertices while preserving the overall outline.</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => {
            if (editMode.isMovingRegion) {
              onCancelMoveRegion()
            } else {
              // Start move mode - user will click on map to set new position
              const center = calculateRegionCenter(selectedRegion)
              onStartMoveRegion(selectedRegion.id, center.x, center.z)
            }
          }}
          className={`flex-1 font-medium py-2 px-4 rounded ${
            editMode.isMovingRegion
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {editMode.isMovingRegion ? 'Cancel Move' : 'Move Region'}
        </button>
        {editMode.isMovingRegion && (
          <div className="flex-1 bg-yellow-900 border border-yellow-600 rounded p-2">
            <p className="text-yellow-200 text-xs text-center">
              Click on map to move region
            </p>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => {
            if (editMode.isSplittingRegion) {
              if (editMode.splitPoints.length === 2) {
                onFinishSplitRegion()
              } else {
                onCancelSplitRegion()
              }
            } else {
              onStartSplitRegion(selectedRegion.id)
            }
          }}
          className={`flex-1 font-medium py-2 px-4 rounded ${
            editMode.isSplittingRegion
              ? editMode.splitPoints.length === 2
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {editMode.isSplittingRegion 
            ? editMode.splitPoints.length === 2 
              ? 'Split Region' 
              : 'Cancel Split'
            : 'Split Region'
          }
        </button>
        {editMode.isSplittingRegion && (
          <div className="flex-1 bg-purple-900 border border-purple-600 rounded p-2">
            <p className="text-purple-200 text-xs text-center">
              Click 2 points on region edge to split ({editMode.splitPoints.length}/2)
            </p>
          </div>
        )}
      </div>

      <YAMLDisplay
        yamlContent={selectedRegion.id} // This will need to be passed from parent
        onCopyYAML={onCopyYAML}
      />

      <VillageManager
        subregions={selectedRegion.subregions || []}
        regionId={selectedRegion.id}
        onRemoveSubregion={onRemoveSubregionFromRegion}
        onUpdateSubregionName={onUpdateSubregionName}
      />

      {/* Clear Data Button - Bottom of sidebar */}
      <div className="mt-auto pt-4 border-t border-gray-600">
        <button
          onClick={onClearData}
          className="w-full text-red-400 hover:text-red-300 text-sm py-2 px-4 rounded border border-red-400 hover:border-red-300 hover:bg-red-900/20 transition-colors"
          title="Clear all saved data"
        >
          Clear All Data
        </button>
      </div>
    </div>
  )
}
