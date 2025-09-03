import { createContext, useContext, ReactNode } from 'react'
import { useRegions } from '../hooks/useRegions'
import { useMapState } from '../hooks/useMapState'
import { useWorldName } from '../hooks/useWorldName'
import { useSpawn } from '../hooks/useSpawn'

interface AppContextType {
  regions: ReturnType<typeof useRegions>
  mapState: ReturnType<typeof useMapState>
  worldName: ReturnType<typeof useWorldName>
  spawn: ReturnType<typeof useSpawn>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const regions = useRegions()
  const mapState = useMapState()
  const worldName = useWorldName()
  const spawn = useSpawn()

  return (
    <AppContext.Provider value={{ regions, mapState, worldName, spawn }}>
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
