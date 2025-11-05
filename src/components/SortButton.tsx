import { ArrowUp, ArrowDown } from 'lucide-react'

interface SortButtonProps {
  sortKey: 'name' | 'size' | 'newest'
  currentSort: 'name' | 'size' | 'newest'
  sortOrder: 'asc' | 'desc'
  label: string
  onClick: () => void
}

export function SortButton({ sortKey, currentSort, sortOrder, label, onClick }: SortButtonProps) {
  const isActive = currentSort === sortKey
  
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-sm border transition-colors flex items-center gap-1 ${
        isActive
          ? 'bg-outer-space border-outer-space text-white'
          : 'bg-input-bg border-input-border text-gray-300 hover:bg-gunmetal hover:border-outer-space'
      }`}
    >
      {label}
      {isActive && (
        sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
      )}
    </button>
  )
}

