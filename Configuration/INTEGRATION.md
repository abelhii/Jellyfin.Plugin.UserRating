# Integration Guide

## Replacing ratings.js with Modular Architecture

### Step 1: Copy New Files

Place the following files in your Configuration directory:
- `styles.css` (new)
- `api.js` (new)
- `ui.js` (new)
- `container-detector.js` (new)
- `detail-page-injector.js` (new)
- `home-page-ratings.js` (new)
- `main.js` (replaces old ratings.js)

You can delete the old `ratings.js` once migration is complete.

### Step 2: Update Your Plugin Configuration

If your plugin injects these scripts into the page, update the injection code to:

```csharp
// OLD - single file
Api.Injection.AddScript("~/plugins/UserRating/Configuration/ratings.js");

// NEW - modular approach
Api.Injection.AddScript("~/plugins/UserRating/Configuration/api.js");
Api.Injection.AddScript("~/plugins/UserRating/Configuration/ui.js");
Api.Injection.AddScript("~/plugins/UserRating/Configuration/container-detector.js");
Api.Injection.AddScript("~/plugins/UserRating/Configuration/detail-page-injector.js");
Api.Injection.AddScript("~/plugins/UserRating/Configuration/home-page-ratings.js");
Api.Injection.AddScript("~/plugins/UserRating/Configuration/main.js"); // LAST

Api.Injection.AddStylesheet("~/plugins/UserRating/Configuration/styles.css");
```

### Step 3: Folder Structure

Organize files in your plugin directory:

```
Jellyfin.Plugin.UserRating/
├── Configuration/
│   ├── styles.css                 (NEW)
│   ├── api.js                     (NEW)
│   ├── ui.js                      (NEW)
│   ├── container-detector.js      (NEW)
│   ├── detail-page-injector.js    (NEW)
│   ├── home-page-ratings.js       (NEW)
│   ├── main.js                    (NEW - replaces ratings.js)
│   ├── configPage.html
│   └── PluginConfiguration.cs
├── Api/
├── Data/
├── Models/
├── Plugin.cs
├── Jellyfin.Plugin.UserRating.csproj
└── manifest.json
```

### Step 4: Example HTML Integration

If you're manually including files in HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    
    <!-- User Ratings Plugin -->
    <link rel="stylesheet" href="/plugins/UserRating/Configuration/styles.css">
</head>
<body>
    <!-- ... Jellyfin content ... -->
    
    <!-- User Ratings Plugin - load modules first -->
    <script src="/plugins/UserRating/Configuration/api.js"></script>
    <script src="/plugins/UserRating/Configuration/ui.js"></script>
    <script src="/plugins/UserRating/Configuration/container-detector.js"></script>
    <script src="/plugins/UserRating/Configuration/detail-page-injector.js"></script>
    <script src="/plugins/UserRating/Configuration/home-page-ratings.js"></script>
    
    <!-- MUST be last - entry point -->
    <script src="/plugins/UserRating/Configuration/main.js"></script>
</body>
</html>
```

### Step 5: Verify Integration

After deploying, check browser DevTools console for:
- `[UserRatings] Loading plugin...` - main.js loaded
- `[UserRatings] Styles loaded` - CSS injected
- `[UserRatings] Initializing modules...` - Modules starting
- `[UserRatings] ✓ Detail page injector initialized` - Injection ready
- `[UserRatings] ✓ Home page ratings initialized` - Home features ready
- `[UserRatings] ✓ Plugin fully initialized` - All systems go

If you see errors about undefined modules, ensure scripts are loaded in correct order (dependencies before dependents).

## Troubleshooting

### "RatingsAPI is not defined"
- Check that `api.js` is loaded before `main.js`
- Verify script src paths are correct
- Check browser Network tab to confirm files load (200 status)

### "ContainerDetector is not defined"
- Same as above, ensure `container-detector.js` loads before `main.js`

### UI not appearing on detail page
- Open DevTools, search console for `[UserRatings]`
- Check if `detail-page-injector.js` is initialized
- Look for "Container found and ready" message
- If container timeout, increase timeout in `detail-page-injector.js`:
  ```javascript
  this.detector = new ContainerDetector({
      timeout: 30000,  // Increase to 30 seconds
      requireContent: true
  });
  ```

### Ratings tab not appearing on home page
- Check if `home-page-ratings.js` is initialized
- Look for "Home page ratings initialized" message
- If tabs aren't found, verify the `.emby-tabs-slider` or `.emby-tab-button` selectors match your Jellyfin version
- Try adding debug logging to `injectRatingsTab()` method

## Migration Checklist

- [ ] Copy all new .js files to Configuration/
- [ ] Copy styles.css to Configuration/
- [ ] Delete old ratings.js
- [ ] Update Plugin.cs or injection code to load new files in order
- [ ] Add CSS link to page injection
- [ ] Test on detail page - ratings should appear
- [ ] Test on home page - ratings tab should appear
- [ ] Check console for `✓ Plugin fully initialized` message
- [ ] Verify functionality:
  - [ ] Add rating on detail page
  - [ ] Delete rating
  - [ ] View all ratings list
  - [ ] View rated items on home page
  - [ ] Navigate between items

## Rollback Plan

If issues arise, you can:

1. Keep the old `ratings.js` file
2. In your plugin code, add a feature flag or config option
3. Check the flag at initialization time:
   ```csharp
   if (useNewModularVersion)
   {
       // Load new modular files
   }
   else
   {
       // Load old monolithic ratings.js
   }
   ```

This allows A/B testing the new version before full rollout.
