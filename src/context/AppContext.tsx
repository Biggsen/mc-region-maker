import { createContext, useContext, ReactNode } from 'react'
import { useRegions } from '../hooks/useRegions'
import { useMapState } from '../hooks/useMapState'
import { useWorldName } from '../hooks/useWorldName'
import { useSpawn } from '../hooks/useSpawn'
import { useMapCanvas } from '../hooks/useMapCanvas'
import { useWorldType } from '../hooks/useWorldType'
import { useCustomMarkers } from '../hooks/useCustomMarkers'

interface AppContextType {
  regions: ReturnType<typeof useRegions>
  mapState: ReturnType<typeof useMapState>
  worldName: ReturnType<typeof useWorldName>
  spawn: ReturnType<typeof useSpawn>
  mapCanvas: ReturnType<typeof useMapCanvas>
  worldType: ReturnType<typeof useWorldType>
  customMarkers: ReturnType<typeof useCustomMarkers>
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

  return (
    <AppContext.Provider value={{ regions, mapState, worldName, spawn, mapCanvas, worldType, customMarkers }}>
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
