# Scripts Directory

This directory contains server-side scripts for the MC Region Maker application.

## Image Proxy Server

**File:** `image-proxy-server.js`  
**Port:** 3002  
**Purpose:** Proxies external images to avoid CORS issues when embedding in exports

### Usage

Start the proxy server:
```bash
npm run proxy
```

Or run directly:
```bash
node scripts/image-proxy-server.js
```

### Endpoints

- `GET /api/health` - Health check
- `GET /api/proxy-image?url=<image_url>` - Proxy an external image

### How It Works

1. Frontend detects external image URLs (not localhost)
2. Automatically routes them through the proxy: `http://localhost:3002/api/proxy-image?url=<original_url>`
3. Proxy fetches the image from the external source
4. Serves it from localhost:3002 (same origin as frontend)
5. No CORS issues - images can be embedded in exports

## Map Generation Service

**Status:** ✅ **Using External Microservice**

The application now uses the external MC Map Generator service running on `localhost:3001` (development) or Railway (production). This service provides:
- Async job-based map generation
- Support for all dimensions (overworld, nether, end)
- Configurable world sizes (2k-16k)
- High-quality 1000x1000 PNG output

**Legacy Code:** Old API server and screenshot scripts have been removed and replaced by the microservice.

## Development Scripts

- `npm run dev` - Start frontend only
- `npm run proxy` - Start image proxy server only  
- `npm run dev:with-proxy` - Start both frontend and proxy server
