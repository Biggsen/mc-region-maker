import { useState, useCallback } from 'react'

export function useMapCanvas() {
  const [isSettingCenterPoint, setIsSettingCenterPoint] = useState(false)
  const [centerPointRegionId, setCenterPointRegionId] = useState<string | null>(null)

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
    stopSettingCenterPoint
  }
}
