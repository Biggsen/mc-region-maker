# MC Map Generator Service Integration Specification

## Overview

This specification details the integration of the **mc-map-generator-service** with the **mc-region-maker** application. The service replaces the existing local `api-server.js` to provide a more robust, scalable solution for generating Minecraft biome maps from seeds.

## Service Architecture

### Current Implementation
- **Local API**: `scripts/api-server.js` (port 3001)
- **Synchronous**: Blocks until map generation completes
- **Response**: Immediate filename return
- **Storage**: Local `screenshots/` directory

### Target Implementation
- **Service URL**: `http://localhost:3001` (development)
- **Async Pattern**: Job-based with polling
- **Response**: Job ID with status polling
- **Storage**: Service-managed ephemeral storage

## API Contract

### Endpoint: POST /api/generate
Starts a map generation job.

**Request:**
```json
{
  "seed": "12345",
  "dimension": "overworld",
  "size": 8
}
```

**Parameters:**
- `seed` (string/number, required): Minecraft seed value
- `dimension` (string, optional): "overworld" (default), "nether", or "end"
- `size` (integer, optional): World size from 2-16 (default: 8)
  - Maps to: 2k-16k blocks
  - App mapping: "8k" → 8, "16k" → 16

**Response:**
```json
{
  "success": true,
  "jobId": "seed-12345-overworld-1703123456789",
  "status": "processing",
  "estimatedTime": "30-60 seconds"
}
```

### Endpoint: GET /api/status/{jobId}
Check job status.

**Response (Processing):**
```json
{
  "success": true,
  "jobId": "seed-12345-overworld-1703123456789",
  "status": "processing",
  "progress": "Taking screenshot..."
}
```

**Response (Ready):**
```json
{
  "success": true,
  "jobId": "seed-12345-overworld-1703123456789",
  "status": "ready",
  "imageUrl": "http://localhost:3001/generated-maps/seed-12345-overworld-1703123456789.png",
  "metadata": {
    "seed": "12345",
    "dimension": "overworld",
    "generatedAt": "2023-12-21T10:30:45Z",
    "fileSize": "245KB",
    "dimensions": "1000x1000"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "jobId": "seed-12345-overworld-1703123456789",
  "status": "error",
  "error": "Failed to load map"
}
```

## Frontend Implementation

### Component: SeedInputPage.tsx

**Location:** `src/components/SeedInputPage.tsx`

**Changes Required:**

1. **Update API Endpoint**
   - Change from: `POST /api/generate-map`
   - Change to: `POST /api/generate`

2. **Implement Async Polling Pattern**
   ```typescript
   const handleGetMap = async () => {
     // Step 1: Start generation job
     const generateResponse = await fetch('http://localhost:3001/api/generate', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 
         seed: seed.trim(),
         dimension: dimension,
         size: overworldWorldSize === '16k' ? 16 : 8
       })
     })
     
     const generateResult = await generateResponse.json()
     const jobId = generateResult.jobId
     
     // Step 2: Poll for status
     const pollStatus = async (): Promise<string> => {
       const statusResponse = await fetch(`http://localhost:3001/api/status/${jobId}`)
       const statusResult = await statusResponse.json()
       
       if (statusResult.status === 'ready') {
         return statusResult.imageUrl
       }
       
       if (statusResult.status === 'error') {
         throw new Error(statusResult.error)
       }
       
       // Wait and retry
       await new Promise(resolve => setTimeout(resolve, 1000))
       return pollStatus()
     }
     
     const imageUrl = await pollStatus()
     setGeneratedImage(imageUrl)
   }
   ```

3. **Add Progress Indicators**
   - Show "Processing..." state during polling
   - Display estimated time from initial response
   - Handle timeout (60 second max)

4. **Update Image Display**
   - Use full URL from `imageUrl` instead of constructing path
   - Change from: `http://localhost:3001/screenshots/${generatedImage}`
   - Change to: `{generatedImage}` (already full URL)

### Component: ImageImportHandler.tsx

**Location:** `src/components/ImageImportHandler.tsx`

**Changes Required:**

1. **Handle Full URLs**
   ```typescript
   const imageUrl = location.state.importImage  // Already full URL from service
   const img = new Image()
   img.crossOrigin = 'anonymous'
   img.src = imageUrl  // Use directly, no path construction
   ```

2. **Remove Path Construction**
   - Remove: `const imageUrl = \`http://localhost:3001/screenshots/${imagePath}\``
   - Use: `location.state.importImage` directly as full URL

