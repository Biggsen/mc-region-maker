export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { url } = req.query
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' })
  }
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch image: ${response.statusText}` 
      })
    }
    
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Length', imageBuffer.byteLength)
    
    return res.send(Buffer.from(imageBuffer))
    
  } catch (error) {
    console.error('Error proxying image:', error)
    return res.status(500).json({ 
      error: 'Failed to proxy image',
      details: error.message 
    })
  }
}

