import { useState, useCallback } from 'react'

export function useMapCanvas() {
  const [isSettingCenterPoint, setIsSettingCenterPoint] = useState(false)
  const [centerPointRegionId, setCenterPointRegionId] = useState<string | null>(null)
  const [isWarping, setIsWarping] = useState(false)
  const [warpRadius, setWarpRadius] = useState(40)
  const [warpStrength, setWarpStrength] = useState(12)

  const startSettingCenterPoint = useCallback((regionId: string) => {
    setIsSettingCenterPoint(true)
    setCenterPointRegionId(regionId)
  }, [])

  const stopSettingCenterPoint = useCallback(() => {
    setIsSettingCenterPoint(false)
    setCenterPointRegionId(null)
  }, [])

  return {
    isSettingCenterPoint,
    centerPointRegionId,
    startSettingCenterPoint,
    stopSettingCenterPoint,
    isWarping,
    setIsWarping,
    warpRadius,
    setWarpRadius,
    warpStrength,
    setWarpStrength
  }
}
