# Colorpicker - Tauri Backend

This directory contains the Rust backend for Colorpicker, migrated from Electron.

## Architecture

```
src-tauri/
├── src/
│   ├── main.rs          # Application entry point
│   ├── commands.rs      # Tauri command handlers (IPC)
│   └── store.rs         # Persistent storage module
├── icons/               # Application icons
├── Cargo.toml           # Rust dependencies
├── tauri.conf.json      # Tauri configuration
└── build.rs             # Build script
```

## Commands Implemented

### Settings Commands
- `settings_get_all` - Get all application settings
- `settings_get` - Get a specific setting by key
- `settings_set` - Set a specific setting value
- `settings_update` - Update multiple settings at once
- `settings_reset` - Reset all settings to defaults

### Window Commands
- `window_show` - Show a window by label
- `window_hide` - Hide a window by label
- `window_toggle` - Toggle window visibility

## Development

### Prerequisites
- Rust (latest stable)
- Node.js >=22
- Platform-specific requirements:
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `build-essential`, `libgtk-3-dev`, `libwebkit2gtk-4.0-dev`

### Running in Development

```bash
# Install dependencies (first time only)
npm install

# Run Tauri in development mode
npm run tauri:dev
```

This will:
1. Start the Vite dev server for the frontend
2. Compile the Rust backend
3. Launch the application with hot-reload

### Building for Production

```bash
# Build for current platform
npm run tauri:build
```

Outputs will be in `src-tauri/target/release/bundle/`

## Migration Status

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Tauri initialization
- [x] Basic Rust project structure
- [x] Configuration files
- [x] Multi-window setup
- [x] Build scripts

### 🚧 Phase 2: Storage (IN PROGRESS)
- [x] Basic settings struct
- [ ] Persistent storage with tauri-plugin-store
- [ ] Settings migration system
- [ ] Window state persistence

### 📋 Phase 3: IPC Commands (PLANNED)
- [x] Basic settings commands
- [ ] Open at login command
- [ ] Colorpicker store commands
- [ ] Event emission for settings changes

### 📋 Phase 4: Window Management (PLANNED)
- [ ] Multi-monitor support
- [ ] Window position validation
- [ ] Display change listeners
- [ ] Platform-specific decorations

### 📋 Phase 5: Eyedropper (PLANNED)
- [ ] Screen color picking (Windows)
- [ ] Screen color picking (macOS)
- [ ] Screen color picking (Linux)
- [ ] Cross-platform API

### 📋 Phase 6: Platform Features (PLANNED)
- [ ] Windows Mica effect
- [ ] macOS vibrancy
- [ ] Autostart configuration
- [ ] Theme detection

### 📋 Phase 7: Logging (PLANNED)
- [x] Basic Rust logging with `log` crate
- [ ] File-based logging
- [ ] Log rotation
- [ ] Debug vs production configs

## Differences from Electron

| Feature | Electron | Tauri |
|---------|----------|-------|
| Backend | Node.js | Rust |
| IPC | `ipcMain`/`ipcRenderer` | Tauri commands + events |
| Storage | electron-store | tauri-plugin-store |
| Bundle size | ~150MB | ~10-15MB |
| Memory usage | ~200MB idle | ~50MB idle |
| Startup time | ~2-3s | ~0.5s |

## Debugging

### Enable Rust Logs
```bash
# On Windows (PowerShell)
$env:RUST_LOG="debug"
npm run tauri:dev

# On macOS/Linux
RUST_LOG=debug npm run tauri:dev
```

### Open DevTools
In development mode, DevTools are available via:
- Right-click → Inspect Element
- F12 key
- View → Developer → Developer Tools

## Resources

- [Tauri Documentation](https://v2.tauri.app/)
- [Tauri API Reference](https://v2.tauri.app/reference/javascript/api/)
- [Rust Book](https://doc.rust-lang.org/book/)
