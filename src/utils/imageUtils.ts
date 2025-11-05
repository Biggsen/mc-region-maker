export function getImageProxyUrl(imageUrl: string): string {
  const isProduction = import.meta.env.PROD
  const proxyUrl = isProduction 
    ? '/api/proxy-image' 
    : 'http://localhost:3002/api/proxy-image'
  
  // Only proxy external HTTP(S) URLs, not localhost
  if (imageUrl.startsWith('http') && !imageUrl.includes('localhost')) {
    return `${proxyUrl}?url=${encodeURIComponent(imageUrl)}`
  }
  
  return imageUrl
}

export function createImageElement(src: string): HTMLImageElement {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = src
  return img
}

