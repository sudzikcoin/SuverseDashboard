# PWA Setup Notes

## Overview
SuVerse is now a Progressive Web App (PWA) that can be installed on mobile devices and desktops.

## Files Created/Modified

### New Files
| File | Purpose |
|------|---------|
| `public/manifest.json` | PWA manifest with app name, icons, colors |
| `public/sw.js` | Service worker for installability and basic caching |
| `public/icons/icon-192.png` | 192x192 app icon |
| `public/icons/icon-512.png` | 512x512 app icon |
| `public/apple-touch-icon.png` | iOS home screen icon |
| `components/PwaInit.tsx` | Service worker registration component |

### Modified Files
| File | Changes |
|------|---------|
| `app/layout.tsx` | Added manifest link, viewport meta, Apple PWA meta tags, PwaInit component |

## How It Works

### Manifest
The `manifest.json` tells browsers this is an installable app:
- `name`: "SuVerse Tax Credit Dashboard" (full name)
- `short_name`: "SuVerse" (shown under icon)
- `theme_color`: `#10b981` (emerald green)
- `background_color`: `#0B1220` (dark navy)
- `display`: "standalone" (no browser chrome)

### Service Worker
The `sw.js` provides:
- Network-first caching strategy
- Minimal offline shell caching
- Automatic cleanup of old caches

### Installation

**Android (Chrome):**
1. Open the app in Chrome
2. Tap the three-dot menu
3. Tap "Install app" or "Add to Home screen"

**iOS (Safari):**
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

## Customization

### Change App Name
Edit `public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "YourApp"
}
```

### Change Theme Color
1. Edit `public/manifest.json`:
   ```json
   { "theme_color": "#your-color" }
   ```
2. Edit `app/layout.tsx` viewport:
   ```typescript
   export const viewport: Viewport = {
     themeColor: "#your-color",
   };
   ```

### Change Icons
1. Replace the PNG files in `public/icons/`:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
2. Replace `public/apple-touch-icon.png` (180x180px recommended)

## Caveats
- Offline support is minimal (shell only) - the app primarily works online
- Service worker caches are cleared on version updates
- API requests are never cached (authentication reasons)

## Testing PWA

### Chrome DevTools
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" section - should show app info
4. Check "Service Workers" - should show `sw.js` active

### Lighthouse
1. Open DevTools
2. Go to "Lighthouse" tab
3. Run a PWA audit
4. Should pass basic installability checks
