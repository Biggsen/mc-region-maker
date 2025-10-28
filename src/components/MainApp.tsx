import { useState, useEffect, useRef } from 'react'
import { AppProvider, useAppContext } from '../context/AppContext'
import { MapCanvas } from './MapCanvas'
import { RegionPanel } from './RegionPanel'
import { ExportPanel } from './ExportPanel'
import { AdvancedPanel } from './AdvancedPanel'
import { LoadingOverlay } from './LoadingOverlay'
import { ImageImportHandler } from './ImageImportHandler'
import { MapLoaderControls } from './MapLoaderControls'
import { exportCompleteMap, importMapData, loadImageFromSrc, loadImageFromBase64 } from '../utils/exportUtils'
import { saveActiveTab, loadActiveTab } from '../utils/persistenceUtils'
import { Map, Edit3, Download, FolderOpen, Save, Settings } from 'lucide-react'
import { ImportConfirmationModal } from './ImportConfirmationModal'

type TabType = 'map' | 'regions' | 'export' | 'advanced'

function TabNavigation({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) {
  const { regions, mapState, worldName, spawn, worldType } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLoadModal, setShowLoadModal] = useState(false)
  
  // Check URL parameter for advanced features
  const urlParams = new URLSearchParams(window.location.search)
  const showAdvancedTab = urlParams.get('advanced') === 'true'
  
  const tabs = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'regions', label: 'Regions', icon: Edit3 },
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

  const hasExistingData = () => {
    return (
      regions.regions.length > 0 ||
      mapState.mapState.image !== null ||
      worldName.worldName !== 'world' ||
      spawn.spawnState.coordinates !== null
    )
  }

  const handleLoadClick = () => {
    if (hasExistingData()) {
      // Show confirmation modal first
      setShowLoadModal(true)
    } else {
      // No data exists, proceed directly to file selection
      fileInputRef.current?.click()
    }
  }
  
  const confirmLoad = () => {
    setShowLoadModal(false)
    // Now trigger file input after confirmation
    fileInputRef.current?.click()
  }
  
  const cancelLoad = () => {
    setShowLoadModal(false)
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
    <div className="flex items-center justify-between bg-eerie-back border-b border-gunmetal px-4 py-3">
      <div className="flex space-x-8">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabType)}
              className={`text-lg py-2 font-medium transition-colors flex items-center space-x-2 relative border-b-4 ${
                activeTab === tab.id
                  ? 'text-vista-blue border-vista-blue'
                  : 'text-gray-300 hover:text-white border-transparent'
              }`}
            >
              <IconComponent size={20} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
      
      <div className="flex items-center">
        <span className="text-3xl font-bold text-white">Region Forge</span>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={handleLoadClick} 
          className="px-4 py-2 bg-viridian/5 hover:bg-viridian/10 active:bg-viridian/20 border-2 border-viridian text-gray-300 rounded-md transition-colors font-medium flex items-center space-x-2"
        >
          <FolderOpen size={16} />
          <span>Load</span>
        </button>
        <button 
          onClick={handleSave} 
          className="px-4 py-2 bg-gunmetal hover:bg-hover-surface active:bg-active-surface border-2 border-white/10 text-gray-300 rounded-md transition-colors font-medium flex items-center space-x-2"
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
      
      <ImportConfirmationModal
        isOpen={showLoadModal}
        onConfirm={confirmLoad}
        onCancel={cancelLoad}
        title="Load Project File"
        message="Loading a project file will replace all current data."
        warningMessage="⚠️ All existing regions, map, and settings will be lost."
        confirmLabel="Load Project"
      />
    </div>
  )
}

// Component to handle image import within AppProvider context
function MainAppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>(loadActiveTab())
  const [showImportModal, setShowImportModal] = useState(false)
  const [importCallback, setImportCallback] = useState<(() => void) | null>(null)

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    saveActiveTab(tab)
  }

  const showImportConfirmation = (callback: () => void) => {
    setImportCallback(() => callback)
    setShowImportModal(true)
  }

  const confirmImport = () => {
    if (importCallback) {
      importCallback()
      // Auto-switch to Regions tab after successful import
      setActiveTab('regions')
      saveActiveTab('regions')
    }
    setShowImportModal(false)
    setImportCallback(null)
  }

  const cancelImport = () => {
    setShowImportModal(false)
    setImportCallback(null)
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
          <div className="w-96 bg-eerie-back p-4 overflow-y-auto border-r border-gunmetal">
            {activeTab === 'map' && (
              <MapLoaderControls onShowImportConfirmation={showImportConfirmation} />
            )}
            
            {activeTab === 'regions' && (
              <RegionPanel />
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
        
        <ImportConfirmationModal
          isOpen={showImportModal}
          onConfirm={confirmImport}
          onCancel={cancelImport}
        />
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
