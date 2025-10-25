import { useState, useCallback } from 'react'
import { useAppContext } from '../context/AppContext'

export function MapLoaderControls() {
  const { mapState } = useAppContext()
  const [imageUrl, setImageUrl] = useState('http://localhost:3000/mc-map.png')
  const [seed, setSeed] = useState('')
  const [dimension, setDimension] = useState('overworld')
  const [worldSize, setWorldSize] = useState(8)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { setImage, setOffset } = mapState

  const handleImageUrl = useCallback((url: string) => {
    const img = new Image()
    // Set crossOrigin to anonymous to allow canvas export if the server supports CORS
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      console.log('Image loaded from URL:', {
        width: img.width,
        height: img.height
      })
      setImage(img)
      // Center the image
      const canvasWidth = window.innerWidth - 384 // Account for sidebar
      const canvasHeight = window.innerHeight - 64 // Account for nav bar
      const centerX = (canvasWidth - img.width) / 2
      const centerY = (canvasHeight - img.height) / 2
      console.log('Setting offset:', { centerX, centerY })
      setOffset(centerX, centerY)
    }
    img.onerror = () => {
      alert('Failed to load image from URL. Please check the URL and try again.')
    }
    img.src = url
  }, [setImage, setOffset])

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
        handleImageUrl(generatedImage)
        setGeneratedImage(null)
      }
    }
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (imageUrl.trim()) {
      handleImageUrl(imageUrl.trim())
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Load Map Image</h3>
      
      {/* Generate Map Section */}
      <div className="border-b pb-4">
        <h4 className="text-md font-medium text-gray-700 mb-3">Generate from Seed</h4>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Minecraft Seed:</label>
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter seed number or text"
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dimension:</label>
          <select
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          >
            <option value="overworld">Overworld</option>
            <option value="nether">Nether</option>
            <option value="end">End</option>
          </select>
        </div>

        {dimension === 'overworld' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              World Size: {worldSize}k ({worldSize * 125}x{worldSize * 125})
            </label>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              value={worldSize}
              onChange={(e) => setWorldSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
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
          <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGetMap}
          disabled={!seed.trim() || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isPolling ? 'Generating Map... (30-60 seconds)' : 'Starting Generation...'}
            </div>
          ) : (
            'Generate Map'
          )}
        </button>

        {generatedImage && (
          <div className="mt-3">
            <div className="bg-gray-100 rounded p-2 mb-2">
              <img 
                src={generatedImage} 
                alt="Generated map"
                className="w-full h-auto border border-gray-300 rounded"
              />
            </div>
            <button
              onClick={handleImportMap}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Import Map (Fresh Start)
            </button>
            <div className="text-xs text-yellow-600 mt-1">
              ⚠️ This will clear all existing regions and start fresh
            </div>
          </div>
        )}
      </div>
      
      {/* Load from URL Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Or Load from URL:</label>
        <form onSubmit={handleUrlSubmit} className="flex space-x-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="http://localhost:3000/map.png"
            className="flex-1 bg-gray-100 text-gray-800 px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Load
          </button>
        </form>
      </div>
      
      <p className="text-xs text-gray-500">
        After loading an image, click on the compass or a known reference point to set the world center (0,0).
      </p>
    </div>
  )
}
