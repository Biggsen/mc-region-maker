# 🐛 Bug List

## Open Issues

### Region Creation Without Map Import
**Priority:** High  
**Status:** Open

**Description:** Users can start creating a region even when no map has been imported, which should be prevented.

**Issue:**
- Region creation should be disabled or blocked until a map is loaded
- Currently allows users to attempt region creation without a map context

**Affected Components:**
- Region creation functionality (likely `RegionCreationForm.tsx` or related components)
- Map state management (likely `useMapState.ts` or `AppContext.tsx`)

**Expected Behavior:**
- Region creation UI should be disabled/grayed out when no map is loaded
- Or show a clear message prompting user to import a map first

---

## Resolved Issues

### Image Validation
**Priority:** High  
**Status:** Resolved  
**Resolved Date:** [Current Date]

**Description:** Images loaded from URL are not validated for size limits or square dimensions.

**Original Issue:**
- No validation that images are square (width === height)
- No maximum size limit enforced
- No minimum size limit enforced
- Code assumes square images for world size calculation and origin auto-setting
- Large images may cause performance issues

**Solution Implemented:**
- Added validation function `validateImageDimensions()` that checks:
  - Image must be square (width === height)
  - Minimum size: 250x250 pixels
  - Maximum size: 2000x2000 pixels
- Validation added to all image loading paths:
  - `MapLoaderControls.tsx` - `handleLoadFromUrl()` (validates before preview) and `loadImageToCanvas()` (validates before setting image)
  - `ImageImportHandler.tsx` - validates after image loads from router state
  - `MainApp.tsx` - validates images loaded from project file imports (both base64 and URL formats)
  - `persistenceUtils.ts` - validates images loaded from localStorage
- Clear error messages displayed with current dimensions when validation fails
- Separate error state for URL loading errors, displayed above the "Load" button in the "Load from URL" section

**Affected Components:**
- `src/components/MapLoaderControls.tsx` - `handleLoadFromUrl()` and `loadImageToCanvas()`
- `src/components/ImageImportHandler.tsx` - image loading logic
- `src/components/MainApp.tsx` - project file import handling
- `src/utils/persistenceUtils.ts` - localStorage image loading

**Notes:**
- Generated maps from the microservice are always 1000x1000, so validation primarily affects URL-loaded images
- World size calculation formula assumes square images: `imageSize / 125 = worldSize` (e.g., 750x750 = 6k)

