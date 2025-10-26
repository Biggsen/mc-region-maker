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

## Legacy API Server

**File:** `api-server.js`  
**Status:** ⚠️ **DEPRECATED** - Replaced by Railway service  
**Purpose:** Previously used for local map generation

This server is no longer used. The application now uses the external Railway service for map generation.

## Development Scripts

- `npm run dev` - Start frontend only
- `npm run proxy` - Start image proxy server only  
- `npm run dev:with-proxy` - Start both frontend and proxy server
- `npm run server` - Start legacy API server (deprecated)
