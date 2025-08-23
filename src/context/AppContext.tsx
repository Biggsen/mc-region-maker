import { createContext, useContext, ReactNode } from 'react'
import { useRegions } from '../hooks/useRegions'
import { useMapState } from '../hooks/useMapState'

interface AppContextType {
  regions: ReturnType<typeof useRegions>
  mapState: ReturnType<typeof useMapState>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const regions = useRegions()
  const mapState = useMapState()

  return (
    <AppContext.Provider value={{ regions, mapState }}>
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
