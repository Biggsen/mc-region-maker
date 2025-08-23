import React, { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import { MapCanvas } from './components/MapCanvas'
import { RegionPanel } from './components/RegionPanel'
import { LoadingOverlay } from './components/LoadingOverlay'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hide loading after a short delay to allow data to load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-900 text-white flex">
        <MapCanvas />
        <RegionPanel />
        {isLoading && <LoadingOverlay />}
      </div>
    </AppProvider>
  )
}

export default App
