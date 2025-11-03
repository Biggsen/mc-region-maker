import { useState, useEffect } from 'react'
import { generateRegionName } from '../utils/nameGenerator'
import { Button } from './Button'

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
      {!showNewRegionForm && !isDrawing ? (
        <Button
          variant="primary"
          onClick={() => setShowNewRegionForm(true)}
          className="w-full"
        >
          Create New Region
        </Button>
      ) : null}
      
      {showNewRegionForm && (
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-white">New region</h4>
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
                className="flex-1 bg-input-bg text-input-text px-3 py-2 rounded border border-input-border focus:border-lapis-lighter focus:outline-none placeholder:text-gray-500"
                onKeyPress={(e) => e.key === 'Enter' && handleStartDrawing()}
              />
              <Button
                variant="ghost"
                onClick={handleGenerateNewName}
                className="px-3 py-2"
                title="Generate random medieval name"
              >
                🎲
              </Button>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowNewRegionForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStartDrawing}
              className="flex-1"
            >
              Draw region
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
