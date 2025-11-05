# Deployment Guide

## Quick Start

### Production Environment Variables

```env
VITE_API_URL=https://mc-map-generator-production.up.railway.app
```

Set in Vercel Dashboard → Project Settings → Environment Variables → Production

### Deploy to Vercel

**Option 1: Dashboard (Recommended)**
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure build: `npm run build`, Output: `dist`
4. Set environment variables (above)
5. Deploy (auto-deploys on push to main if enabled)

**Option 2: CLI**
```bash
npm i -g vercel
vercel login
vercel link
vercel --prod
```

---

## Architecture

### Image Proxy

**Development:** `http://localhost:3002/api/proxy-image` (Express server via `npm run proxy`)  
**Production:** `/api/proxy-image` (Vercel serverless function)

Frontend automatically detects environment and uses the appropriate endpoint.

**Why:** Proxies external images to avoid CORS issues when embedding in exported project files.

### Build Configuration

- Build: `npm run build`
- Output: `dist/`
- Framework: Vite (auto-detected by Vercel)

---

## Testing

### Production Checklist
- [ ] Site accessible
- [ ] Image proxy works: `https://[domain]/api/proxy-image?url=[test-url]`
- [ ] Map generation connects to API
- [ ] External images load via proxy
- [ ] Analytics tracking active

---

## Monitoring

**Integrated:** Vercel Analytics, Vercel Speed Insights

**Optional:** Consider Sentry for error monitoring

---

## Rollback

Vercel Dashboard → Deployments → Select previous deployment → "Promote to Production"

---

## Known Dependencies

- **Map Generation Service:** External Railway service (must be running)
- **Local Proxy:** Required for development only (`scripts/README.md`)

---

## Related Docs

- API Reference: `reference/mc-map-generator API docs.md`
- Scripts: `scripts/README.md`
- Future Features: `spec/user-accounts-spec.md`
