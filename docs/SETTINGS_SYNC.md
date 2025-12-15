# Settings Synchronization System

A modern, type-safe, and efficient system for synchronizing application settings between Electron's main process and React renderer processes.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Main Process                             │
├─────────────────────────────────────────────────────────────────┤
│  SettingsStore (Electron)                                        │
│  - electron-store for persistence                                │
│  - IPC handlers for CRUD operations                              │
│  - Broadcasting to all renderer processes                        │
│  - OS integration (e.g., openAtLogin)                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │ IPC Communication
                       │ (bidirectional)
┌──────────────────────┴──────────────────────────────────────────┐
│                      Preload Script                              │
├─────────────────────────────────────────────────────────────────┤
│  - Type-safe bridge between main and renderer                   │
│  - Exposes window.api.settings methods                           │
│  - Event listeners for settings changes                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                    Renderer Process (React)                      │
├─────────────────────────────────────────────────────────────────┤
│  Zustand Store (React)                                           │
│  - Local state management                                        │
│  - Optimistic updates                                            │
│  - Automatic sync with main process                              │
│  - Error handling and rollback                                   │
│                                                                   │
│  Custom Hooks                                                    │
│  - useSetting() - Single setting management                      │
│  - useSettings() - Multiple settings management                  │
│  - useOpenAtLogin() - Special OS integration                     │
│  - useDebouncedSetting() - For frequent updates                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. **Type Safety**

- Full TypeScript support across all layers
- Type inference for settings keys and values
- Compile-time error checking

### 2. **Automatic Synchronization**

- Changes propagate automatically between all windows
- No manual event handling required
- Real-time updates across all renderer processes

### 3. **Optimistic Updates**

- UI updates immediately for better UX
- Automatic rollback on errors
- Error handling built-in

### 4. **Performance Optimized**

- Selective subscriptions with Zustand
- Debounced updates for frequent changes
- Efficient re-rendering

### 5. **Persistence**

- Automatic saving to disk via electron-store
- JSON schema validation
- Migration support for version updates

## Usage Examples

### Basic Usage in React Components

```tsx
import { useSetting } from '@react/hooks'

function MyComponent() {
  const [theme, setTheme] = useSetting('theme')

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  )
}
```

### Using Multiple Settings

```tsx
import { useSettings } from '@react/hooks'

function AdvancedSettings() {
  const { values, updateSettings } = useSettings(['keepOnTop', 'showHistory', 'maxHistorySize'])

  const handleSave = async () => {
    await updateSettings({
      keepOnTop: true,
      showHistory: true,
      maxHistorySize: 100,
    })
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={values.keepOnTop}
          onChange={(e) => updateSettings({ keepOnTop: e.target.checked })}
        />
        Keep on top
      </label>
      <label>
        Max history: {values.maxHistorySize}
        <input
          type="range"
          min={10}
          max={200}
          value={values.maxHistorySize}
          onChange={(e) => updateSettings({ maxHistorySize: Number(e.target.value) })}
        />
      </label>
    </div>
  )
}
```

### Special OS Integration Settings

```tsx
import { useOpenAtLogin } from '@react/hooks'

function StartupSettings() {
  const [openAtLogin, setOpenAtLogin] = useOpenAtLogin()

  const handleChange = async (checked: boolean) => {
    try {
      await setOpenAtLogin(checked)
      // OS-level registration is handled automatically
    } catch (error) {
      console.error('Failed to update:', error)
      // Show error to user
    }
  }

  return (
    <label>
      <input
        type="checkbox"
        checked={openAtLogin}
        onChange={(e) => handleChange(e.target.checked)}
      />
      Open at login
    </label>
  )
}
```

### Debounced Updates (for sliders, text inputs)

```tsx
import { useDebouncedSetting } from '@react/hooks'

function VolumeControl() {
  const [maxHistorySize, setMaxHistorySize] = useDebouncedSetting('maxHistorySize', 500)

  return (
    <input
      type="range"
      min={10}
      max={200}
      value={maxHistorySize}
      onChange={(e) => setMaxHistorySize(Number(e.target.value))}
    />
  )
  // Updates are sent to Electron only after 500ms of inactivity
}
```

### Watching for Changes

```tsx
import { useSettingWatcher } from '@react/hooks'

function ThemeWatcher() {
  useSettingWatcher('theme', (theme) => {
    console.log('Theme changed to:', theme)
    // Apply theme changes
    document.documentElement.setAttribute('data-theme', theme)
  })

  return null
}
```

### Initialize Settings in App Root

```tsx
import SettingsProvider from '@components/SettingsProvider'

function App() {
  return (
    <SettingsProvider fallback={<LoadingScreen />}>
      <YourApp />
    </SettingsProvider>
  )
}
```

