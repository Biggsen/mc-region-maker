import { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import { MapCanvas } from './components/MapCanvas'
import { RegionPanel } from './components/RegionPanel'
import { ExportImportPanel } from './components/ExportImportPanel'
import { LoadingOverlay } from './components/LoadingOverlay'
import { WorldNameHeading } from './components/WorldNameHeading'

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
        <div className="w-80 bg-gray-800 p-4 overflow-y-auto h-screen">
          <WorldNameHeading />
          <ExportImportPanel />
          <RegionPanel />
        </div>
        {isLoading && <LoadingOverlay />}
      </div>
    </AppProvider>
  )
}

export default App
