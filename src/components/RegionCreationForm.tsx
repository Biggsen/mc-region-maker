import { useState, useEffect } from 'react'
import { generateRegionName } from '../utils/nameGenerator'

interface RegionCreationFormProps {
  worldType: 'overworld' | 'nether'
  regionsCount: number
  onStartDrawing: (name: string, freehand: boolean) => void
  onDeleteAllRegions: () => void
}

export function RegionCreationForm({ 
  worldType, 
  regionsCount, 
  onStartDrawing, 
  onDeleteAllRegions 
}: RegionCreationFormProps) {
  const [newRegionName, setNewRegionName] = useState('')
  const [showNewRegionForm, setShowNewRegionForm] = useState(false)
  const [freehandLocal, setFreehandLocal] = useState(false)

  // Generate a random name when the form is shown
  useEffect(() => {
    if (showNewRegionForm && !newRegionName) {
      setNewRegionName(generateRegionName(worldType))
    }
  }, [showNewRegionForm, newRegionName, worldType])

  const handleGenerateNewName = () => {
    setNewRegionName(generateRegionName(worldType))
  }

  const handleStartDrawing = () => {
    if (newRegionName.trim()) {
      onStartDrawing(newRegionName.trim(), freehandLocal)
      setNewRegionName('')
      setShowNewRegionForm(false)
      setFreehandLocal(false)
    }
  }

  if (!showNewRegionForm) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setShowNewRegionForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Create New Region
        </button>
        {regionsCount > 0 && (
          <button
            onClick={onDeleteAllRegions}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
          >
            Delete All Regions
          </button>
        )}
      </div>
    )
  }

  return (
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
      <label className="flex items-center space-x-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={freehandLocal}
          onChange={(e) => setFreehandLocal(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        />
        <span>Freehand (click and drag)</span>
      </label>
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
  )
}
