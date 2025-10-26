import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { canvasToImage, pixelToWorld, isPointInPolygon } from '../utils/coordinateUtils'
import { GridOverlay } from './GridOverlay'
import { RegionOverlay } from './RegionOverlay'
import { CustomMarkerOverlay } from './CustomMarkerOverlay'
import { CoordinateInputDialog } from './CoordinateInputDialog'
import { MapDisplayControls } from './MapDisplayControls'
import { Scan } from 'lucide-react'

export function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { mapState: mapStateHook, regions, spawn, mapCanvas, customMarkers } = useAppContext()
  const { mapState, setScale, setOffset, setOrigin, startDragging, stopDragging, handleMouseMove, handleWheel } = mapStateHook
  const { 
    drawingRegion, 
    addPointToDrawing, 
    finishDrawingRegion, 
    selectedRegionId,
    editMode,
    highlightMode,
    startDraggingPoint,
    stopDraggingPoint,
    updatePointPosition,
    addPointToRegion,
    removePointFromRegion,
    updateMoveRegion,
    moveRegionToPosition,
    finishMoveRegion,
    warpRegion,
    addSplitPoint
  } = regions
  const { spawnState, setSpawnCoordinates } = spawn
  const { isSettingCenterPoint, centerPointRegionId, stopSettingCenterPoint, isWarping, warpRadius, warpStrength } = mapCanvas
  const { customMarker, setMarker, orphanedVillageMarkers, showOrphanedVillages } = customMarkers
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [mouseCoordinates, setMouseCoordinates] = useState<{ x: number; z: number } | null>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false)
  const [isCoordinateDialogOpen, setIsCoordinateDialogOpen] = useState(false)
  const lastFreehandPointRef = useRef<{ x: number; z: number } | null>(null)

  const handleCoordinateSubmit = useCallback((coordinates: { x: number; z: number }) => {
    setMarker(coordinates)
  }, [setMarker])

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
        // Don't capture space if user is typing in an input field
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return
        }
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
    if (isSettingCenterPoint) {
      return 'cursor-crosshair'
    }
    if (spawnState.isPlacing) {
      return 'cursor-crosshair'
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
      setIsMouseDown(true)
      
      if (isSpacePressed) {
        // Prioritize panning when space is pressed (even in edit mode)
        startDragging(x, y)
      } else if (editMode.isEditing) {
        // If in edit mode and space is not pressed, don't handle other interactions
        return
      } else if (!mapState.originSelected && mapState.image) {
        // Set origin
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        setOrigin(imagePos.x, imagePos.y)
      } else if (spawnState.isPlacing && mapState.image && mapState.originSelected) {
        // Place spawn point
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image.width, mapState.image.height, mapState.originOffset)
        setSpawnCoordinates(worldPos)
      } else if (drawingRegion) {
        // Check if clicking near a previous point to close polygon
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image!.width, mapState.image!.height, mapState.originOffset)
        
        if (regions.freehandEnabled) {
          // Start freehand stroke
          addPointToDrawing(worldPos.x, worldPos.z)
          lastFreehandPointRef.current = worldPos
        } else {
          // Check if clicking near any previous point (within 20 pixels tolerance)
          // Convert pixel tolerance to world units (8 world units per image pixel)
          const tolerance = (20 / mapState.scale) * 8
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
        }
      } else if (isSettingCenterPoint && mapState.image && mapState.originSelected) {
        // Set custom center point for the selected region
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image.width, mapState.image.height, mapState.originOffset)
        
        if (centerPointRegionId) {
          regions.setCustomCenterPoint(centerPointRegionId, worldPos)
          stopSettingCenterPoint()
        }
      } else if (editMode.isMovingRegion && mapState.image && mapState.originSelected) {
        // Move region to new position
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image.width, mapState.image.height, mapState.originOffset)
        
        if (editMode.movingRegionId) {
          moveRegionToPosition(editMode.movingRegionId, worldPos.x, worldPos.z)
        }
        finishMoveRegion()
      } else if (mapState.image && mapState.originSelected) {
        // Check if clicking on a region
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image.width, mapState.image.height, mapState.originOffset)
        
        // Warp brush applies to selected region if enabled
        if (isWarping && regions.selectedRegionId) {
          warpRegion(regions.selectedRegionId, worldPos.x, worldPos.z, warpRadius, warpStrength)
          return
        }

        // Handle split point selection
        if (editMode.isSplittingRegion && editMode.splitPoints.length < 2) {
          addSplitPoint(worldPos.x, worldPos.z)
          return
        }

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
  }, [mapState.originSelected, mapState.image, mapState.scale, mapState.offsetX, mapState.offsetY, mapState.originOffset, drawingRegion, isSpacePressed, editMode.isEditing, setOrigin, addPointToDrawing, finishDrawingRegion, startDragging, regions, spawnState.isPlacing, setSpawnCoordinates])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      stopDragging()
      setIsMouseDown(false)
      // Always attempt to finalize a drawing on mouse up when we have a valid polygon
      if (drawingRegion && drawingRegion.points.length >= 3) {
        finishDrawingRegion()
      }
      lastFreehandPointRef.current = null
    }
  }, [stopDragging])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Update mouse coordinates for display
    if (mapState.image && mapState.originSelected) {
      const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
      const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image.width, mapState.image.height, mapState.originOffset)
      setMouseCoordinates(worldPos)
      
      // Real-time region movement preview
      if (editMode.isMovingRegion) {
        updateMoveRegion(worldPos.x, worldPos.z)
      }

      // Continuous warp while holding mouse
      if (isWarping && isMouseDown && regions.selectedRegionId && !isSpacePressed && !editMode.isEditing && !editMode.isMovingRegion) {
        warpRegion(regions.selectedRegionId, worldPos.x, worldPos.z, warpRadius, warpStrength)
      }

      // Freehand sampling while dragging
      if (
        drawingRegion && regions.freehandEnabled && isMouseDown && !isSpacePressed && !editMode.isEditing && !editMode.isMovingRegion
      ) {
        const last = lastFreehandPointRef.current
        const minWorldSpacing = 8 // ~1 block increments; tweak as needed
        if (!last || Math.hypot(worldPos.x - last.x, worldPos.z - last.z) >= minWorldSpacing) {
          addPointToDrawing(worldPos.x, worldPos.z)
          lastFreehandPointRef.current = worldPos
        }
      }
    } else {
      setMouseCoordinates(null)
    }

    handleMouseMove(x, y)
  }, [mapState.image, mapState.originSelected, mapState.scale, mapState.offsetX, mapState.offsetY, mapState.originOffset, handleMouseMove, editMode.isMovingRegion, updateMoveRegion, isWarping, isMouseDown, regions.selectedRegionId, isSpacePressed, editMode.isEditing, warpRegion, warpRadius, warpStrength])

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

  const handlePointDoubleClick = useCallback((regionId: string, pointIndex: number) => {
    removePointFromRegion(regionId, pointIndex)
  }, [removePointFromRegion])



  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateCanvasSize = () => {
      // Get the available space by subtracting the sidebar width (384px = w-96)
      const sidebarWidth = 384
      canvas.width = window.innerWidth - sidebarWidth
      canvas.height = window.innerHeight
    }

    // Set initial size
    updateCanvasSize()

    // Add resize listener
    window.addEventListener('resize', updateCanvasSize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  return (
    <div className="flex-1 relative h-full">
      
      {!mapState.image && regions.regions.length > 0 && (
        <div className="absolute top-32 left-4 z-10 bg-yellow-600 text-white px-4 py-2 rounded text-sm shadow-lg max-w-md">
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
        <div className="absolute bottom-4 right-4 z-10 bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Pan Mode (Space)
        </div>
      )}

      {editMode.isEditing && (
        <div className="absolute top-4 left-4 z-10 bg-green-600/90 text-white px-3 py-1 text-sm font-medium">
          Edit Mode
        </div>
      )}
      
      {isSettingCenterPoint && (
        <div className="absolute top-4 right-4 z-10 bg-purple-600 text-white px-3 py-1 rounded text-sm">
          Set Region Heart Mode
        </div>
      )}
      
      {spawnState.isPlacing && (
        <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1 rounded text-sm">
          Spawn Placement Mode
        </div>
      )}
      
      {mouseCoordinates && (
        <div className="absolute bottom-4 left-4 z-10 bg-gray-800 text-white px-3 py-1 pr-2 rounded text-sm border border-gray-600 font-mono flex items-center space-x-2">
            <span className="w-[140px]">
              <span className="text-gray-400">X:</span> <span className="text-white inline-block w-[30px]">{Math.round(mouseCoordinates.x)}</span>{' '}
              <span className="text-gray-400 ml-3">Z:</span> <span className="text-white inline-block w-[30px]">{Math.round(mouseCoordinates.z)}</span>
            </span>
            <button
              onClick={() => setIsCoordinateDialogOpen(true)}
              className="ml-4 p-1 hover:bg-gray-700 rounded transition-colors"
            title="Add custom marker"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <div className="bg-gray-800 text-white px-3 py-1 rounded text-sm border border-gray-600">
          {Math.round(mapState.scale * 100)}%
        </div>
        <button
          onClick={() => {
            setScale(1)
            if (mapState.image) {
              const canvasWidth = window.innerWidth - 384 // Account for sidebar
              const canvasHeight = window.innerHeight - 64 // Account for nav bar
              const centerX = (canvasWidth - mapState.image.width) / 2
              const centerY = (canvasHeight - mapState.image.height) / 2
              setOffset(centerX, centerY)
            }
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded border border-gray-600 transition-colors flex items-center justify-center"
          title="Reset zoom to 100% and center image"
        >
          <Scan size={14} />
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        className={`border border-gray-600 ${getCursorStyle()}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setIsMouseOverCanvas(true)}
        onMouseLeave={() => setIsMouseOverCanvas(false)}
        onWheel={onWheel}
      />
      
      {mapState.image && (
        <>
          <GridOverlay
            canvas={canvasRef.current}
            mapState={mapState}
            isVisible={highlightMode.showGrid}
          />
          <RegionOverlay
            canvas={canvasRef.current}
            mapState={mapState}
            drawingRegion={drawingRegion}
            selectedRegionId={selectedRegionId}
            editMode={editMode}
            highlightMode={highlightMode}
            regions={regions.regions}
            spawnCoordinates={spawnState.coordinates}
            isSpacePressed={isSpacePressed}
            onPointMouseDown={handlePointMouseDown}
            onPointMouseMove={handlePointMouseMove}
            onPointMouseUp={handlePointMouseUp}
            onInsertPointClick={handleInsertPointClick}
            onPointDoubleClick={handlePointDoubleClick}
            isWarping={isWarping}
            warpRadius={warpRadius}
            mouseCoordinates={mouseCoordinates}
            isMouseOverCanvas={isMouseOverCanvas}
          />
          <CustomMarkerOverlay
            canvas={canvasRef.current}
            mapState={mapState}
            customMarker={customMarker}
            orphanedVillageMarkers={orphanedVillageMarkers}
            showOrphanedVillages={showOrphanedVillages}
          />
          <MapDisplayControls
            highlightMode={highlightMode}
            orphanedVillageMarkers={orphanedVillageMarkers}
            showOrphanedVillages={showOrphanedVillages}
            toggleHighlightAll={regions.toggleHighlightAll}
            toggleShowVillages={regions.toggleShowVillages}
            toggleShowOrphanedVillages={customMarkers.toggleShowOrphanedVillages}
            toggleShowCenterPoints={regions.toggleShowCenterPoints}
            toggleShowChallengeLevels={regions.toggleShowChallengeLevels}
            toggleShowGrid={regions.toggleShowGrid}
          />
        </>
      )}
      
      <CoordinateInputDialog
        isOpen={isCoordinateDialogOpen}
        onClose={() => setIsCoordinateDialogOpen(false)}
        onSubmit={handleCoordinateSubmit}
      />
    </div>
  )
}
