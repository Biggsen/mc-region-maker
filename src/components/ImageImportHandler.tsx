import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export function ImageImportHandler() {
  const location = useLocation()
  const { mapState } = useAppContext()
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    if (location.state?.importImage && !hasProcessedRef.current) {
      hasProcessedRef.current = true // Prevent multiple executions
      const imagePath = location.state.importImage
      console.log('Loading imported image:', imagePath)
      
      // Create image URL from the API server
      const imageUrl = `http://localhost:3001/screenshots/${imagePath}`
      
      // Load the image
      const img = new Image()
      // Set crossOrigin to anonymous for CORS
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        console.log('Image loaded successfully:', imagePath)
        // Set the image in the map state
        mapState.setImage(img)
        
        // Clear the location state to prevent re-importing on refresh
        window.history.replaceState({}, document.title)
        
        // Show success message
        alert(`Map imported successfully! The image "${imagePath}" has been loaded into the canvas.`)
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
          img.src = imageUrl
          return
        }
        
        alert(`Failed to load image: ${imagePath}. Make sure the API server is running and accessible.`)
      }
      
      img.src = imageUrl
    }
  }, [location.state, mapState])

  // Reset the processed flag when location changes
  useEffect(() => {
    hasProcessedRef.current = false
  }, [location.pathname])

  // This component doesn't render anything
  return null
}
