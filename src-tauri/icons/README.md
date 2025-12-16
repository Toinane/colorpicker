# Tauri Icons

This directory should contain application icons in the following formats:

## Required Icons

- `32x32.png` - Small icon for Windows
- `128x128.png` - Standard icon
- `128x128@2x.png` - Retina icon
- `icon.icns` - macOS app icon bundle
- `icon.ico` - Windows app icon

## Use Tauri Icon CLI

```bash
npm install -D @tauri-apps/cli

# Generate all icon sizes from a 1024x1024 PNG
npm run tauri icon path/to/icon.png
```
