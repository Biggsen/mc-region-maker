# World Seed & Dimension Management Specification

## Overview
This specification outlines the implementation of world seed and dimension management to ensure critical seed information is properly captured, displayed, edited, and persisted across all map loading scenarios.

## Problem Statement
Currently, when users generate or load map images, the seed information is not reliably stored or displayed. This is problematic because:
1. Seed information is crucial for Minecraft world generation and reproducibility
2. Users need to know and save the seed for their regions to be meaningful
3. Seed information is lost when exporting/importing projects
4. Different map loading methods (Generate, Load URL, Import) handle seed inconsistently

## Goals
1. **Display**: Show seed and dimension prominently on Regions tab, editable inline
2. **Capture**: Require seed/dimension input for all map loading methods
3. **Persistence**: Save seed/dimension to localStorage with dedicated key
4. **Export/Import**: Include seed/dimension in project save/load files
5. **Consistency**: Ensure seed is captured regardless of how map is loaded

## Requirements

### 1. Display & Edit (Regions Tab)
- Display seed and dimension below world name heading
- Both fields should be editable inline (click to edit)
- Display "Not set" when empty
- Auto-save to localStorage on change
- Visual indicator (pencil icon) for editability

### 2. Storage
- Dedicated localStorage key: `mc-region-maker-world-seed`
- Store as JSON object: `{ seed?: string, dimension?: string }`
- Persist across browser sessions
- Clear when clearing all data

### 3. Map Loading Scenarios

#### 3.1 Generate Map from Seed
- **Current**: Seed/dimension already captured in UI
- **Required**: Set seed/dimension immediately when "Import Map" is clicked
- **Fix**: Resolve race condition where image load overwrites seed data

#### 3.2 Load from URL
- **Current**: No seed/dimension capture
- **Required**: Add seed and dimension input fields (similar to Generate section)
- **Required**: Set seed/dimension when image loads

#### 3.3 Import via Router State (ImageImportHandler)
- **Current**: Clears seed data
- **Required**: Optionally accept seed/dimension from location.state
- **Required**: If not provided, clear seed/dimension

#### 3.4 Load Complete Map Export
- **Current**: Seed/dimension not included in export file
- **Required**: Include seed/dimension in export JSON
- **Required**: Restore seed/dimension when loading export file

### 4. Export/Import Format

#### Export File Structure
```json
{
  "version": "1.0.0",
  "worldName": "...",
  "seed": "12345",
  "dimension": "overworld",
  "regions": [...],
  "mapState": {...},
  "spawnCoordinates": {...},
  "worldType": "overworld",
  "exportDate": "...",
  "imageData": "...",
  "imageFilename": "..."
}
```

#### Import Behavior
- Restore seed/dimension if present in export file
- If seed/dimension missing (legacy files), leave current values unchanged
- Update localStorage immediately on import

## Implementation Details

### New Files

#### `src/hooks/useSeedInfo.ts`
- Custom hook for seed/dimension state management
- Load from localStorage on mount
- Save to localStorage on update
- Return: `{ seedInfo: { seed?, dimension? }, updateSeedInfo: (info) => void }`

#### `src/components/SeedInfoHeading.tsx`
- Inline-editable seed and dimension display
- Similar pattern to `WorldNameHeading.tsx`
- Click to edit, Enter to save, Escape to cancel
- Dimension uses dropdown: overworld/nether/end/none

### Modified Files

#### `src/context/AppContext.tsx`
- Add `useSeedInfo()` hook
- Include `seedInfo` in context provider

#### `src/components/RegionPanel.tsx`
- Import `SeedInfoHeading`
- Render below `WorldNameHeading`

#### `src/components/MapLoaderControls.tsx`
**Changes:**
1. Add state for URL seed inputs: `urlSeed`, `urlDimension`
2. Update `handleImageUrl()` to accept optional `seedData` parameter
3. Call `seedInfo.updateSeedInfo()` when image loads with seed data
4. Fix race condition in `performImport()` by passing seed to `handleImageUrl()`
5. Add seed/dimension input fields to "Load from URL" section
6. Update `handleUrlSubmit()` to pass seed/dimension

