import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { canvasToImage, pixelToWorld, isPointInPolygon } from '../utils/coordinateUtils'
import { GridOverlay } from './GridOverlay'
import { RegionOverlay } from './RegionOverlay'

export function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { mapState: mapStateHook, regions } = useAppContext()
  const { mapState, setImage, setOffset, setOrigin, startDragging, stopDragging, handleMouseMove, handleWheel } = mapStateHook
  const { 
    drawingRegion, 
    addPointToDrawing, 
    finishDrawingRegion, 
    selectedRegionId,
    editMode,
    startDraggingPoint,
    stopDraggingPoint,
    updatePointPosition,
    addPointToRegion
  } = regions
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  // Debug mapState changes
  useEffect(() => {
    console.log('MapState changed:', {
      hasImage: !!mapState.image,
      imageWidth: mapState.image?.width,
      imageHeight: mapState.image?.height,
      offsetX: mapState.offsetX,
      offsetY: mapState.offsetY,
      scale: mapState.scale
    })
  }, [mapState.image, mapState.offsetX, mapState.offsetY, mapState.scale])

  // Handle space key for panning mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isSpacePressed])

  // Determine cursor style based on current mode
  const getCursorStyle = () => {
    if (editMode.isEditing) {
      return editMode.draggingPointIndex !== null ? 'cursor-grabbing' : 'cursor-grab'
    }
    if (mapState.isDragging && isSpacePressed) {
      return 'cursor-grabbing'
    }
    if (isSpacePressed) {
      return 'cursor-grab'
    }
    if (!mapState.originSelected && mapState.image) {
      return 'cursor-crosshair'
    }
    if (drawingRegion) {
      return 'cursor-crosshair'
    }
    return 'cursor-default'
  }

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !mapState.image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    console.log('Drawing map:', {
      imageWidth: mapState.image.width,
      imageHeight: mapState.image.height,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      offsetX: mapState.offsetX,
      offsetY: mapState.offsetY,
      scale: mapState.scale
    })

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image
    ctx.save()
    ctx.translate(mapState.offsetX, mapState.offsetY)
    ctx.scale(mapState.scale, mapState.scale)
    ctx.drawImage(mapState.image, 0, 0)
    ctx.restore()
  }, [mapState.image, mapState.scale, mapState.offsetX, mapState.offsetY])

  // Draw map whenever state changes
  useEffect(() => {
    if (mapState.image) {
      drawMap()
    }
  }, [drawMap])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (e.button === 0) { // Left click
      // If in edit mode, don't handle other interactions
      if (editMode.isEditing) {
        return
      }

      if (isSpacePressed) {
        // Prioritize panning when space is pressed
        startDragging(x, y)
      } else if (!mapState.originSelected && mapState.image) {
        // Set origin
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        setOrigin(imagePos.x, imagePos.y)
      } else if (drawingRegion) {
        // Check if clicking near a previous point to close polygon
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image!.width, mapState.image!.height, mapState.originOffset)
        
        // Check if clicking near any previous point (within 10 pixels tolerance)
        const tolerance = 10 / mapState.scale // Convert to world coordinates
        const isNearPreviousPoint = drawingRegion.points.some(point => {
          const distance = Math.sqrt(
            Math.pow(point.x - worldPos.x, 2) + Math.pow(point.z - worldPos.z, 2)
          )
          return distance <= tolerance
        })
        
        if (isNearPreviousPoint && drawingRegion.points.length >= 3) {
          // Close the polygon
          finishDrawingRegion()
        } else {
          // Add point to drawing region
          addPointToDrawing(worldPos.x, worldPos.z)
        }
      } else if (mapState.image && mapState.originSelected) {
        // Check if clicking on a region
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image.width, mapState.image.height, mapState.originOffset)
        
        // Check each region to see if the click is inside
        for (let i = regions.regions.length - 1; i >= 0; i--) {
          const region = regions.regions[i]
          if (isPointInPolygon(worldPos, region.points)) {
            regions.setSelectedRegionId(region.id)
            return // Stop checking once we find a region
          }
        }
        
        // If no region was clicked, deselect
        regions.setSelectedRegionId(null)
      }
      // Note: Panning is only allowed when space key is pressed (handled in the first condition)
    }
  }, [mapState.originSelected, mapState.image, mapState.scale, mapState.offsetX, mapState.offsetY, mapState.originOffset, drawingRegion, isSpacePressed, editMode.isEditing, setOrigin, addPointToDrawing, finishDrawingRegion, startDragging, regions])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      stopDragging()
    }
  }, [stopDragging])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    handleMouseMove(x, y)
  }, [handleMouseMove])

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    handleWheel(e.deltaY, x, y)
  }, [handleWheel])

  // Edit mode handlers
  const handlePointMouseDown = useCallback((regionId: string, pointIndex: number, event: React.MouseEvent) => {
    event.preventDefault()
    startDraggingPoint(regionId, pointIndex)
  }, [startDraggingPoint])

  const handlePointMouseMove = useCallback((regionId: string, pointIndex: number, x: number, z: number) => {
    updatePointPosition(regionId, pointIndex, x, z)
  }, [updatePointPosition])

  const handlePointMouseUp = useCallback(() => {
    stopDraggingPoint()
  }, [stopDraggingPoint])

  const handleInsertPointClick = useCallback((regionId: string, pointIndex: number, x: number, z: number) => {
    addPointToRegion(regionId, pointIndex, x, z)
  }, [addPointToRegion])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        console.log('Image loaded:', {
          width: img.width,
          height: img.height
        })
        setImage(img)
        // Center the image
        const canvas = canvasRef.current
        if (canvas) {
          const centerX = (canvas.width - img.width) / 2
          const centerY = (canvas.height - img.height) / 2
          console.log('Setting offset:', { centerX, centerY })
          setOffset(centerX, centerY)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [setImage, setOffset])

  const handleImageUrl = useCallback((url: string) => {
    const img = new Image()
    img.onload = () => {
      console.log('Image loaded from URL:', {
        width: img.width,
        height: img.height
      })
      setImage(img)
      // Center the image
      const canvas = canvasRef.current
      if (canvas) {
        const centerX = (canvas.width - img.width) / 2
        const centerY = (canvas.height - img.height) / 2
        console.log('Setting offset:', { centerX, centerY })
        setOffset(centerX, centerY)
      }
    }
    img.onerror = () => {
      alert('Failed to load image from URL. Please check the URL and try again.')
    }
    img.src = url
  }, [setImage, setOffset])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth - 400 // Leave space for sidebar
    canvas.height = window.innerHeight - 100 // Leave space for header
  }, [])

  const [imageUrl, setImageUrl] = useState('')

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (imageUrl.trim()) {
      handleImageUrl(imageUrl.trim())
    }
  }

  return (
    <div className="flex-1 relative">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        
        <form onSubmit={handleUrlSubmit} className="flex space-x-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Or enter image URL (e.g., http://localhost:3010/map.png)"
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Load
          </button>
        </form>
      </div>
      
      {!mapState.image && regions.regions.length > 0 && (
        <div className="absolute top-16 left-4 z-10 bg-yellow-600 text-white px-4 py-2 rounded text-sm shadow-lg max-w-md">
          <div className="font-semibold mb-1">Image Required</div>
          <div className="text-xs">
            Your regions have been saved, but the image needs to be reloaded. 
            Please select the same image file to continue working with your regions.
          </div>
        </div>
      )}
      
      {mapState.image && !mapState.originSelected && (
        <div className="absolute top-16 left-4 z-10 bg-blue-600 text-white px-4 py-2 rounded text-sm shadow-lg">
          Choose the world center (0,0) - Click on the compass or known reference point
        </div>
      )}
      
      {isSpacePressed && (
        <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Pan Mode (Space)
        </div>
      )}

      {editMode.isEditing && (
        <div className="absolute top-4 right-4 z-10 bg-orange-600 text-white px-3 py-1 rounded text-sm">
          Edit Mode
        </div>
      )}
      
      <div className={`absolute top-4 z-10 bg-gray-800 text-white px-3 py-1 rounded text-sm border border-gray-600 ${isSpacePressed || editMode.isEditing ? 'right-32' : 'right-4'}`}>
        {Math.round(mapState.scale * 100)}%
      </div>
      
      <canvas
        ref={canvasRef}
        className={`border border-gray-600 ${getCursorStyle()}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
      />
      
      {mapState.image && (
        <>
          <GridOverlay
            canvas={canvasRef.current}
            mapState={mapState}
          />
          <RegionOverlay
            canvas={canvasRef.current}
            mapState={mapState}
            drawingRegion={drawingRegion}
            selectedRegionId={selectedRegionId}
            editMode={editMode}
            regions={regions.regions}
            onPointMouseDown={handlePointMouseDown}
            onPointMouseMove={handlePointMouseMove}
            onPointMouseUp={handlePointMouseUp}
            onInsertPointClick={handleInsertPointClick}
          />
        </>
      )}
    </div>
  )
}
