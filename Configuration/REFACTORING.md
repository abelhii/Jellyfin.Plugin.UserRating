# User Ratings Plugin - Refactored Architecture

## Overview

The plugin has been refactored from a single 1500+ line monolithic file into a clean, modular architecture with separate concerns.

## File Structure

```
Configuration/
├── styles.css                   # All CSS styles
├── api.js                       # API calls & HTTP requests
├── ui.js                        # UI component creation
├── container-detector.js        # Smart container detection (NEW - key improvement)
├── detail-page-injector.js      # Detail page injection logic
├── home-page-ratings.js         # Home page tab & ratings list
└── main.js                      # Entry point & initialization
```

## Module Descriptions

### `styles.css`
Contains all styling for the ratings UI components. Extracted for easier maintenance and to allow dynamic loading.

### `api.js` - RatingsAPI
Handles all HTTP communication with the backend:
- `loadRatings(itemId)` - Get all ratings for an item
- `loadMyRating(itemId)` - Get current user's rating
- `saveRating(itemId, rating, note)` - Post/update a rating
- `deleteRating(itemId)` - Remove a rating
- `loadAllRatedItems()` - Get user's rated items

**Benefit**: Centralized API calls, easier to test and modify backend integration.

### `ui.js` - RatingsUI
Creates and manages all UI components:
- `createStarRating(rating, interactive, onHover, onClick)` - Interactive star display
- `updateStarDisplay(container, rating)` - Update shown stars
- `createRatingsUI(itemId)` - Main detail page UI
- `displayAllRatings(itemId, container)` - Show all ratings for an item

**Benefit**: Pure UI logic, fully separated from injection/detection logic.

### `container-detector.js` - ContainerDetector (KEY IMPROVEMENT)

**What's new**: Instead of multiple selector strategies + exponential backoff polling, this uses a reactive approach:

```javascript
// OLD approach (brittle):
- Try 4 different selectors
- If none found, retry with exponential backoff up to 30 times
- Check container size with multiple timeouts
- Risk of infinite loops, flaky behavior

// NEW approach (robust):
- Define valid selectors
- Use MutationObserver to reactively detect when containers appear
- Check not just existence but actual readiness (has content, is visible)
- Fallback polling only as secondary mechanism
- Clean timeout enforcement
```

**Key features**:
- `isContainerReady(element)` - Validates container is truly ready (visible, has content)
- `findReadyContainer()` - Scans for a ready container
- `waitForContainer()` - Async function that waits reactively for readiness
- Handles visibility, dimensions, content checks

**Why better**:
- No infinite loops or flaky retry logic
- Cleaner, more predictable behavior
- Can configure requirements (must have content, min size, etc.)
- Single timeout enforced
- Reusable for other detection scenarios

### `detail-page-injector.js` - DetailPageInjector
Orchestrates the injection of ratings UI into detail pages:
- `extractItemId()` - Get item ID from URL (tries multiple patterns)
- `isOnDetailsPage()` - Check current page type
- `injectRatingsUI()` - Main injection logic using ContainerDetector
- `init()` - Set up navigation monitoring

**Benefit**: Clean separation of concerns, easy to debug injection flow.

### `home-page-ratings.js` - HomePageRatings
Manages the ratings tab on home page:
- `injectRatingsTab()` - Add ratings button to home tabs
- `displayRatingsList()` - Show all rated items
- `renderRatingsList(container, items)` - Render categorized grid
- `buildItemCards(items)` - Generate card HTML
- `init()` - Set up home page features

**Benefit**: Isolated from detail page logic, easier to maintain and test.

### `main.js` - Entry Point
Orchestrates initialization:
1. Load CSS styles
2. Wait for all modules to load
3. Initialize DetailPageInjector
4. Initialize HomePageRatings
5. Set up cleanup handlers

**Benefit**: Single clear entry point, easy to understand initialization flow.

## How It Works

### Module Loading Order

1. HTML loads `main.js` (which should be last)
2. Browser also loads: `api.js`, `ui.js`, `container-detector.js`, `detail-page-injector.js`, `home-page-ratings.js` (via individual script tags)
3. `main.js` waits for all modules, then calls `initialize()`

### Detail Page Flow

```
1. User navigates to item detail page
2. DetailPageInjector detects URL change (hashchange event)
3. Calls injectRatingsUI()
4. Creates ContainerDetector instance
5. ContainerDetector waits for detail page container reactively:
   - Uses MutationObserver to detect DOM changes
   - Checks each potential container for readiness
   - Returns when found or times out after 15s
6. Creates UI using RatingsUI.createRatingsUI()
7. Injects into container
8. Verifies UI is visible
9. Shows ratings form and existing ratings
```

