# 🗺️ MC Region Maker

A browser-based utility for defining and managing polygonal exploration regions over Minecraft biome map images. Draw regions directly on the map and generate WorldGuard-style region data.

## Features

- 📌 Upload and display Minecraft biome map images
- 🎯 Draw polygonal regions by clicking points on the map
- 🧭 Automatic coordinate conversion (image pixels ↔ Minecraft world coordinates)
- 📐 Chunk grid overlay (16×16 blocks)
- 🔧 Edit region properties (name, min/max Y)
- 📋 Generate WorldGuard YAML region data
- 📋 Copy region data to clipboard
- 🎨 Dark theme UI

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Usage

1. **Upload Map**: Click "Choose File" and select your Minecraft biome map image (PNG/JPG)
2. **Create Region**: Click "Create New Region", enter a name, and click "Start Drawing"
3. **Draw Region**: Click on the map to place polygon points. Double-click to finish the region
4. **Edit Region**: Select a region from the sidebar to edit its properties
5. **Copy YAML**: Click "Copy" to copy the WorldGuard region data to your clipboard

## Coordinate System

- Each pixel = 1 Minecraft block
- Image center = world origin (0, 0)
- Top of image = negative Z
- Left of image = negative X
- Y-axis defaults to 0-255 (configurable per region)

## Tech Stack

- React + TypeScript
- HTML5 Canvas for rendering
- Tailwind CSS for styling
- Vite for development

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```
