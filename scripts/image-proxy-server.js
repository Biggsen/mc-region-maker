import express from 'express'
import fetch from 'node-fetch'

const app = express()

// Enable CORS for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Image proxy endpoint
app.get('/api/proxy-image', async (req, res) => {
  const { url } = req.query
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' })
  }
  
  try {
    console.log(`Proxying image from: ${url}`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      return res.status(response.status).json({ 
        error: `Failed to fetch image: ${response.statusText}` 
      })
    }
    
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    // Set appropriate headers
    res.set('Content-Type', contentType)
    res.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    res.set('Content-Length', imageBuffer.byteLength)
    
    res.send(Buffer.from(imageBuffer))
    console.log(`Successfully proxied image: ${contentType}, ${imageBuffer.byteLength} bytes`)
    
  } catch (error) {
    console.error('Error proxying image:', error)
    res.status(500).json({ 
      error: 'Failed to proxy image',
      details: error.message 
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Image proxy server is running',
    port: PORT 
  })
})

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`🖼️  Image proxy server running on port ${PORT}`)
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/proxy-image`)
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`)
})
