import express from 'express'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

// Serve screenshots directory with CORS headers
app.use('/screenshots', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET')
  next()
}, express.static(path.join(__dirname, '..', 'screenshots')))

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.post('/api/generate-map', async (req, res) => {
  const { seed, dimension = 'overworld', overworldWorldSize } = req.body
  
  // Debug: Log the request body
  console.log('Request body:', req.body)
  console.log('Extracted seed:', seed)
  console.log('Extracted dimension:', dimension)
  console.log('Extracted overworldWorldSize:', overworldWorldSize)
  
  if (!seed) {
    return res.status(400).json({ error: 'Seed is required' })
  }
  
  console.log(`Generating ${dimension} map for seed: ${seed}`)
  
  try {
    // Run the screenshot script with the provided seed and dimension
    const scriptPath = path.join(__dirname, 'screenshot-mcseedmap.js')
    const envVars = { 
      ...process.env, 
      MC_SEED: seed, 
      MC_DIMENSION: dimension,
      MC_OVERWORLD_WORLD_SIZE: overworldWorldSize || '8k'
    }
    
    console.log('Environment variables being passed to script:')
    console.log('MC_SEED:', envVars.MC_SEED)
    console.log('MC_DIMENSION:', envVars.MC_DIMENSION)
    console.log('MC_OVERWORLD_WORLD_SIZE:', envVars.MC_OVERWORLD_WORLD_SIZE)
    
    const child = spawn('node', [scriptPath], {
      env: envVars,
      cwd: path.join(__dirname, '..')
    })
    
    let output = ''
    let generatedFilename = null
    
    child.stdout.on('data', (data) => {
      const dataStr = data.toString()
      output += dataStr
      console.log(dataStr)
      
      // Look for the generated filename in the output
      const match = dataStr.match(/GENERATED_FILE:(.+)/)
      if (match) {
        generatedFilename = match[1].trim()
        console.log(`Captured generated filename: ${generatedFilename}`)
      }
    })
    
    child.stderr.on('data', (data) => {
      console.error(data.toString())
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        if (generatedFilename) {
          // Use the specific filename that was generated
          console.log(`Map generated successfully: ${generatedFilename}`)
          res.json({ 
            success: true, 
            imagePath: generatedFilename,
            message: 'Map generated successfully'
          })
        } else {
          // Fallback to finding the latest file if we couldn't capture the filename
          const screenshotsDir = path.join(__dirname, '..', 'screenshots')
          
          try {
            const files = fs.readdirSync(screenshotsDir)
            const croppedFiles = files
              .filter(file => file.includes('-cropped.png'))
              .map(file => ({
                name: file,
                path: path.join(screenshotsDir, file),
                stats: fs.statSync(path.join(screenshotsDir, file))
              }))
              .sort((a, b) => b.stats.mtime - a.stats.mtime)
            
            if (croppedFiles.length > 0) {
              const latestFile = croppedFiles[0]
              console.log(`Fallback: Using latest file: ${latestFile.name}`)
              res.json({ 
                success: true, 
                imagePath: latestFile.name,
                message: 'Map generated successfully'
              })
            } else {
              res.status(500).json({ error: 'No cropped image found' })
            }
          } catch (dirError) {
            console.error('Error reading screenshots directory:', dirError)
            res.status(500).json({ error: 'Failed to find generated image' })
          }
        }
      } else {
        console.error(`Screenshot script exited with code ${code}`)
        res.status(500).json({ 
          error: 'Failed to generate map',
          details: output
        })
      }
    })
    
    child.on('error', (error) => {
      console.error('Error spawning screenshot script:', error)
      res.status(500).json({ error: 'Failed to start map generation' })
    })
    
  } catch (error) {
    console.error('Error in generate-map endpoint:', error)
    res.status(500).json({ error: error.message })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
  console.log(`Screenshots served from: ${path.join(__dirname, '..', 'screenshots')}`)
})
