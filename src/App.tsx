import React from 'react'
import { AppProvider } from './context/AppContext'
import { MapCanvas } from './components/MapCanvas'
import { RegionPanel } from './components/RegionPanel'

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-900 text-white flex">
        <MapCanvas />
        <RegionPanel />
      </div>
    </AppProvider>
  )
}

export default App
