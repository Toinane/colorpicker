# Settings System - Quick Reference

## Quick Start

### 1. Initialize in App Root

```tsx
import SettingsProvider from '@components/SettingsProvider'

function App() {
  return (
    <SettingsProvider>
      <YourApp />
    </SettingsProvider>
  )
}
```

### 2. Use in Any Component

```tsx
import { useSetting } from '@react/hooks'

function MyComponent() {
  const [theme, setTheme] = useSetting('theme')
  return <button onClick={() => setTheme('dark')}>Dark Mode</button>
}
```

## Common Patterns

### Single Setting

```tsx
const [value, setValue] = useSetting('settingKey')
```

### Multiple Settings

```tsx
const { values, updateSettings } = useSettings(['key1', 'key2'])
await updateSettings({ key1: 'value1', key2: 'value2' })
```

### With Error Handling

```tsx
try {
  await setValue(newValue)
} catch (error) {
  showNotification('Failed to update')
}
```

### Debounced (Sliders, Text Input)

```tsx
const [value, setValue] = useDebouncedSetting('key', 500)
```

### Watch for Changes

```tsx
useSettingWatcher('theme', (theme) => {
  applyTheme(theme)
})
```

## Available Hooks

| Hook                                 | Use Case               |
| ------------------------------------ | ---------------------- |
| `useSetting('key')`                  | Single setting         |
| `useSettings(['key1', 'key2'])`      | Multiple settings      |
| `useOpenAtLogin()`                   | OS integration         |
| `useKeepOnTop()`                     | Window behavior        |
| `useThemeSetting()`                  | Theme management       |
| `useDebouncedSetting('key', ms)`     | Frequent updates       |
| `useSettingWatcher('key', callback)` | React to changes       |
| `useAllSettings()`                   | All settings + actions |

## Available Settings

```typescript
openAtLogin: boolean
theme: 'light' | 'dark' | 'system'
language: string
sendCrashReport: boolean
keepOnTop: boolean
showHistory: boolean
maxHistorySize: number
defaultFormat: 'hex' | 'rgb' | 'hsl' | 'hsv'
isBordered: boolean
isFullColored: boolean
isVibrant: boolean
```

## Main Process Access

```typescript
import { getSettingsStore } from '@electron/stores/settingsStore'

const store = getSettingsStore()
store.get('theme')
store.set('theme', 'dark')
store.update({ theme: 'dark', keepOnTop: true })
```

## Common Mistakes

❌ **Don't do this:**

```tsx
const settings = useSettingsStore() // Re-renders on ANY change
```

✅ **Do this instead:**

```tsx
const theme = useSettingsStore((state) => state.theme) // Only re-renders when theme changes
```

❌ **Don't do this:**

```tsx
const [value, setValue] = useSetting('key')
onChange={() => setValue(newValue)} // For frequent updates
```

✅ **Do this instead:**

```tsx
const [value, setValue] = useDebouncedSetting('key', 500)
onChange={() => setValue(newValue)} // Debounced
```

## Troubleshooting

### Settings not loading?

- Ensure `<SettingsProvider>` wraps your app
- Check `initSettingsStore()` is called in main.ts

### Changes not persisting?

- Check console for errors
- Verify electron-store has write permissions
- Look in userData/config for .json files

### TypeScript errors?

- Restart TypeScript server in VS Code
- Check imports use correct paths (@react/hooks, @electron/stores)

## File Locations

- **Main Store**: `src/electron/stores/settingsStore.ts`
- **React Store**: `src/react/stores/settingsStore.ts`
- **Hooks**: `src/react/hooks/useSettings.ts`
- **Types**: `src/types/preload.d.ts`
- **Docs**: `docs/SETTINGS_SYNC.md`

## Need More Help?

See full documentation: `docs/SETTINGS_SYNC.md`
See examples: `src/react/windows/settings/pages/examples/SettingsExamplesPage.tsx`
