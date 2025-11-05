import { createContext, useContext, ReactNode } from 'react'
import { useRegions } from '../hooks/useRegions'
import { useMapState } from '../hooks/useMapState'
import { useWorldName } from '../hooks/useWorldName'
import { useSpawn } from '../hooks/useSpawn'
import { useMapCanvas } from '../hooks/useMapCanvas'
import { useWorldType } from '../hooks/useWorldType'
import { useCustomMarkers } from '../hooks/useCustomMarkers'
import { useSeedInfo } from '../hooks/useSeedInfo'
import { useToast } from '../hooks/useToast'

interface AppContextType {
  regions: ReturnType<typeof useRegions>
  mapState: ReturnType<typeof useMapState>
  worldName: ReturnType<typeof useWorldName>
  spawn: ReturnType<typeof useSpawn>
  mapCanvas: ReturnType<typeof useMapCanvas>
  worldType: ReturnType<typeof useWorldType>
  customMarkers: ReturnType<typeof useCustomMarkers>
  seedInfo: ReturnType<typeof useSeedInfo>
  toast: ReturnType<typeof useToast>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const worldType = useWorldType()
  const regions = useRegions(worldType.worldType)
  const mapState = useMapState()
  const worldName = useWorldName()
  const spawn = useSpawn()
  const mapCanvas = useMapCanvas()
  const customMarkers = useCustomMarkers()
  const seedInfo = useSeedInfo()
  const toast = useToast()

  return (
    <AppContext.Provider value={{ regions, mapState, worldName, spawn, mapCanvas, worldType, customMarkers, seedInfo, toast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
