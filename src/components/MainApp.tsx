import { useState, useEffect } from 'react'
import { AppProvider, useAppContext } from '../context/AppContext'
import { MapCanvas } from './MapCanvas'
import { RegionPanel } from './RegionPanel'
import { ExportImportPanel } from './ExportImportPanel'
import { LoadingOverlay } from './LoadingOverlay'
import { WorldNameHeading } from './WorldNameHeading'
import { SpawnButton } from './SpawnButton'
import { ImageImportHandler } from './ImageImportHandler'
import { MapLoaderControls } from './MapLoaderControls'

type TabType = 'map' | 'regions' | 'export'

function TabNavigation({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) {
  
  const tabs = [
    { id: 'map', label: '🗺️ Map (Generate PNG)' },
    { id: 'regions', label: '✏️ Regions (Editor)' },
    { id: 'export', label: '💾 Export' }
  ] as const

  return (
    <div className="flex items-center bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Component to handle image import within AppProvider context
function MainAppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('map')
  const { worldType, mapState } = useAppContext()

  useEffect(() => {
    // Hide loading after a short delay to allow data to load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <ImageImportHandler />
      <div className="h-screen bg-gray-900 text-white flex flex-col relative">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex overflow-hidden">
          {(activeTab !== 'map' || !mapState.mapState.image) && (
            <div className="w-96 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
              {activeTab === 'map' && (
                <MapLoaderControls />
              )}
              
              {activeTab === 'regions' && (
                <>
                  <WorldNameHeading />
                  {worldType.worldType !== 'nether' && <SpawnButton />}
                  <RegionPanel />
                </>
              )}
              
              {activeTab === 'export' && (
                <ExportImportPanel />
              )}
            </div>
          )}
          
          <div className="flex-1 h-full">
            <MapCanvas />
          </div>
        </div>
        
        {isLoading && <LoadingOverlay />}
      </div>
    </>
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
