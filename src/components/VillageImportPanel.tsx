import React, { useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'

export function VillageImportPanel() {
  const { regions } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [hasVillages, setHasVillages] = useState(false)

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)

    try {
      const content = await file.text()
      const results = regions.importVillagesFromCSV(content)
      
      let message = `Imported ${results.added} villages into regions.`
      if (results.orphaned > 0) {
        message += `\n${results.orphaned} villages were outside all regions and skipped.`
      }
      
      alert(message)
      setHasVillages(results.added > 0)
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const handleRegenerateNames = () => {
    if (confirm('This will regenerate all village names with new medieval names. Continue?')) {
      regions.regenerateVillageNames()
      setHasVillages(true)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const availableRegions = regions.regions.filter(r => r.points.length >= 3)

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Import Villages</h3>
      
      <div className="space-y-3">
        <div className="text-sm text-gray-300">
          Villages will be automatically assigned to regions based on their coordinates.
          Villages outside all regions will be skipped.
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Village CSV File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={triggerFileInput}
            disabled={availableRegions.length === 0 || isImporting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded"
          >
            {isImporting ? 'Importing...' : 'Choose CSV File'}
          </button>
        </div>

        {hasVillages && (
          <button
            onClick={handleRegenerateNames}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
          >
            🎲 Regenerate Village Names
          </button>
        )}

        {availableRegions.length === 0 && (
          <div className="text-yellow-400 text-sm">
            No regions available. Create at least one region first.
          </div>
        )}

        {importError && (
          <div className="text-red-400 text-sm">{importError}</div>
        )}
      </div>
    </div>
  )
}
