# Deployment Checklist

## Production Deployment Status

### ✅ Completed

- [x] **Vercel serverless function created** - `api/proxy-image.js` exists and is functional
- [x] **Frontend proxy logic updated** - Uses `/api/proxy-image` in production (detects `import.meta.env.PROD`)
- [x] **Vercel Analytics integrated** - `@vercel/analytics` package installed and configured
- [x] **Vercel Speed Insights integrated** - `@vercel/speed-insights` package installed and configured
- [x] **Local development proxy working** - Express server on port 3002 for development
- [x] **Build configuration ready** - Vite configured, build scripts in package.json

### ⏳ Pending Tasks

- [x] **Production deployment** - ✅ Deployed to Vercel
- [x] **Environment variables** - ✅ Configured `VITE_API_URL` for map generation service
- [ ] **Domain setup** - Configure custom domain (optional)
- [x] **Testing in production** - ✅ CORS-free image embedding verified working
- [ ] **Documentation** - Update README with production deployment info

---

## Image Proxy Implementation

### Current Status

**Development:**
- Local Express server: `http://localhost:3002/api/proxy-image`
- Started with `npm run proxy`
- Used automatically for external image URLs

**Production:**
- Vercel serverless function: `/api/proxy-image`
- Located in `api/proxy-image.js`
- Automatically used when `import.meta.env.PROD === true`

### Implementation Details

**Frontend Proxy Detection:**
```typescript
// Already implemented in ImageImportHandler.tsx and MapLoaderControls.tsx
const isProduction = import.meta.env.PROD
const proxyUrl = isProduction 
  ? '/api/proxy-image' 
  : 'http://localhost:3002/api/proxy-image'
```

**Vercel Serverless Function (`api/proxy-image.js`):**
- ✅ CORS headers configured
- ✅ Error handling implemented
- ✅ Content-Type preservation
- ✅ Cache-Control headers set (1 hour)
- ✅ Buffer handling for image data

**Why This Is Needed:**
- Local proxy server (`localhost:3002`) won't work in production
- External images need to be proxied to avoid CORS issues
- Vercel serverless functions run on the same domain as the frontend
- This ensures images can be embedded in exported project files

---

## Environment Variables

### Required for Production

**Map Generation Service:**
```env
VITE_API_URL=https://mc-map-generator-production.up.railway.app
```

**Development (optional):**
```env
VITE_API_URL=http://localhost:3001
```

**Usage in Code:**
```typescript
// Already implemented in MapLoaderControls.tsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

### Setting in Vercel

1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Add `VITE_API_URL` with production Railway URL
4. Apply to "Production" environment
5. Redeploy if necessary

---

## Vercel Deployment Steps

### Recommended: Using Vercel Dashboard (No CLI Required)

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Set environment variables (see above)
5. Deploy (automatic on push to main branch if enabled)

**Note**: Vercel CLI is not required - the dashboard approach is simpler and works via Git integration.

### Alternative: Using Vercel CLI (Optional)

If you prefer CLI-based deployment:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link project**:
   ```bash
   vercel link
   ```

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### 3. Verify Deployment

- [x] Frontend loads correctly ✅
- [x] Image proxy works (test with external image URL) ✅
- [x] Map generation works (test seed generation) ✅
- [x] Analytics/Speed Insights reporting ✅
- [x] All routes work (/, /regions, /styleguide) ✅

---

## Build Configuration

### Current Setup

**Build Script:** `npm run build`
- Uses Vite to build to `dist/` directory
- TypeScript compilation
- React build optimization
- Tailwind CSS processing

**Output:**
- Static files in `dist/`
- `index.html` as entry point
- Assets in `dist/assets/`

**Vercel Auto-Detection:**
- Vercel should automatically detect Vite project
- Uses default build settings if not configured

---

## Domain Configuration (Optional)

### Custom Domain Setup

1. **In Vercel Dashboard:**
   - Go to Project Settings → Domains
   - Add custom domain (e.g., `minecraft-region-forge.com`)
   - Follow DNS configuration instructions

2. **DNS Configuration:**
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation
   - SSL certificate auto-provisioned by Vercel

3. **Update References:**
   - Update any hardcoded URLs in code/docs
   - Update README with production URL

---

## Testing Checklist

### Pre-Deployment Testing

- [ ] Build succeeds locally: `npm run build`
- [ ] Preview build works: `npm run preview`
- [ ] All routes accessible
- [ ] Image proxy works in local build
- [ ] Map generation connects to service
- [ ] Export/import functionality works

### Production Testing

- [x] Site loads and is accessible ✅
- [x] Image proxy endpoint works: `https://[domain]/api/proxy-image?url=[test-image-url]` ✅
- [x] Map generation with production API ✅
- [x] External image URLs load via proxy ✅
- [x] Image embedding in exports works (CORS resolved) ✅
- [x] Analytics tracking active ✅
- [x] Speed Insights reporting ✅
- [ ] Error boundary catches errors gracefully
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

---

## Monitoring & Analytics

### Already Integrated

- ✅ **Vercel Analytics** - User analytics and page views
- ✅ **Vercel Speed Insights** - Performance monitoring

### Additional Considerations

- [ ] **Error Monitoring** - Consider Sentry or similar for production errors
- [ ] **Uptime Monitoring** - External service to monitor availability
- [ ] **Performance Budget** - Set targets for Core Web Vitals

---

## Rollback Plan

If issues arise after deployment:

1. **Vercel Dashboard:**
   - Go to Deployments
   - Find previous working deployment
   - Click "Promote to Production"

2. **Quick Fix:**
   - Fix issue in code
   - Push to main branch
   - Auto-deploys (if enabled)

3. **Feature Flag:**
   - Disable problematic features via environment variables
   - No code deployment needed

---

## Known Issues & Considerations

### Current Limitations

1. **Local Proxy Server:**
   - Still needed for local development
   - Documented in `scripts/README.md`
   - Not used in production

2. **Map Generation Service:**
   - External service dependency (Railway)
   - Must be running for seed generation to work
   - No fallback if service is down

3. **Image Storage:**
   - No persistent image storage yet
   - Images loaded from URLs or generated temporarily
   - See `spec/user-accounts-spec.md` for future cloud storage

### Future Enhancements

- [ ] Error monitoring (Sentry)
- [ ] CDN for static assets
- [ ] Image optimization pipeline
- [ ] Service health checks
- [ ] Rate limiting for API endpoints

---

## Documentation Updates Needed

After deployment:

- [ ] Update README with production URL
- [ ] Add deployment section to README
- [ ] Document environment variables
- [ ] Update API documentation if URLs change
- [ ] Add troubleshooting section for common issues

---

## Success Criteria

Deployment is successful when:

- [x] Code builds without errors ✅
- [x] Serverless function exists and is functional ✅
- [x] Site is accessible at production URL ✅
- [x] All features work in production environment ✅
- [x] Image proxy resolves CORS issues ✅
- [x] Map generation connects to production API ✅
- [x] Analytics and monitoring active ✅
- [ ] Performance meets targets (< 3s load time)
- [ ] No critical errors in production logs

---

## Related Documentation

- **MVP Dev Plan**: `spec/MVP_DEV_PLAN.md` - Deployment task details
- **User Accounts Spec**: `spec/user-accounts-spec.md` - Future cloud features
- **API Reference**: `reference/mc-map-generator API docs.md` - Map generation service
- **Scripts README**: `scripts/README.md` - Local proxy server documentation