### Home Page Flow

```
1. Page loads with home view
2. HomePageRatings attempts to inject tab into tabs bar
3. Retries periodically (every 2s) until tabs bar appears
4. When "User Ratings" tab clicked:
   - Calls displayRatingsList()
   - Loads all user's rated items via API
   - Fetches full item details from Jellyfin
   - Renders categorized grid (Movies, Shows, Episodes)
   - Shows ratings and counts for each item
5. Clicking item opens detail page (handled by DetailPageInjector)
```

## Key Improvements Over Original

| Aspect | Original | Refactored |
|--------|----------|-----------|
| **Lines of code** | 1500+ monolithic | ~400 per module |
| **Container detection** | 4 selector strategies + 30 retries | Reactive MutationObserver |
| **Size checking** | 3 different timeouts checking dimensions | Single readiness check |
| **Code organization** | All mixed together | Clear module boundaries |
| **Testability** | Difficult (tightly coupled) | Easy (modules independent) |
| **Reusability** | Hard to reuse components | Modules can be reused |
| **Maintainability** | Hard to find/change logic | Each concern in one file |
| **Reliability** | Flaky due to retry loops | Robust with timeouts |

## Configuration

### Container Detection Sensitivity
Modify Container Detector in `detail-page-injector.js`:

```javascript
this.detector = new ContainerDetector({
    timeout: 15000,           // Wait up to 15 seconds
    requireContent: true,     // Must have child elements
    minSize: { width: 0, height: 0 },  // Size requirements
    checkInterval: 100        // Check every 100ms while polling
});
```

### Selectors
The primary selectors to watch for (in order of preference):
1. `.detailPagePrimaryContent .detailSection`
2. `.detailSection`
3. `.detailPagePrimaryContent`
4. `.itemDetailPage .detailPageContent`

Add more by modifying `container-detector.js`:
```javascript
selectors: [
    '.detailPagePrimaryContent .detailSection',
    '.myNewSelector',  // Add custom
    '.detailSection',
    // ... others
]
```

## Future Enhancements

1. **Event system** - Add custom events (e.g., `ratingSaved`, `ratingDeleted`)
2. **Caching** - Cache loaded ratings locally to reduce API calls
3. **Animations** - Add smooth transitions when injecting UI
4. **Error recovery** - More graceful handling of API failures
5. **A/B testing** - Easy to test UI variants in separate modules
6. **Configuration UI** - Settings panel for customization

## Debugging

All modules log with `[UserRatings]` prefix:
```javascript
console.log('[UserRatings] Message here');
```

Use browser DevTools to filter: `console.log()` with filter `[UserRatings]`

Key debug points:
- `[UserRatings] Waiting for detail page container...` - Started detection
- `[UserRatings] Container found and ready: ...` - Container detected
- `[UserRatings] ✓ UI successfully injected and visible` - Injection succeeded
- `[UserRatings] Error during injection:` - Something failed (check error)
- `[UserRatings] ✓ Plugin fully initialized` - All systems ready

## Testing Individual Modules

### Test API calls:
```javascript
const data = await RatingsAPI.loadRatings('item-id');
console.log(data);
```

### Test UI creation:
```javascript
const ui = await RatingsUI.createRatingsUI('item-id');
document.body.appendChild(ui);
```

### Test container detection:
```javascript
const detector = new ContainerDetector();
const container = await detector.waitForContainer();
console.log('Found container:', container);
```

## Integration with HTML

The plugin expects these script tags in order:

```html
<!-- Load styles -->
<link rel="stylesheet" href="plugins/UserRating/css/styles.css">

<!-- Load modules (can be in any order, will wait in main.js) -->
<script src="plugins/UserRating/api.js"></script>
<script src="plugins/UserRating/ui.js"></script>
<script src="plugins/UserRating/container-detector.js"></script>
<script src="plugins/UserRating/detail-page-injector.js"></script>
<script src="plugins/UserRating/home-page-ratings.js"></script>

<!-- Entry point (MUST be last) -->
<script src="plugins/UserRating/main.js"></script>
```

## Performance Notes

- **Lazy loading**: Styles loaded only when initialized
- **Efficient detection**: MutationObserver reacts to changes vs polling
- **Minimal retries**: Container detection timeout prevents wasted attempts
- **No memory leaks**: Cleanup handlers remove observers and event listeners
