import React, { useRef, useEffect, useCallback } from 'react'
import { useAppContext } from '../context/AppContext'
import { canvasToImage, pixelToWorld } from '../utils/coordinateUtils'
import { GridOverlay } from './GridOverlay'
import { RegionOverlay } from './RegionOverlay'

export function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { mapState: mapStateHook, regions } = useAppContext()
  const { mapState, setImage, setOffset, startDragging, stopDragging, handleMouseMove, handleWheel } = mapStateHook
  const { drawingRegion, addPointToDrawing, finishDrawingRegion, selectedRegionId } = regions

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
      if (drawingRegion) {
        // Add point to drawing region
        const imagePos = canvasToImage(x, y, mapState.scale, mapState.offsetX, mapState.offsetY)
        const worldPos = pixelToWorld(imagePos.x, imagePos.y, mapState.image!.width, mapState.image!.height)
        addPointToDrawing(worldPos.x, worldPos.z)
      } else {
        // Start dragging
        startDragging(x, y)
      }
    }
  }, [drawingRegion, mapState.scale, mapState.offsetX, mapState.offsetY, mapState.image, addPointToDrawing, startDragging])

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

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingRegion) {
      finishDrawingRegion()
    }
  }, [drawingRegion, finishDrawingRegion])

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth - 400 // Leave space for sidebar
    canvas.height = window.innerHeight - 100 // Leave space for header
  }, [])



  return (
    <div className="flex-1 relative">
      <div className="absolute top-4 left-4 z-10">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
      </div>
      
      <canvas
        ref={canvasRef}
        className="border border-gray-600 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
        onDoubleClick={handleDoubleClick}
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
            regions={regions.regions}
          />
        </>
      )}
    </div>
  )
}
