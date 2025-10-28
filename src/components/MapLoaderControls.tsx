import { useState, useCallback, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { saveImageDetails, loadImageDetails, ImageDetails } from '../utils/persistenceUtils'
import { clearSavedData } from '../utils/persistenceUtils'
interface MapLoaderControlsProps {
  onShowImportConfirmation: (callback: () => void) => void
}

export function MapLoaderControls({ onShowImportConfirmation }: MapLoaderControlsProps) {
  const { mapState, regions } = useAppContext()
  const [imageUrl, setImageUrl] = useState('')
  const [seed, setSeed] = useState('')
  const [dimension, setDimension] = useState('overworld')
  const [worldSize, setWorldSize] = useState(8)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadedMapDetails, setLoadedMapDetails] = useState<ImageDetails | null>(null)
  const { setImage, setOffset } = mapState

  // Load saved image details on mount
  useEffect(() => {
    const savedDetails = loadImageDetails()
    if (savedDetails) {
      setLoadedMapDetails(savedDetails)
    }
  }, [])

  // Save image details whenever they change
  useEffect(() => {
    if (loadedMapDetails) {
      saveImageDetails(loadedMapDetails)
    }
  }, [loadedMapDetails])

  const handleImageUrl = useCallback((url: string) => {
    const img = new Image()
    
    // Use proxy for external URLs to avoid CORS issues
    const imageUrl = url.startsWith('http') && !url.includes('localhost') 
      ? `http://localhost:3002/api/proxy-image?url=${encodeURIComponent(url)}`
      : url
    
    console.log('Loading image:', { original: url, proxied: imageUrl })
    
    // Set crossOrigin to anonymous to allow canvas export
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      console.log('Image loaded from URL:', {
        width: img.width,
        height: img.height,
        originalUrl: url,
        loadedFrom: imageUrl
      })
      setImage(img)
      // Center the image
      const canvasWidth = window.innerWidth - 384 // Account for sidebar (w-96 = 384px)
      const canvasHeight = window.innerHeight - 64 // Account for nav bar
      const centerX = (canvasWidth - img.width) / 2
      const centerY = (canvasHeight - img.height) / 2
      console.log('Setting offset:', { centerX, centerY })
      setOffset(centerX, centerY)
      
      // Auto-set origin to center for square images
      if (img.width === img.height) {
        const originX = Math.floor(img.width / 2)
        const originY = Math.floor(img.height / 2)
        mapState.setOrigin(originX, originY)
        console.log('Auto-set origin to center for square image:', { originX, originY })
      }
      
      // Update loaded map details with image size
      setLoadedMapDetails(prev => ({
        ...prev,
        imageSize: { width: img.width, height: img.height }
      }))
    }
    img.onerror = (error) => {
      console.error('Failed to load image:', error)
      alert('Failed to load image from URL. Please check the URL and try again.')
    }
    img.src = imageUrl
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
      // Check if there's existing data that would be lost
      const hasExistingData = regions.regions.length > 0 || 
                             mapState.mapState.image || 
                             mapState.mapState.originSelected
      
      if (hasExistingData) {
        onShowImportConfirmation(performImport)
      } else {
        // No existing data, proceed directly
        performImport()
      }
    }
  }

  const performImport = () => {
    if (generatedImage) {
      // Set map details before importing
      setLoadedMapDetails({
        seed: seed,
        dimension: dimension,
        worldSize: worldSize,
        imageSize: { width: 0, height: 0 } // Will be updated when image loads
      })
      handleImageUrl(generatedImage)
      setGeneratedImage(null)
    }
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (imageUrl.trim()) {
      handleImageUrl(imageUrl.trim())
    }
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all saved data? This will remove the loaded image and all regions.')) {
      clearSavedData()
      setLoadedMapDetails(null)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Load Map Image</h3>
      
      {/* Generate Map Section */}
      <div className="border-b border-gunmetal pb-4">
        <h4 className="text-md font-medium text-gray-300 mb-3">Generate from Seed</h4>
        
         <div className="mb-3">
           <label className="block text-sm font-medium text-gray-300 mb-1">Minecraft Seed:</label>
           <input
             type="text"
             value={seed}
             onChange={(e) => setSeed(e.target.value)}
             placeholder="Enter seed number or text"
             className="w-full px-3 py-2 bg-gray-700 border border-gunmetal rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
             disabled={isLoading}
           />
         </div>

         <div className="mb-3">
           <label className="block text-sm font-medium text-gray-300 mb-1">Dimension:</label>
           <select
             value={dimension}
             onChange={(e) => setDimension(e.target.value)}
             className="w-full px-3 py-2 bg-gray-700 border border-gunmetal rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
             disabled={isLoading}
           >
             <option value="overworld">Overworld</option>
             <option value="nether">Nether</option>
             <option value="end">End</option>
           </select>
         </div>

        {dimension === 'overworld' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              World Size: {worldSize}k ({worldSize * 125}x{worldSize * 125})
            </label>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              value={worldSize}
              onChange={(e) => setWorldSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
          <div className="mb-3 p-2 bg-red-900 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGetMap}
          disabled={!seed.trim() || isLoading}
          className="w-full bg-lapis-lazuli hover:bg-lapis-lazuli/80 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isPolling ? 'Generating Map Image...' : 'Starting Generation...'}
            </div>
          ) : (
            'Generate Map Image'
          )}
        </button>

        {generatedImage && (
          <div className="mt-3">
            <div className="bg-gray-700 rounded p-2 mb-2">
              <img 
                src={generatedImage} 
                alt="Generated map"
                className="w-full h-auto border border-gunmetal rounded"
              />
            </div>
            <button
              onClick={handleImportMap}
              className="w-full bg-viridian hover:bg-viridian/80 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Import Map
            </button>
          </div>
        )}
      </div>
      
      {/* Load from URL Section */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Or Load from URL:</label>
        <form onSubmit={handleUrlSubmit} className="space-y-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gunmetal focus:border-lapis-lazuli focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Load
          </button>
        </form>
      </div>
      
      
      {/* Map Details Panel */}
      {mapState.mapState.image && loadedMapDetails && (
        <div className="mt-4 p-3 bg-lapis-lazuli/20 border border-lapis-lazuli/50 rounded-md">
          <h4 className="text-sm font-semibold text-lapis-lazuli mb-2">Map Details</h4>
          <div className="space-y-1 text-xs text-lapis-lazuli/80">
            {loadedMapDetails.seed && (
              <div><span className="font-medium">Seed:</span> {loadedMapDetails.seed}</div>
            )}
            {loadedMapDetails.dimension && (
              <div><span className="font-medium">Dimension:</span> {loadedMapDetails.dimension}</div>
            )}
            {loadedMapDetails.worldSize && (
              <div><span className="font-medium">World Size:</span> {loadedMapDetails.worldSize}k x {loadedMapDetails.worldSize}k</div>
            )}
            {loadedMapDetails.imageSize && (
              <div><span className="font-medium">Image Size:</span> {loadedMapDetails.imageSize.width} x {loadedMapDetails.imageSize.height}</div>
            )}
          </div>
        </div>
      )}
      
    </div>
  )
}
