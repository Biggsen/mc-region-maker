import { IMAGE_MIN_SIZE, IMAGE_MAX_SIZE } from './constants'

export interface ValidationResult {
  isValid: boolean
  error: string | null
}

export function validateImageDimensions(width: number, height: number): ValidationResult {
  if (width !== height) {
    return {
      isValid: false,
      error: `Image must be square (width and height must be equal). Current dimensions: ${width}x${height}`
    }
  }
  
  if (width < IMAGE_MIN_SIZE || height < IMAGE_MIN_SIZE) {
    return {
      isValid: false,
      error: `Image is too small. Minimum size is ${IMAGE_MIN_SIZE}x${IMAGE_MIN_SIZE}. Current dimensions: ${width}x${height}`
    }
  }
  
  if (width > IMAGE_MAX_SIZE || height > IMAGE_MAX_SIZE) {
    return {
      isValid: false,
      error: `Image is too large. Maximum size is ${IMAGE_MAX_SIZE}x${IMAGE_MAX_SIZE}. Current dimensions: ${width}x${height}`
    }
  }
  
  return { isValid: true, error: null }
}

