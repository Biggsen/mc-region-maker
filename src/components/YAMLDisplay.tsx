import { useState } from 'react'

interface YAMLDisplayProps {
  yamlContent: string
  onCopyYAML: (yaml: string) => void
}

export function YAMLDisplay({ yamlContent, onCopyYAML }: YAMLDisplayProps) {
  const [showYAML, setShowYAML] = useState(false)

  const handleCopyYAML = async () => {
    await onCopyYAML(yamlContent)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-white">YAML Output</h3>
        <button
          onClick={() => setShowYAML(!showYAML)}
          className="text-lapis-lazuli/80 hover:text-lapis-lazuli text-sm"
        >
          {showYAML ? 'Hide' : 'Show'}
        </button>
      </div>
      {showYAML && (
        <div className="space-y-2">
          <pre className="bg-gray-900 text-zomp/80 p-3 rounded text-xs overflow-x-auto">
            {yamlContent}
          </pre>
          <button
            onClick={handleCopyYAML}
            className="w-full bg-lapis-lazuli hover:bg-lapis-lazuli/80 text-white font-medium py-2 px-4 rounded"
          >
            Copy YAML
          </button>
        </div>
      )}
    </div>
  )
}
