import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { saveImageDetails } from '../utils/persistenceUtils'
import { validateImageDimensions } from '../utils/imageValidation'
import { getImageProxyUrl } from '../utils/imageUtils'

export function ImageImportHandler() {
  const location = useLocation()
  const { mapState, regions, worldName, spawn, seedInfo, toast } = useAppContext()
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    if (location.state?.importImage && !hasProcessedRef.current) {
      hasProcessedRef.current = true // Prevent multiple executions
      const imageUrl = location.state.importImage  // Already full URL from service
      
      // Load the image
      const img = new Image()
      
      // Use proxy for external URLs to avoid CORS issues
      const proxiedImageUrl = getImageProxyUrl(imageUrl)
      
      // Set crossOrigin to anonymous for CORS
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        // Validate image dimensions before proceeding
        const validation = validateImageDimensions(img.width, img.height)
        if (!validation.isValid) {
          toast.showToast(validation.error || 'Image validation failed', 'error')
          return
        }
        
        // Clear all existing data for fresh start
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
        
        // Try without crossOrigin as fallback
        if (img.crossOrigin === 'anonymous') {
          img.crossOrigin = null
          img.src = proxiedImageUrl
          return
        }
        
        toast.showToast('Failed to load image. Make sure the API server is running and accessible.', 'error')
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
