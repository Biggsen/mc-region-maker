import { useState, useEffect, useRef } from 'react'
import { AppProvider, useAppContext } from '../context/AppContext'
import { MapCanvas } from './MapCanvas'
import { RegionPanel } from './RegionPanel'
import { ExportPanel } from './ExportPanel'
import { AdvancedPanel } from './AdvancedPanel'
import { LoadingOverlay } from './LoadingOverlay'
import { WorldNameHeading } from './WorldNameHeading'
import { ImageImportHandler } from './ImageImportHandler'
import { MapLoaderControls } from './MapLoaderControls'
import { exportCompleteMap, importMapData, loadImageFromSrc, loadImageFromBase64 } from '../utils/exportUtils'
import { saveActiveTab, loadActiveTab } from '../utils/persistenceUtils'
import { Map, Edit3, Download, FolderOpen, Save, Settings } from 'lucide-react'

type TabType = 'map' | 'regions' | 'export' | 'advanced'

function TabNavigation({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) {
  const { regions, mapState, worldName, spawn, worldType } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Check URL parameter for advanced features
  const urlParams = new URLSearchParams(window.location.search)
  const showAdvancedTab = urlParams.get('advanced') === 'true'
  
  const tabs = [
    { id: 'map', label: 'Map (Generate PNG)', icon: Map },
    { id: 'regions', label: 'Regions (Editor)', icon: Edit3 },
    { id: 'export', label: 'Export', icon: Download },
    ...(showAdvancedTab ? [{ id: 'advanced', label: 'Advanced', icon: Settings }] : [])
  ] as const

  const handleSave = async () => {
    const spawnData = spawn.spawnState.coordinates ? {
      x: spawn.spawnState.coordinates.x,
      z: spawn.spawnState.coordinates.z,
      radius: spawn.spawnState.radius
    } : null
    await exportCompleteMap(regions.regions, mapState.mapState, worldName.worldName, spawnData, worldType.worldType)
  }

  const handleLoad = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const importData = await importMapData(file)
      
      // Load the image if it exists
      if ('imageData' in importData && importData.imageData) {
        // New format with embedded image data
        try {
          const image = await loadImageFromBase64(importData.imageData)
          mapState.setImage(image)
          console.log('Loaded embedded image from complete map export')
        } catch (error) {
          console.warn('Failed to load embedded image, continuing without image')
        }
      } else if (importData.mapState.imageSrc) {
        // Legacy format with image source URL
        try {
          const image = await loadImageFromSrc(importData.mapState.imageSrc)
          mapState.setImage(image)
        } catch (error) {
          console.warn('Failed to load image from import, continuing without image')
        }
      }

      // Update map state
      mapState.setScale(importData.mapState.scale)
      mapState.setOffset(importData.mapState.offsetX, importData.mapState.offsetY)
      mapState.setOriginSelected(importData.mapState.originSelected)
      if (importData.mapState.originOffset) {
        mapState.setOriginOffset(importData.mapState.originOffset)
      }

      // Replace all regions
      regions.replaceRegions(importData.regions)
      regions.setSelectedRegionId(null)

      // Update world name if it exists in import data
      if (importData.worldName) {
        worldName.updateWorldName(importData.worldName)
      }

      // Update world type if it exists in import data
      if (importData.worldType) {
        worldType.setWorldType(importData.worldType)
      }

      // Update spawn coordinates if they exist in import data
      if (importData.spawnCoordinates) {
        spawn.setSpawnCoordinates(importData.spawnCoordinates)
        // Update radius if it exists in import data
        if (importData.spawnCoordinates.radius) {
          spawn.setSpawnRadius(importData.spawnCoordinates.radius)
        }
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      alert('Failed to load project file. Please make sure it\'s a valid project file.')
      console.error('Import error:', error)
    }
  }

  return (
    <div className="flex items-center justify-between bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabType)}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <IconComponent size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={handleLoad} 
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
        >
          <FolderOpen size={16} />
          <span>Load</span>
        </button>
        <button 
          onClick={handleSave} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  )
}

// Component to handle image import within AppProvider context
function MainAppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>(loadActiveTab())

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    saveActiveTab(tab)
  }

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
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="w-96 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
            {activeTab === 'map' && (
              <MapLoaderControls />
            )}
            
            {activeTab === 'regions' && (
              <>
                <WorldNameHeading />
                <RegionPanel />
              </>
            )}
            
            {activeTab === 'export' && (
              <ExportPanel />
            )}
            
            {activeTab === 'advanced' && (
              <AdvancedPanel />
            )}
          </div>
          
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
