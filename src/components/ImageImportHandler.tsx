import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { saveImageDetails } from '../utils/persistenceUtils'

export function ImageImportHandler() {
  const location = useLocation()
  const { mapState, regions, worldName, spawn, seedInfo } = useAppContext()
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    if (location.state?.importImage && !hasProcessedRef.current) {
      hasProcessedRef.current = true // Prevent multiple executions
      const imageUrl = location.state.importImage  // Already full URL from service
      console.log('Loading imported image:', imageUrl)
      
      // Load the image
      const img = new Image()
      
      // Use proxy for external URLs to avoid CORS issues
      const isProduction = import.meta.env.PROD
      const proxyUrl = isProduction 
        ? '/api/proxy-image' 
        : 'http://localhost:3002/api/proxy-image'
      
      const proxiedImageUrl = imageUrl.startsWith('http') && !imageUrl.includes('localhost') 
        ? `${proxyUrl}?url=${encodeURIComponent(imageUrl)}`
        : imageUrl
      
      console.log('Loading imported image:', { original: imageUrl, proxied: proxiedImageUrl })
      
      // Set crossOrigin to anonymous for CORS
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        console.log('Image loaded successfully:', imageUrl)
        
        // Validate image dimensions before proceeding
        const MIN_SIZE = 250
        const MAX_SIZE = 2000
        
        if (img.width !== img.height) {
          alert(`Image must be square (width and height must be equal). Current dimensions: ${img.width}x${img.height}`)
          return
        }
        
        if (img.width < MIN_SIZE || img.height < MIN_SIZE) {
          alert(`Image is too small. Minimum size is ${MIN_SIZE}x${MIN_SIZE}. Current dimensions: ${img.width}x${img.height}`)
          return
        }
        
        if (img.width > MAX_SIZE || img.height > MAX_SIZE) {
          alert(`Image is too large. Maximum size is ${MAX_SIZE}x${MAX_SIZE}. Current dimensions: ${img.width}x${img.height}`)
          return
        }
        
        // Clear all existing data for fresh start
        console.log('Clearing existing data for fresh map import...')
        
        // Clear all regions
        regions.replaceRegions([])
        regions.setSelectedRegionId(null)
        
        // Reset map state to defaults
        mapState.setScale(1)
        mapState.setOffset(0, 0)
        mapState.setOriginSelected(false)
        mapState.setOriginOffset(null)
        
        // Set the new image
        mapState.setImage(img)
        
        // Auto-set origin to center for square images
        if (img.width === img.height) {
          const centerX = Math.floor(img.width / 2)
          const centerY = Math.floor(img.height / 2)
          mapState.setOrigin(centerX, centerY)
          console.log('Auto-set origin to center for square image:', { centerX, centerY })
        }
        
        // Calculate world size from image dimensions (assuming square images)
        const calculatedWorldSize = img.width === img.height 
          ? Math.round(img.width / 125)
          : Math.round(Math.max(img.width, img.height) / 125)
        
        // Save image details for imported image
        saveImageDetails({
          imageSize: { width: img.width, height: img.height },
          worldSize: calculatedWorldSize
        })
        
        // Update seed/dimension from router state if provided
        if (location.state?.seed !== undefined || location.state?.dimension !== undefined) {
          seedInfo.updateSeedInfo({
            seed: location.state.seed,
            dimension: location.state.dimension
          })
        }
        // If not provided, leave World Details as-is (don't clear)
        
        // Reset world name to 'World'
        worldName.updateWorldName('World')
        
        // Clear spawn coordinates
        spawn.setSpawnCoordinates(null)
        
        // Clear the location state to prevent re-importing on refresh
        window.history.replaceState({}, document.title)
      }
      
      img.onerror = (error) => {
        console.error('Failed to load image:', error)
        console.log('Attempted URL:', imageUrl)
        console.log('Image object:', img)
        console.log('Error event:', error)
        
        // Try without crossOrigin as fallback
        if (img.crossOrigin === 'anonymous') {
          console.log('Retrying without crossOrigin...')
          img.crossOrigin = null
          img.src = proxiedImageUrl
          return
        }
        
        alert(`Failed to load image. Make sure the API server is running and accessible.`)
      }
      
      img.src = proxiedImageUrl
    }
  }, [location.state, mapState])

  // Reset the processed flag when location changes
  useEffect(() => {
    hasProcessedRef.current = false
  }, [location.pathname])

  // This component doesn't render anything
  return null
}
