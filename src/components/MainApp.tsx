import { useState, useEffect } from 'react'
import { AppProvider } from '../context/AppContext'
import { MapCanvas } from './MapCanvas'
import { RegionPanel } from './RegionPanel'
import { ExportImportPanel } from './ExportImportPanel'
import { LoadingOverlay } from './LoadingOverlay'
import { WorldNameHeading } from './WorldNameHeading'
import { SpawnButton } from './SpawnButton'

function MainAppContent() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hide loading after a short delay to allow data to load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex relative">
      <div className="flex-1 min-w-0">
        <MapCanvas />
      </div>
      <div className="w-80 bg-gray-800 p-4 overflow-y-auto h-screen flex-shrink-0 fixed right-0 top-0 z-10">
        <WorldNameHeading />
        <ExportImportPanel />
        <SpawnButton />
        <RegionPanel />
      </div>
      {isLoading && <LoadingOverlay />}
    </div>
  )
}

function MainApp() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  )
}

export default MainApp
