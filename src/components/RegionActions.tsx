import { useState } from 'react'
import { ChallengeLevel } from '../types'

interface Region {
  id: string
  name: string
  challengeLevel?: ChallengeLevel
  hasSpawn?: boolean
}

interface RegionActionsProps {
  regions: Region[]
  onRandomizeChallengeLevels: () => void
}

export function RegionActions({ regions, onRandomizeChallengeLevels }: RegionActionsProps) {
  const [showChallengeCounts, setShowChallengeCounts] = useState(false)

  const getChallengeLevelCounts = () => {
    const counts = {
      Vanilla: 0,
      Bronze: 0,
      Silver: 0,
      Gold: 0,
      Platinum: 0
    }
    
    regions.forEach(region => {
      const level = region.challengeLevel || 'Vanilla'
      counts[level]++
    })
    
    return counts
  }

  return (
    <div className="mb-4">
      <button
        onClick={onRandomizeChallengeLevels}
        className="text-green-400 hover:text-green-300 text-sm px-3 py-2 rounded border border-green-400 hover:border-green-300 hover:bg-green-900/20 transition-colors"
        title="Randomize challenge levels with balanced distribution (2 Platinum, 4 Gold, 6 Silver, 8 Bronze, rest Vanilla)"
        disabled={regions.length === 0}
      >
        🎲 Randomize Challenge Levels
      </button>
      
      {/* Challenge Level Counts */}
      <div className="mt-3">
        <span
          onClick={() => setShowChallengeCounts(!showChallengeCounts)}
          className="text-white text-xs cursor-pointer hover:text-gray-300 transition-colors"
          title="Show/hide challenge level counts"
        >
          {showChallengeCounts ? '▼' : '▶'} Show Counts
        </span>
        
        {showChallengeCounts && (
          <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-600">
            <h5 className="text-sm font-medium text-gray-300 mb-2">Challenge Level Distribution</h5>
            {(() => {
              const counts = getChallengeLevelCounts()
              return (
                <div className="space-y-1">
                  {Object.entries(counts).map(([level, count]) => (
                    <div key={level} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{level}:</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-600 pt-1 mt-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-300">Total:</span>
                      <span className="text-white">{regions.length}</span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