## Migration Strategy

### Phase 1: Compatibility Layer (Transitional)
- Support both old and new API endpoints
- Detect which service is available
- Graceful degradation if service unavailable

### Phase 2: Full Integration
- Switch frontend to new API
- Remove old `api-server.js` and `screenshot-mcseedmap.js`
- Update documentation

### Phase 3: Production Deployment
- Deploy service to production environment (Railway/Render)
- Update frontend to use production URL
- Configure environment variables

## Error Handling

### Network Errors
```typescript
catch (error) {
  if (error instanceof TypeError) {
    setError('Cannot connect to map generator service. Is it running?')
  } else {
    setError(error.message || 'Failed to generate map')
  }
}
```

### Timeout Handling
```typescript
const maxAttempts = 60  // 60 seconds max
let attempts = 0

// In poll function:
attempts++
if (attempts >= maxAttempts) {
  throw new Error('Map generation timed out. Please try again.')
}
```

### Job Failure
```typescript
if (statusResult.status === 'error') {
  throw new Error(statusResult.error || 'Map generation failed')
}
```

## Configuration

### Environment Variables

**Development (.env.local):**
```
VITE_API_URL=http://localhost:3001
```

**Production:**
```
VITE_API_URL=https://mc-map-generator.railway.app
```

### Usage in Code
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const response = await fetch(`${API_URL}/api/generate`, {
  // ...
})
```

## Testing Requirements

### Unit Tests
- [ ] SeedInputPage API calls
- [ ] Polling logic with status updates
- [ ] Error handling and timeout scenarios
- [ ] Image URL handling in ImageImportHandler

### Integration Tests
- [ ] End-to-end map generation flow
- [ ] Multi-dimension support (overworld, nether, end)
- [ ] Different world sizes (8k, 16k)
- [ ] Error recovery and retry logic

### Manual Testing
- [ ] Generate overworld map with 8k size
- [ ] Generate overworld map with 16k size
- [ ] Generate nether map
- [ ] Generate end map
- [ ] Test with invalid seed (error handling)
- [ ] Test connection failure (service not running)
- [ ] Test import workflow from generated map

## Performance Considerations

### Polling Interval
- Default: 1000ms (1 second)
- Adjustable based on average generation time
- Consider exponential backoff for retries

### Timeout Configuration
- Maximum wait time: 60 seconds
- User-configurable timeout option
- Progress indicators during wait

### Image Loading
- Implement progressive loading
- Show thumbnail or placeholder while loading
- Handle large image sizes (2000x2000 for 16k)

## UI/UX Enhancements

### Loading States
```typescript
{isLoading ? (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
    {isPolling ? 'Generating Map...' : 'Starting Generation...'}
  </div>
) : (
  'Get Map'
)}
```

### Progress Indicators
- Show job status from API response
- Display estimated time remaining
- Progress bar for visual feedback

### Error Messages
- Clear, user-friendly error messages
- Actionable error recovery suggestions
- Link to troubleshooting documentation

## Rollback Plan

If issues arise with new service:

1. **Immediate**: Revert frontend to use old API endpoint
2. **Configuration**: Use environment variable to switch
3. **Fallback**: Keep old `api-server.js` as backup option

```typescript
const USE_NEW_API = import.meta.env.VITE_USE_NEW_API !== 'false'
const endpoint = USE_NEW_API ? '/api/generate' : '/api/generate-map'
```

## Dependencies

### New Dependencies
None required - using existing fetch API

### Service Dependencies
- mc-map-generator-service running on port 3001
- Puppeteer for browser automation
- Sharp for image processing

## Documentation Updates

### User Documentation
- Update SEED_GENERATOR_README.md with new API
- Document polling behavior and wait times
- Add troubleshooting section

### Developer Documentation
- Document new API endpoints
- Update architecture diagrams
- Add sequence diagrams for generation flow

## Success Criteria

- [ ] Map generation works with new service
- [ ] All dimensions supported (overworld, nether, end)
- [ ] Both world sizes working (8k, 16k)
- [ ] Error handling robust and user-friendly
- [ ] No performance degradation
- [ ] User experience maintained or improved
- [ ] All tests passing
- [ ] Documentation updated

## Future Enhancements

- [ ] Real-time WebSocket updates (replace polling)
- [ ] Background job queuing for long operations
- [ ] Image caching and reuse
- [ ] Batch generation support
- [ ] Custom map parameters (biome filtering, etc.)

