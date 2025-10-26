import { useState, useEffect } from 'react'
import { calculatePolygonArea, formatArea, calculateRegionCenter } from '../utils/polygonUtils'
import { generateRegionName } from '../utils/nameGenerator'
import { Region, EditMode } from '../types'
import { YAMLDisplay } from './YAMLDisplay'
import { VillageManager } from './VillageManager'
import { ArrowLeft, VectorSquare, Plus, Minus, BrushCleaning, Hand, Paintbrush } from 'lucide-react'

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
  const [resizePercentage, setResizePercentage] = useState('100')


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


  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded border border-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">{selectedRegion.name}</h1>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Region name</label>
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





      {!isEditing && (
        <div className="flex space-x-2">
          <button
            onClick={() => onStartEditMode(selectedRegion.id)}
            disabled={editMode.isMovingRegion}
            className={`flex-1 font-medium py-2 px-4 rounded flex items-center justify-center gap-2 ${
              editMode.isMovingRegion
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <VectorSquare className="w-4 h-4" />
            Edit Shape
          </button>
        </div>
      )}

      {isEditing && (
        <div className="mb-4 p-3 bg-green-900 border border-green-600 rounded">
          <p className="text-green-200 text-base">
            <strong>Edit Mode</strong>
          </p>
          <p className="text-green-300 text-sm mt-1">
            Drag green points to move them. Click cyan dots between points to add new points. Double-click green points to delete them.
          </p>
          <button
            onClick={onStopEditMode}
            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
          >
            Done
          </button>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Refine Shape</h4>
        <button
          onClick={() => onSimplifyRegionVertices(selectedRegion.id, 10)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 mb-3"
        >
          <BrushCleaning className="w-4 h-4" />
          Simplify
        </button>
        <div className="flex space-x-2 mb-3">
          <button
            onClick={() => onDoubleRegionVertices(selectedRegion.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Double Vertices
          </button>
          <button
            onClick={() => onHalveRegionVertices(selectedRegion.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            <Minus className="w-4 h-4" />
            Halve Vertices
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              if (isWarping && warpRadius === 200 && warpStrength === 40) {
                onSetWarping(false)
              } else {
                onSetWarpRadius(200)
                onSetWarpStrength(40)
                onSetWarping(true)
              }
            }}
            className={`w-full font-medium py-2 px-4 rounded transition-all border-2 flex items-center justify-center gap-2 ${
              isWarping && warpRadius === 200 && warpStrength === 40
                ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-400'
                : 'bg-transparent hover:bg-orange-900 text-orange-100 border-orange-600'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            Warp Brush L
          </button>
          
          <button
            onClick={() => {
              if (isWarping && warpRadius === 80 && warpStrength === 40) {
                onSetWarping(false)
              } else {
                onSetWarpRadius(80)
                onSetWarpStrength(40)
                onSetWarping(true)
              }
            }}
            className={`w-full font-medium py-2 px-4 rounded transition-all border-2 flex items-center justify-center gap-2 ${
              isWarping && warpRadius === 80 && warpStrength === 40
                ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-400'
                : 'bg-transparent hover:bg-orange-900 text-orange-100 border-orange-600'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            Warp Brush S
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Transform</h4>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-300">Scale: {resizePercentage}%</div>
        </div>
        <div className="mb-2">
          <input
            type="range"
            value={resizePercentage}
            onChange={(e) => {
              const percentage = parseFloat(e.target.value)
              setResizePercentage(percentage.toString())
              
              // Apply resize in real-time
              if (!isNaN(percentage) && percentage > 0 && selectedRegion) {
                const scaleFactor = percentage / 100
                onResizeRegion(selectedRegion.id, scaleFactor)
              }
            }}
            min="10"
            max="200"
            step="1"
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>10%</span>
          <span className="font-medium text-gray-400">100%</span>
          <span>200%</span>
        </div>
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
