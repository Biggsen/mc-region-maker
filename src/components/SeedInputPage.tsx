import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SeedInputPage() {
  const [seed, setSeed] = useState('')
  const [dimension, setDimension] = useState('overworld')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleGetMap = async () => {
    if (!seed.trim()) {
      setError('Please enter a seed')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/generate-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          seed: seed.trim(),
          dimension: dimension
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate map')
      }
      
      const result = await response.json()
      setGeneratedImage(result.imagePath)
    } catch (error) {
      console.error('Error generating map:', error)
      setError('Failed to generate map. Make sure the API server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportMap = () => {
    if (generatedImage) {
      const confirmed = confirm(
        'Importing this map will clear all existing regions and start fresh.\n\n' +
        'This includes:\n' +
        '• All existing regions and polygons\n' +
        '• All village data\n' +
        '• Current world name\n' +
        '• Spawn coordinates\n' +
        '• Map zoom and position\n\n' +
        'Are you sure you want to continue?'
      )
      
      if (confirmed) {
        // Navigate to main app with the image
        navigate('/', { state: { importImage: generatedImage } })
      }
    }
  }

  const handleBackToMain = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Generate Minecraft Map</h1>
          <button
            onClick={handleBackToMain}
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back to Main App
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Minecraft Seed:</label>
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter seed number or text"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter any Minecraft seed to generate a map
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Dimension:</label>
          <select
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="overworld">Overworld</option>
            <option value="nether">Nether</option>
            <option value="end">End</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Choose which dimension to generate
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-md">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleGetMap}
          disabled={!seed.trim() || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 px-4 rounded-md mb-4 transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Map...
            </div>
          ) : (
            'Get Map'
          )}
        </button>

        {generatedImage && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Generated Map:</h3>
            <div className="bg-gray-700 rounded-md p-2">
              <img 
                src={`http://localhost:3001/screenshots/${generatedImage}`} 
                alt="Generated map"
                className="w-full h-auto border border-gray-600 rounded"
              />
            </div>
            <button
              onClick={handleImportMap}
              className="w-full bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md mt-4 transition-colors"
            >
              Import Map (Fresh Start)
            </button>
            
            <div className="text-xs text-yellow-600 mt-2">
              ⚠️ This will clear all existing regions and start fresh with this map
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400">
          <p>This will generate a high-quality 2000x2000 map screenshot showing:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Biome information</li>
            <li>Village locations (Overworld only)</li>
            <li>Clean interface without UI elements</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
