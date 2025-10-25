interface MapControlsProps {
  highlightMode: {
    highlightAll: boolean
    showVillages: boolean
    showCenterPoints: boolean
    showChallengeLevels: boolean
    showGrid: boolean
  }
  orphanedVillageMarkers: any[]
  showOrphanedVillages: boolean
  toggleHighlightAll: () => void
  toggleShowVillages: () => void
  toggleShowOrphanedVillages: () => void
  toggleShowCenterPoints: () => void
  toggleShowChallengeLevels: () => void
  toggleShowGrid: () => void
}

export function MapControls({
  highlightMode,
  orphanedVillageMarkers,
  showOrphanedVillages,
  toggleHighlightAll,
  toggleShowVillages,
  toggleShowOrphanedVillages,
  toggleShowCenterPoints,
  toggleShowChallengeLevels,
  toggleShowGrid
}: MapControlsProps) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-300 mb-2">Map Display</h4>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={toggleHighlightAll}
          className={`text-sm px-2 py-1 rounded border ${
            highlightMode.highlightAll
              ? 'bg-yellow-600 text-white border-yellow-500'
              : 'text-yellow-400 hover:text-yellow-300 border-yellow-400 hover:border-yellow-300'
          }`}
          title="Highlight all regions"
        >
          {highlightMode.highlightAll ? 'Hide' : 'Highlight'} All
        </button>
        <button
          onClick={toggleShowVillages}
          className={`text-sm px-2 py-1 rounded border ${
            highlightMode.showVillages
              ? 'bg-orange-600 text-white border-orange-500'
              : 'text-orange-400 hover:text-orange-300 border-orange-400 hover:border-orange-300'
          }`}
          title="Show/hide villages on map"
        >
          {highlightMode.showVillages ? 'Hide' : 'Show'} Villages
        </button>
        {orphanedVillageMarkers.length > 0 && (
          <button
            onClick={toggleShowOrphanedVillages}
            className={`text-sm px-2 py-1 rounded border ${
              showOrphanedVillages
                ? 'bg-amber-600 text-white border-amber-500'
                : 'text-amber-400 hover:text-amber-300 border-amber-400 hover:border-amber-300'
            }`}
            title="Show/hide orphaned village markers"
          >
            {showOrphanedVillages ? 'Hide' : 'Show'} Orphaned ({orphanedVillageMarkers.length})
          </button>
        )}
        <button
          onClick={toggleShowCenterPoints}
          className={`text-sm px-2 py-1 rounded border ${
            highlightMode.showCenterPoints
              ? 'bg-purple-600 text-white border-purple-500'
              : 'text-purple-400 hover:text-purple-300 border-purple-400 hover:border-purple-300'
          }`}
          title="Show/hide region hearts on map"
        >
          {highlightMode.showCenterPoints ? 'Hide' : 'Show'} Hearts
        </button>
        <button
          onClick={toggleShowChallengeLevels}
          className={`text-sm px-2 py-1 rounded border ${
            highlightMode.showChallengeLevels
              ? 'bg-cyan-600 text-white border-cyan-500'
              : 'text-cyan-400 hover:text-cyan-300 border-cyan-400 hover:border-cyan-300'
          }`}
          title="Show/hide challenge levels on map"
        >
          {highlightMode.showChallengeLevels ? 'Hide' : 'Show'} Levels
        </button>
        <button
          onClick={toggleShowGrid}
          className={`text-sm px-2 py-1 rounded border ${
            highlightMode.showGrid
              ? 'bg-gray-600 text-white border-gray-500'
              : 'text-gray-400 hover:text-gray-300 border-gray-400 hover:border-gray-300'
          }`}
          title="Show/hide grid overlay on map"
        >
          {highlightMode.showGrid ? 'Hide' : 'Show'} Grid
        </button>
      </div>
    </div>
  )
}