#### `src/components/MainApp.tsx`
**Changes:**
1. Access `seedInfo` from context
2. Update `handleSave()` to pass seed/dimension to `exportCompleteMap()`
3. Update `handleFileImport()` to restore seed/dimension from import data

#### `src/utils/exportUtils.ts`
**Changes:**
1. Add `seed?: string` and `dimension?: string` to `MapExportData` interface
2. Update `exportCompleteMap()` signature to accept seed/dimension parameters
3. Include seed/dimension in export data object

#### `src/utils/persistenceUtils.ts`
**Changes:**
1. Add `WORLD_SEED: 'mc-region-maker-world-seed'` to STORAGE_KEYS
2. Update `clearSavedData()` to clear seed info

#### `src/components/ImageImportHandler.tsx`
**Changes:**
1. Clear seed info on import (unless provided in location.state)
2. Optionally accept seed/dimension from `location.state?.seed` and `state?.dimension`

### Race Condition Fix
The current issue where `performImport()` sets seed but `handleImageUrl()` overwrites it:

**Solution**: Pass seed data as parameter to `handleImageUrl()` and update `seedInfo` directly in the image load callback, rather than relying on state updates that may not have applied yet.

## User Flows

### Flow 1: Generate Map from Seed
1. User enters seed, selects dimension, clicks "Generate Map Image"
2. Map generates and preview displays
3. User clicks "Import Map"
4. Seed and dimension are immediately set in localStorage
5. Image loads and seed/dimension remain set
6. User sees seed/dimension displayed on Regions tab

### Flow 2: Load from URL
1. User enters image URL
2. User enters seed (optional but recommended)
3. User selects dimension (optional but recommended)
4. User clicks "Load"
5. Seed and dimension are set, image loads
6. Seed/dimension displayed on Regions tab

### Flow 3: Edit Seed on Regions Tab
1. User clicks on "Seed: Not set" (or existing seed)
2. Input field appears with current value
3. User types new seed, presses Enter (or clicks away)
4. Seed saved to localStorage immediately
5. Display updates

### Flow 4: Save Project
1. User has regions and seed/dimension set
2. User clicks "Save" button
3. Export file includes seed and dimension
4. File downloads with embedded seed info

### Flow 5: Load Project
1. User clicks "Load" and selects exported JSON file
2. Import data includes seed/dimension
3. Seed/dimension restored from file
4. Seed/dimension displayed on Regions tab

## Edge Cases

### Legacy Export Files
- Files without seed/dimension fields should import successfully
- Existing seed/dimension in localStorage should remain unchanged if not in import file

### Empty Values
- Seed can be empty string (user clears it)
- Dimension can be empty (user selects "None")
- Both fields optional but at least one recommended

### Multiple Import Methods
- If seed set via Generate, then user loads URL without seed, preserve existing seed
- Clear seed only when explicitly loading new map without seed info

### Browser Storage Limits
- Handle localStorage quota errors gracefully
- Log warnings if save fails

## Testing Checklist

- [ ] Seed/dimension displayed on Regions tab
- [ ] Inline editing works for both fields
- [ ] Changes persist to localStorage
- [ ] Generate Map → Import sets seed correctly
- [ ] Load from URL captures seed/dimension
- [ ] Save project includes seed/dimension in file
- [ ] Load project restores seed/dimension
- [ ] Legacy files without seed import successfully
- [ ] Clearing all data clears seed/dimension
- [ ] Dimension dropdown shows correct options
- [ ] Seed field accepts text and numbers
- [ ] Race condition fixed (seed persists after import)

## Migration Notes

### Existing Users
- Users with existing projects (no seed in exports): seed will be empty initially
- Users can manually enter seed in Regions tab after loading project
- localStorage will be populated on first use

### Data Format
- Old format (ImageDetails): Still used but separate from seed storage
- New format (WorldSeed): Dedicated storage for seed/dimension only
- Both can coexist during transition

## Future Enhancements
- Auto-detect seed from map image metadata (if available)
- Seed validation (Minecraft seed format)
- Quick copy seed to clipboard button
- Seed history/autocomplete
- Default dimension based on world type

