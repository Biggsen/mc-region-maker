# 🐛 Bug List

## Open Issues

### Image Validation
**Priority:** High  
**Status:** Open  
**Description:** Images loaded from URL are not validated for size limits or square dimensions.

**Issue:**
- No validation that images are square (width === height)
- No maximum size limit enforced
- No minimum size limit enforced
- Code assumes square images for world size calculation and origin auto-setting
- Large images may cause performance issues

**Expected Behavior:**
- Validate that images are square before loading
- Enforce reasonable size limits (e.g., min 250x250, max 8192x8192)
- Show clear error messages when validation fails
- Validate in both URL loading and image import flows

**Affected Components:**
- `src/components/MapLoaderControls.tsx` - `handleLoadFromUrl()` and `loadImageToCanvas()`
- `src/components/ImageImportHandler.tsx` - image loading logic

**Notes:**
- Generated maps from the microservice are always 1000x1000, so validation primarily affects URL-loaded images
- World size calculation formula assumes square images: `imageSize / 125 = worldSize` (e.g., 750x750 = 6k)

---

## Resolved Issues

(Add resolved bugs here as they are fixed)

