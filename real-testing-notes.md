# Real Testing Notes

## Date: [Insert Date]

## Overall Goal
Test the region creation workflow to get a real feel for how the app works.

---

## Testing Session Notes

### Initial Observations
- 

### Issues Discovered
- bit of a bug, but when you're in edit mode, you can still click back and whatnot. leaves orange vertices, kinda weird.
- evaluate carefully what you can do while you in Edit Mode
- the border adjusting takes quite a lot of time
- bug - you can have two region with the exact same name
- bug - you can click Edit shape while have a Warp Brush active
- bug - the image cors issue is not solved. Working on something for a while and it's failing. Was fine before.
- bug - is the yaml output broken?

### Workflow Observations
- how does worldguard deal with region overlaps?
- and how will village import deal with overlaps? could be two regions
- what if you make regions outside the map?

### Feature Requests / Improvements

#### ✅ Completed
- ✅ add logo - **DONE**: Added "Region Forge" logo in center of navigation
- ✅ remove the 'After loading an image, click..' text - **DONE**: Removed instructional text
- ✅ for the load from URL, the load button should be full width below the input - **DONE**: Made button full width and larger
- ✅ when importing map, replace the browser popup with the notification of what will be deleted with a modal - **DONE**: Created proper modal with backdrop
- ✅ maybe switch automatically to Region after importing map? - **DONE**: Auto-switches to Regions tab after import
- ✅ clear all data isn't need on the Map panel - **DONE**: Removed from Map panel

#### 📋 Still Needed
- Add save PNG after generating map
- the Regions panel needs to highlight that you'll need a map first before you can create regions
- do I need a homepage, or an intro page somehow?
- hovering over regions in the list should highlight them slightly on the map
- buttons really need different colours. too much green
- edit mode done needs to be more prominent. again, too much green
- it'd be really cool to be able to write something about a region, some lore or notes
- need to be able to delete a region from the dtails panel
- using warp brush, noticed I was wanting to undo
- in the display, villages, hearts and levels should not be there
- being able to click outside to close display would be good
- would be nice to be able to make map less vibrant, like transparency
- personally don't like any of those 'Paladin of Dawn' names for regions
- would be nice to be able to sort regions by name and size
- export settings can be in the panel instead of the modal
- none of those export options are valid for public
- greeting and farewell setting need to be added
- make marker a bit more functional and persistent? maybe name it and be able to click it and remove?

### Positive Findings
- 

---

## Detailed Notes

*Add detailed notes below as you test...*
