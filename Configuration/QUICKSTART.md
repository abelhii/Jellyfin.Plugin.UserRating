# Quick Start Guide

## File Summary

Your original `ratings.js` has been split into 7 focused files:

| File | Lines | Purpose |
|------|-------|---------|
| `main.js` | ~60 | Entry point, loads CSS, coordinates initialization |
| `api.js` | ~110 | All HTTP requests to backend API |
| `ui.js` | ~380 | Create & render rating UI components |
| `container-detector.js` | ~150 | Smart detection of when containers are ready |
| `detail-page-injector.js` | ~110 | Inject ratings into detail pages |
| `home-page-ratings.js` | ~240 | Home page tab and ratings list |
| `styles.css` | ~280 | All CSS styling |

**Total**: ~1330 lines (vs 1500 before), but better organized, maintainable, and testable.

## Quick Integration

### 1. Move Files
Copy these files from `Configuration/` to your plugin:
- `styles.css`
- `api.js`
- `ui.js`
- `container-detector.js`
- `detail-page-injector.js`
- `home-page-ratings.js`
- `main.js`

### 2. Update Plugin.cs
```csharp
public class Plugin : BasePlugin<PluginConfiguration>
{
    public override void Load()
    {
        base.Load();
        
        // Load order is important - modules must be loaded before main.js
        Api.Injection.AddScript("~/plugins/UserRating/Configuration/api.js");
        Api.Injection.AddScript("~/plugins/UserRating/Configuration/ui.js");
        Api.Injection.AddScript("~/plugins/UserRating/Configuration/container-detector.js");
        Api.Injection.AddScript("~/plugins/UserRating/Configuration/detail-page-injector.js");
        Api.Injection.AddScript("~/plugins/UserRating/Configuration/home-page-ratings.js");
        
        // MUST be last - entry point
        Api.Injection.AddScript("~/plugins/UserRating/Configuration/main.js");
        
        // Styles
        Api.Injection.AddStylesheet("~/plugins/UserRating/Configuration/styles.css");
    }
}
```

### 3. Test
1. Reload Jellyfin
2. Open browser DevTools (F12)
3. Go to Console tab
4. Navigate to a movie/show detail page
5. Look for: `[UserRatings] ✓ Plugin fully initialized`
6. You should see the rating widget on the page

## Key Files to Modify for Customization

### Changing Container Selectors
Edit `detail-page-injector.js`:
```javascript
if (!this.detector) {
    this.detector = new ContainerDetector({
        selectors: [
            '.detailPagePrimaryContent .detailSection',  // Primary
            '.myCustomContainer',                         // Add your selector
            '.detailSection',
            '.detailPagePrimaryContent',
            '.itemDetailPage .detailPageContent'
        ],
        timeout: 15000,
        requireContent: true
    });
}
```

### Changing UI Appearance
Edit `ui.js`:
- `createRatingsUI()` - Main container structure
- `createStarRating()` - Star rating display
- `displayAllRatings()` - Show ratings from other users

Edit `styles.css` to update colors, fonts, layout.

### Changing API Endpoints
Edit `api.js`:
- Replace `api/UserRatings/Item/${itemId}` with your endpoint
- Update parameter names if needed
- Modify response handling if API returns different structure

### Changing Home Page Behavior
Edit `home-page-ratings.js`:
- `injectRatingsTab()` - Where/how tab is added
- `renderRatingsList()` - Grid layout and card design
- `buildItemCards()` - Individual item card HTML

## Development Workflow

### 1. Make Changes to a Module
Edit any file and save.

### 2. Reload Page
Press F5 in browser to reload (DevTools console will show errors).

### 3. Check Console
Search for `[UserRatings]` to see all plugin logs:
```
[UserRatings] Loading plugin...
[UserRatings] Styles loaded
[UserRatings] Initializing modules...
[UserRatings] ✓ Detail page injector initialized
[UserRatings] ✓ Home page ratings initialized
[UserRatings] ✓ Plugin fully initialized
```

### 4. Debug Issues
Look for error logs starting with `[UserRatings] Error`:
```
[UserRatings] Error during injection: RatingsUI is not defined
```
This would mean `ui.js` didn't load.

## Testing Each Module Independently

### Test API Module
```javascript
const data = await RatingsAPI.loadRatings('item-id-here');
console.log('Ratings:', data);
```

### Test UI Creation
```javascript
const ui = await RatingsUI.createRatingsUI('item-id-here');
document.body.appendChild(ui); // See it appear!
```

### Test Container Detection
```javascript
const detector = new ContainerDetector();
const container = await detector.waitForContainer();
console.log('Container:', container);
```

### Test Injection
```javascript
DetailPageInjector.injectRatingsUI();
// Check console and page for injected UI
```

## Common Issues & Fixes

### Issue: "RatingsAPI is not defined"
**Cause**: Scripts loaded in wrong order  
**Fix**: Ensure in Plugin.cs:
1. `api.js`
2. `ui.js`
3. `container-detector.js`
4. `detail-page-injector.js`
5. `home-page-ratings.js`
6. `main.js` (LAST)

### Issue: "ContainerDetector is not defined"
**Cause**: Same as above  
**Fix**: Check script loading order in Plugin.cs

### Issue: Ratings widget not appearing
**Fix**: Check console for `[UserRatings]` logs. Look for:
- `Container found and ready:` ✓ = container detected
- `UI successfully injected:` ✓ = injection worked
- If missing, container may not match selectors
  - Edit selectors in `detail-page-injector.js`
  - Inspect page with DevTools to find actual container class

### Issue: Home page tab not appearing
**Fix**: Check if `[UserRatings] ✓ Home page ratings initialized` shows
- If no, `home-page-ratings.js` didn't load
- Check Plugin.cs script order
- If yes, try editing selectors in `injectRatingsTab()` to match your Jellyfin version

### Issue: Ratings disappear when page re-renders
**This is now fixed** with the new detector - it should stay visible. If it happens:
1. Check that UI is being injected into the right container
2. Verify container selector is finding the actual parent (not child)
3. Try increasing `requireContent: false` if container has no children initially

## Next Steps

1. **Read** [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Understand the key improvements
2. **Read** [REFACTORING.md](./REFACTORING.md) - Learn module details
3. **Read** [INTEGRATION.md](./INTEGRATION.md) - Complete integration checklist
4. **Customize** - Modify selectors, styles, API endpoints for your setup
5. **Test** - Verify on detail pages and home page
6. **Deploy** - Push to production

## Getting Help

When something doesn't work:

1. **Check console logs** - `[UserRatings]` prefix
2. **Check Network tab** - Are .js files loading? (200 status)
3. **Use DevTools** - Inspect HTML to find actual container classes
4. **Test modules** - Use console commands above to test each module
5. **Read comments** - Code has inline comments explaining logic

## Performance Tips

- Styles load async (no render blocking)
- Modules load in order but independently
- Detail page UI only injects if container found
- Home page ratings load on-demand (when tab clicked)
- No polling loops - uses reactive MutationObserver

## Code Quality

The refactored code:
- ✅ Uses `const`/`let` (no globals except module names)
- ✅ Has console.log with `[UserRatings]` prefix for debugging
- ✅ Uses modern async/await (not callbacks)
- ✅ Has JSDoc comments for public methods
- ✅ Cleans up observers and timers (no memory leaks)
- ✅ Gracefully handles errors with try/catch
- ✅ Has no external dependencies (pure JavaScript)
