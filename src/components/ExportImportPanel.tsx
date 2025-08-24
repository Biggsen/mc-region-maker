import React, { useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { exportMapData, importMapData, loadImageFromSrc } from '../utils/exportUtils'

export function ExportImportPanel() {
  const { regions, mapState } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = () => {
    exportMapData(regions.regions, mapState.mapState)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)

    try {
      const importData = await importMapData(file)
      
      // Load the image if it exists
      if (importData.mapState.imageSrc) {
        try {
          const image = await loadImageFromSrc(importData.mapState.imageSrc)
          mapState.setImage(image)
        } catch (error) {
          console.warn('Failed to load image from import, continuing without image')
        }
      }

      // Update map state
      mapState.setScale(importData.mapState.scale)
      mapState.setOffset(importData.mapState.offsetX, importData.mapState.offsetY)
      mapState.setOriginSelected(importData.mapState.originSelected)
      if (importData.mapState.originOffset) {
        mapState.setOriginOffset(importData.mapState.originOffset)
      }

      // Replace all regions
      regions.replaceRegions(importData.regions)
      regions.setSelectedRegionId(null)

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

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Export & Import Map Data</h3>
      
      <div className="space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            disabled={regions.regions.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Export
          </button>

          <button
            onClick={triggerFileInput}
            disabled={isImporting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {importError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
            {importError}
          </div>
        )}
      </div>
    </div>
  )
}
