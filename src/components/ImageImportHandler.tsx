import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { saveImageDetails } from '../utils/persistenceUtils'

export function ImageImportHandler() {
  const location = useLocation()
  const { mapState, regions, worldName, spawn } = useAppContext()
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    if (location.state?.importImage && !hasProcessedRef.current) {
      hasProcessedRef.current = true // Prevent multiple executions
      const imageUrl = location.state.importImage  // Already full URL from service
      console.log('Loading imported image:', imageUrl)
      
      // Load the image
      const img = new Image()
      
      // Use proxy for external URLs to avoid CORS issues
      const proxiedImageUrl = imageUrl.startsWith('http') && !imageUrl.includes('localhost') 
        ? `http://localhost:3002/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
        : imageUrl
      
      console.log('Loading imported image:', { original: imageUrl, proxied: proxiedImageUrl })
      
      // Set crossOrigin to anonymous for CORS
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        console.log('Image loaded successfully:', imageUrl)
        
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
        
        // Clear image details for imported image (no seed/dimension info)
        saveImageDetails({
          imageSize: { width: img.width, height: img.height }
        })
        
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
