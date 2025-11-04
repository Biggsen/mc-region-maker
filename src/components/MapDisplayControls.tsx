import { useState } from 'react'
import { ChevronRight, ChevronUp, Eye, EyeOff } from 'lucide-react'

interface MapDisplayControlsProps {
  highlightMode: {
    highlightAll: boolean
    showRegions: boolean
    showVillages: boolean
    showCenterPoints: boolean
    showChallengeLevels: boolean
    showGrid: boolean
  }
  orphanedVillageMarkers: any[]
  showOrphanedVillages: boolean
  toggleHighlightAll: () => void
  toggleShowRegions: () => void
  toggleShowVillages: () => void
  toggleShowOrphanedVillages: () => void
  toggleShowCenterPoints: () => void
  toggleShowChallengeLevels: () => void
  toggleShowGrid: () => void
}

export function MapDisplayControls({
  highlightMode,
  orphanedVillageMarkers,
  showOrphanedVillages,
  toggleHighlightAll,
  toggleShowRegions,
  toggleShowVillages,
  toggleShowOrphanedVillages,
  toggleShowCenterPoints,
  toggleShowChallengeLevels,
  toggleShowGrid
}: MapDisplayControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Check URL parameter for advanced features
  const urlParams = new URLSearchParams(window.location.search)
  const showAdvanced = urlParams.get('advanced') === 'true'

  const ToggleButton = ({ 
    isActive, 
    onClick, 
    title, 
    children 
  }: { 
    isActive: boolean
    onClick: () => void
    title: string
    children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
        isActive 
          ? 'bg-gray-700 text-white' 
          : 'text-gray-400 hover:text-gray-300 hover:bg-eerie-back'
      }`}
      title={title}
    >
      {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
      {children}
    </button>
  )

  return (
    <div className="absolute bottom-4 left-[220px] z-10">
      {isExpanded && (
        <div className="mb-2 bg-gray-900/80 backdrop-blur-sm border border-gunmetal rounded-lg px-3 py-3 space-y-1">
          <ToggleButton
            isActive={highlightMode.highlightAll}
            onClick={toggleHighlightAll}
            title="Highlight all regions"
          >
            Highlight All
          </ToggleButton>
          
          <ToggleButton
            isActive={highlightMode.showRegions}
            onClick={toggleShowRegions}
            title="Show/hide regions on map"
          >
            Regions
          </ToggleButton>
          
          {showAdvanced && (
            <ToggleButton
              isActive={highlightMode.showVillages}
              onClick={toggleShowVillages}
              title="Show/hide villages on map"
            >
              Villages
            </ToggleButton>
          )}
          
          {orphanedVillageMarkers.length > 0 && (
            <ToggleButton
              isActive={showOrphanedVillages}
              onClick={toggleShowOrphanedVillages}
              title="Show/hide orphaned village markers"
            >
              Orphaned ({orphanedVillageMarkers.length})
            </ToggleButton>
          )}
          
          {showAdvanced && (
            <ToggleButton
              isActive={highlightMode.showCenterPoints}
              onClick={toggleShowCenterPoints}
              title="Show/hide region hearts on map"
            >
              Hearts
            </ToggleButton>
          )}
          
          {showAdvanced && (
            <ToggleButton
              isActive={highlightMode.showChallengeLevels}
              onClick={toggleShowChallengeLevels}
              title="Show/hide challenge levels on map"
            >
              Levels
            </ToggleButton>
          )}
          
          <ToggleButton
            isActive={highlightMode.showGrid}
            onClick={toggleShowGrid}
            title="Show/hide grid overlay on map"
          >
            Grid
          </ToggleButton>
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors bg-gray-900/80 backdrop-blur-sm border border-gunmetal rounded-lg"
      >
        {isExpanded ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
        Display
      </button>
    </div>
  )
}