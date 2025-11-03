# Deployment Checklist

## Production Deployment Tasks

### Image Proxy for Vercel Deployment

When deploying to production (likely Vercel), the current local proxy server won't work. Need to convert to Vercel serverless functions.

#### Tasks:
- [ ] Create `api/proxy-image.js` serverless function
- [ ] Update frontend to use `/api/proxy-image` instead of `localhost:3002` for production
- [ ] Test that CORS-free image embedding works in production
- [ ] Remove or document local proxy server for production builds

#### Implementation Details:

**Create `api/proxy-image.js`:**
```javascript
export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }
  
  try {
    const response = await fetch(url);
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(imageBuffer));
  } catch (error) {
    res.status(500).json({ error: 'Failed to proxy image' });
  }
}
```

**Update frontend logic:**
```javascript
// Detect if running in production
const isProduction = import.meta.env.PROD;
const proxyUrl = isProduction 
  ? '/api/proxy-image' 
  : 'http://localhost:3002/api/proxy-image';

const imageUrl = url.startsWith('http') && !url.includes('localhost') 
  ? `${proxyUrl}?url=${encodeURIComponent(url)}`
  : url;
```

#### Why This Is Needed:
- Local proxy server (`localhost:3002`) won't work in production
- External images need to be proxied to avoid CORS issues
- Vercel serverless functions run on the same domain as the frontend
- This ensures images can be embedded in exported project files

#### Current Status:
- ✅ Local development proxy working
- ⏳ Production deployment pending
- ⏳ Vercel serverless function not yet created