## Adding New Settings

### Step 1: Update the Schema

Edit `src/electron/stores/settingsStore.ts`:

```typescript
export interface IAppSettings {
  // ... existing settings
  myNewSetting: string // Add your setting
}

const settingsSchema: Schema<IAppSettings> = {
  // ... existing schema
  myNewSetting: {
    type: 'string',
    default: 'default value',
    minLength: 1,
    maxLength: 100,
  },
}
```

### Step 2: Create a Hook (Optional)

Edit `src/react/hooks/useSettings.ts`:

```typescript
export function useMyNewSetting(): [string, (value: string) => Promise<void>] {
  const myNewSetting = useSettingsStore((state) => state.myNewSetting)
  const updateSetting = useSettingsStore((state) => state.updateSetting)

  const setMyNewSetting = useCallback(
    async (value: string) => {
      await updateSetting('myNewSetting', value)
    },
    [updateSetting],
  )

  return [myNewSetting, setMyNewSetting]
}
```

### Step 3: Use in Your Component

```tsx
import { useSetting } from '@react/hooks'

function MyComponent() {
  const [myNewSetting, setMyNewSetting] = useSetting('myNewSetting')

  return <input value={myNewSetting} onChange={(e) => setMyNewSetting(e.target.value)} />
}
```

## Advanced Features

### Direct Access from Main Process

```typescript
import { getSettingsStore } from '@electron/stores/settingsStore'

const settingsStore = getSettingsStore()

// Read a setting
const theme = settingsStore.get('theme')

// Update a setting
settingsStore.set('theme', 'dark')

// Update multiple settings
settingsStore.update({
  theme: 'dark',
  keepOnTop: true,
})

// Watch for changes
const unwatch = settingsStore.watch((settings) => {
  console.log('Settings changed:', settings)
})

// Later: stop watching
unwatch()
```

### Migrations

Add migrations when updating the app version:

```typescript
// In settingsStore.ts
migrations: {
  '>=3.1.0': (store) => {
    // Migrate old setting name to new name
    const oldValue = store.get('oldSettingName')
    store.set('newSettingName', oldValue)
    store.delete('oldSettingName')
  },
}
```

## Best Practices

### 1. Use Selectors for Performance

```tsx
// ✅ Good - Only re-renders when theme changes
const theme = useSettingsStore((state) => state.theme)

// ❌ Bad - Re-renders on any setting change
const settings = useSettingsStore()
const theme = settings.theme
```

### 2. Debounce Frequent Updates

```tsx
// ✅ Good - For sliders, text inputs
const [value, setValue] = useDebouncedSetting('maxHistorySize', 500)

// ❌ Bad - Sends IPC message on every keystroke
const [value, setValue] = useSetting('maxHistorySize')
```

### 3. Handle Errors

```tsx
// ✅ Good - User feedback on errors
const handleChange = async (value: boolean) => {
  try {
    await setKeepOnTop(value)
  } catch (error) {
    showNotification('Failed to update setting', 'error')
  }
}

// ❌ Bad - Silent failures
const handleChange = (value: boolean) => {
  setKeepOnTop(value)
}
```

### 4. Initialize Early

```tsx
// ✅ Good - Wrap app root
<SettingsProvider>
  <App />
</SettingsProvider>

// ❌ Bad - Initialize in each component
// (causes multiple initializations)
```

## File Structure

```
src/
├── electron/
│   └── stores/
│       └── settingsStore.ts       # Main process store
├── react/
│   ├── stores/
│   │   └── settingsStore.ts       # React Zustand store
│   ├── hooks/
│   │   └── useSettings.ts         # Custom hooks
│   └── components/
│       └── SettingsProvider.tsx   # Initialization wrapper
├── preload/
│   └── settings.ts                # Preload bridge
└── types/
    └── preload.d.ts               # Type definitions
```

## Troubleshooting

### Settings not syncing?

1. Ensure `SettingsProvider` wraps your app
2. Check that `initSettingsStore()` is called in main.ts
3. Verify the preload script is properly registered

### Changes not persisting?

1. Check file permissions in userData/config
2. Verify electron-store is working: check config files
3. Look for errors in console/logs

### TypeScript errors?

1. Ensure all types are exported correctly
2. Rebuild TypeScript: `npm run lint`
3. Check tsconfig.json paths are correct

## Performance Considerations

- Settings are loaded once on app start
- Changes are persisted asynchronously
- Re-renders are minimized with Zustand selectors
- Debouncing prevents excessive IPC calls
- Broadcasting is optimized to avoid redundant updates

## Security

- Preload script uses contextBridge (secure)
- Settings are validated by JSON schema
- No arbitrary code execution
- File access is restricted to userData directory
