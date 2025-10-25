interface TabPanelProps {
  activeTab: 'map' | 'regions' | 'export'
  onTabChange: (tab: 'map' | 'regions' | 'export') => void
}

export function TabPanel({ activeTab, onTabChange }: TabPanelProps) {
  const tabs = [
    { id: 'map', label: '🗺️ Map (Generate PNG)' },
    { id: 'regions', label: '✏️ Regions (Editor)' },
    { id: 'export', label: '💾 Export' }
  ] as const

  return (
    <div className="flex space-x-1 mb-4 bg-gray-700 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-gray-600 text-white shadow'
              : 'text-gray-300 hover:text-white hover:bg-gray-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
