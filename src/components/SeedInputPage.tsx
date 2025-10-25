import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SeedInputPage() {
  const [seed, setSeed] = useState('')
  const [dimension, setDimension] = useState('overworld')
  const [worldSize, setWorldSize] = useState(8)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
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
      // Step 1: Start generation job
      const generateResponse = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          seed: seed.trim(),
          dimension: dimension,
          size: worldSize
        })
      })
      
      if (!generateResponse.ok) {
        throw new Error('Failed to start map generation')
      }
      
      const generateResult = await generateResponse.json()
      
      if (!generateResult.success) {
        throw new Error(generateResult.error || 'Failed to start generation')
      }
      
      const jobId = generateResult.jobId
      console.log('Job started:', jobId)
      
      setIsPolling(true)
      
      // Step 2: Poll for status
      const maxAttempts = 20  // 100 seconds max (20 polls * 5 seconds)
      let attempts = 0
      
      const pollStatus = async (): Promise<string> => {
        const statusResponse = await fetch(`http://localhost:3001/api/status/${jobId}`)
        
        if (!statusResponse.ok) {
          throw new Error('Failed to check job status')
        }
        
        const statusResult = await statusResponse.json()
        
        if (statusResult.status === 'ready') {
          return statusResult.imageUrl
        }
        
        if (statusResult.status === 'failed') {
          const errorMsg = statusResult.message || 'Map generation failed'
          const retryable = statusResult.retryable
          throw new Error(`${errorMsg}${retryable ? ' (You can retry)' : ''}`)
        }
        
        // Still processing
        attempts++
        if (attempts >= maxAttempts) {
          throw new Error('Map generation timed out. Please try again.')
        }
        
        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000))
        return pollStatus()
      }
      
      const imageUrl = await pollStatus()
      setGeneratedImage(imageUrl)
      
    } catch (error) {
      console.error('Error generating map:', error)
      if (error instanceof TypeError) {
        setError('Cannot connect to map generator service. Is it running?')
      } else {
        setError(error instanceof Error ? error.message : 'Failed to generate map. Make sure the API server is running.')
      }
    } finally {
      setIsLoading(false)
      setIsPolling(false)
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

        {dimension === 'overworld' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              World Size: {worldSize}k ({worldSize * 125}x{worldSize * 125})
            </label>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              value={worldSize}
              onChange={(e) => setWorldSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>2k</span>
              <span>4k</span>
              <span>6k</span>
              <span>8k</span>
              <span>10k</span>
              <span>12k</span>
              <span>14k</span>
              <span>16k</span>
            </div>
          </div>
        )}

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
              {isPolling ? 'Generating Map... (30-60 seconds)' : 'Starting Generation...'}
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
                src={generatedImage} 
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
          <p>This will generate a high-quality map screenshot showing:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Biome information</li>
            <li>Village locations (Overworld only)</li>
            <li>Clean interface without UI elements</li>
            <li>8K World Size: 1000x1000 final image</li>
            <li>16K World Size: 2000x2000 final image</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
