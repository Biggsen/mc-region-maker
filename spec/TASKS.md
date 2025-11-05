# 📋 MC Region Maker - Task List

## ✅ Completed Features

### Export/Import Functionality
- [x] **Export all regions to YAML file** - Fully implemented (`exportRegionsYAML`)
- [x] **Import saved region data from file** - Fully implemented (`importMapData`, `exportCompleteMap`)
- [x] **Export individual regions** - Implemented (copy YAML per region)
- [x] **Backup/restore functionality** - Complete project export/import with all state

### UI/UX Improvements
- [x] **Region search/filter in sidebar** - Implemented in RegionPanel with search input
- [x] **Basic zoom controls** - Mouse wheel zoom, space+drag pan
- [x] **Zoom to region** - Implemented (zooms to selected region bounds with padding)
- [x] **Freehand drawing** - Click and hold to draw regions (freehand mode)
- [x] **Bulk delete** - "Delete all regions" functionality implemented

### Advanced Drawing Tools
- [x] **Vertex manipulation** - Double/halve/simplify vertices implemented
- [x] **Move region** - Move entire region by clicking new position
- [x] **Split region** - Split polygon into two parts
- [x] **Warp region** - Warp brush tool for deforming regions
- [x] **Resize region** - Scale region with slider (10-200%)

### Map Loading
- [x] **Map generation from seed** - Fully implemented via microservice
- [x] **URL loading for map images** - Fully implemented
- [x] **Origin setting** - Fully implemented with clear instructions

---

## 🚧 Missing Features & Improvements

### 🔥 High Priority

- [ ] **Map Upload Functionality (File Upload)**
  - [x] URL loading for map images ✅
  - [x] Map generation from seed ✅
  - [ ] Drag & drop file upload for local images (nice-to-have, not MVP requirement)
  - [ ] File validation (PNG, JPG format)
  - [ ] Display upload progress/loading state (for file uploads)
  - [ ] Handle upload errors gracefully (for file uploads)
  - **Note**: URL loading and seed generation cover all essential use cases. File upload depends on user accounts feature (see `spec/user-accounts-spec.md`).

### 📈 Medium Priority

- [ ] **Enhanced Drawing Tools**
  - [ ] Chunk snapping for precise region boundaries
  - [ ] Rectangle drawing tool
  - [ ] Circle drawing tool
  - [ ] Undo/redo functionality
  - [ ] Delete individual points while drawing

- [ ] **Improved UI/UX**
  - [x] Basic zoom controls ✅ (mouse wheel zoom, space+drag pan)
  - [x] Zoom to region ✅ (zoom to selected region bounds)
  - [ ] Zoom to fit (automatically fit map to canvas on load)
  - [ ] Mini-map for navigation
  - [ ] Keyboard shortcuts
  - [x] Region search/filter in sidebar ✅
  - [ ] Bulk region operations (duplicate, merge)
  - [x] Bulk delete ✅ (delete all regions implemented)

### 🎨 Nice to Have

- [ ] **Advanced Features**
  - [ ] Region templates/presets
  - [ ] Region categories/tags
  - [ ] Region descriptions/notes
  - [ ] Region validation (check for overlapping regions)
  - [x] Region statistics (area calculation exists) ✅
  - [ ] Region perimeter calculation

- [ ] **Performance & Technical**
  - [x] Loading states for operations ✅ (map generation, import/export have loading states)
  - [x] Error handling ✅ (basic error handling implemented)
  - [ ] Comprehensive error handling across all operations
  - [ ] Optimize canvas rendering for large maps
  - [ ] Add unit tests
  - [ ] Add integration tests

- [ ] **User Experience**
  - [ ] Onboarding system (step-by-step guides, tutorials, tooltips) - **MVP Priority**
  - [ ] Keyboard navigation support
  - [ ] Screen reader compatibility
  - [ ] High contrast mode
  - [ ] Colorblind-friendly UI
  - [ ] Mobile responsiveness improvements

### 🐛 Known Issues

- [ ] Document any current bugs or issues here

---

## 📝 Notes

- Priority levels are suggestions and can be adjusted based on user feedback
- Some features may require additional dependencies or architectural changes
- Consider mobile/tablet support for future versions
- **MVP Focus**: Onboarding system and testing/deployment are critical for MVP completion
- **Future Features**: User accounts, image upload, and project sharing are planned post-MVP (see `spec/user-accounts-spec.md`)

## 🎯 MVP Remaining Tasks

From the MVP Development Plan, these are the critical remaining items:

1. **Onboarding System** - Step-by-step user guides and tutorials
2. **Testing & Bug Fixes** - Cross-browser, mobile, performance testing
3. **Production Deployment** - ✅ Deployed to Vercel, env vars configured, image embedding verified

See `spec/MVP_DEV_PLAN.md` for detailed MVP requirements.
