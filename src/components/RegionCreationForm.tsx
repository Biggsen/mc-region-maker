import { useState, useEffect } from 'react'
import { generateRegionName } from '../utils/nameGenerator'

interface RegionCreationFormProps {
  worldType: 'overworld' | 'nether'
  onStartDrawing: (name: string, freehand: boolean) => void
  onCancelDrawing: () => void
  isDrawing: boolean
}

export function RegionCreationForm({ 
  worldType, 
  onStartDrawing,
  onCancelDrawing,
  isDrawing
}: RegionCreationFormProps) {
  const [newRegionName, setNewRegionName] = useState('')
  const [showNewRegionForm, setShowNewRegionForm] = useState(false)

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
      onStartDrawing(newRegionName.trim(), true)
      setNewRegionName('')
      setShowNewRegionForm(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => {
          if (isDrawing) {
            onCancelDrawing()
          } else {
            setShowNewRegionForm(!showNewRegionForm)
          }
        }}
        className="w-full bg-lapis-lazuli hover:bg-lapis-lazuli/80 text-white font-medium py-2 px-4 rounded"
      >
        {isDrawing ? 'Cancel' : (showNewRegionForm ? 'Cancel' : 'Create New Region')}
      </button>
      
      {showNewRegionForm && (
        <div className="space-y-2 p-3 bg-gray-700 rounded border border-gunmetal">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Region Name
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                placeholder="Enter region name"
                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-lapis-lazuli focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleStartDrawing()}
              />
              <button
                onClick={handleGenerateNewName}
                className="bg-violet-blue hover:bg-violet-blue/80 text-white px-3 py-2 rounded border border-violet-blue/80 focus:outline-none"
                title="Generate random medieval name"
              >
                🎲
              </button>
            </div>
          </div>
          <button
            onClick={handleStartDrawing}
            className="w-full bg-viridian hover:bg-viridian/80 text-white font-medium py-2 px-4 rounded"
          >
            Start drawing region
          </button>
        </div>
      )}
    </div>
  )
}
