# Minecraft Seed Map Generator

This feature allows you to generate high-quality Minecraft maps from any seed and import them into the MC Region Maker.

## How to Use

### 1. Start the Full Development Environment
```bash
npm run dev:full
```
This will start both the React app (port 3000) and the API server (port 3001).

### 2. Generate a Map from Seed
1. Open the MC Region Maker app in your browser
2. In the Export & Import panel, click **"🗺️ Generate Map from Seed"**
3. Enter any Minecraft seed (number or text)
4. Click **"Get Map"** - this will:
   - Navigate to mcseedmap.net with your seed
   - Handle cookie banners
   - Toggle sidebar for clean view
   - Enable village markers
   - Take a 4K screenshot (3840x2160)
   - Crop to 2000x2000 for optimal quality
5. Preview the generated map
6. Click **"Import Map"** to bring it into the main app

### 3. Features of Generated Maps
- **High Quality**: 4K resolution screenshots
- **Clean Interface**: No UI elements or overlays
- **Village Markers**: Shows all village locations
- **Biome Information**: Displays terrain and biome data
- **Perfect Cropping**: 2000x2000 square for easy use

### 4. Technical Details
- Uses Puppeteer for browser automation
- Sharp for image processing and cropping
- Express API server for backend processing
- React Router for navigation
- Automatic file management in `/screenshots` folder

## File Structure
```
scripts/
├── screenshot-mcseedmap.js    # Main screenshot script
├── api-server.js             # Express API server
└── screenshots/              # Generated map images
    ├── [timestamp].png       # Full 4K screenshot
    └── [timestamp]-cropped.png # 2000x2000 cropped version
```

## API Endpoints
- `POST /api/generate-map` - Generate map from seed
- `GET /api/health` - Health check
- `GET /screenshots/*` - Serve generated images

## Troubleshooting
- Make sure both servers are running (`npm run dev:full`)
- Check browser console for any errors
- Ensure screenshots folder exists and is writable
- Verify Puppeteer can launch Chrome/Chromium

## Dependencies Added
- `react-router-dom` - Client-side routing
- `express` - API server
- `concurrently` - Run multiple npm scripts
- `sharp` - Image processing (already existed)
- `puppeteer` - Browser automation (already existed)
