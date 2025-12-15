# Type Inference Pattern for Preload Scripts

## Problem

Traditional approach requires maintaining types in two places:

```typescript
// ❌ Old approach: Redundant type definitions

// preload/settings.ts
contextBridge.exposeInMainWorld('api', {
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  },
})

// types/preload.d.ts - Must be manually kept in sync!
export type PreloadAPI = {
  settings: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
  }
}
```

**Issues:**

- Duplication of type definitions
- Manual synchronization required
- Easy to get out of sync
- More maintenance overhead

## Solution

Use TypeScript's `typeof` to automatically infer types from the implementation:

```typescript
// ✅ New approach: Single source of truth

// preload/settings.ts
const settingsApi = {
  getAll: () => ipcRenderer.invoke('settings:getAll') as Promise<IAppSettings>,
  get: <K extends keyof IAppSettings>(key: K) =>
    ipcRenderer.invoke('settings:get', key) as Promise<IAppSettings[K]>,
  set: <K extends keyof IAppSettings>(key: K, value: IAppSettings[K]) =>
    ipcRenderer.invoke('settings:set', key, value) as Promise<void>,
} as const // <-- Important: "as const" for literal types

const preloadApi = {
  settings: settingsApi,
} as const

contextBridge.exposeInMainWorld('api', preloadApi)

// Export the inferred type
export type PreloadAPI = typeof preloadApi

// types/preload.d.ts - Automatically synced!
import type { PreloadAPI } from '@preload/settings'

declare global {
  interface Window {
    api: PreloadAPI // <-- Types automatically inferred
  }
}
```

## Benefits

### 1. **Single Source of Truth**

Types are derived directly from implementation. No duplication.

### 2. **Automatic Type Inference**

TypeScript automatically infers exact types including:

- Function signatures
- Parameter types
- Return types
- Generic constraints

### 3. **Compile-Time Safety**

Changes to the preload script automatically update types everywhere.

### 4. **Less Code to Maintain**

No need to manually write and sync type definitions.

### 5. **Better IntelliSense**

More accurate autocomplete since types match implementation exactly.

## Implementation Details

### Key Points

1. **Use `as const`**: Ensures literal types are preserved

   ```typescript
   const api = { ... } as const  // ✅
   const api = { ... }           // ❌ Types are too wide
   ```

2. **Type assertions for Promises**: Help TypeScript understand return types

   ```typescript
   get: (key) => ipcRenderer.invoke('...') as Promise<Settings>
   ```

3. **Generic type parameters**: Preserve type relationships

   ```typescript
   get: <K extends keyof IAppSettings>(key: K) =>
     ipcRenderer.invoke('settings:get', key) as Promise<IAppSettings[K]>
   ```

4. **Export the type**: Make it available for global declarations
   ```typescript
   export type PreloadAPI = typeof preloadApi
   ```

### Complete Example

```typescript
// preload/settings.ts
import { contextBridge, ipcRenderer } from 'electron'
import type { IAppSettings } from '@electron/stores/settingsStore'

const settingsApi = {
  getAll: () => ipcRenderer.invoke('settings:getAll') as Promise<IAppSettings>,

  get: <K extends keyof IAppSettings>(key: K) =>
    ipcRenderer.invoke('settings:get', key) as Promise<IAppSettings[K]>,

  set: <K extends keyof IAppSettings>(key: K, value: IAppSettings[K]) =>
    ipcRenderer.invoke('settings:set', key, value) as Promise<void>,

  update: (updates: Partial<IAppSettings>) =>
    ipcRenderer.invoke('settings:update', updates) as Promise<IAppSettings>,

  onSettingsChange: (callback: (settings: IAppSettings) => void) => {
    const listener = (_: Electron.IpcRendererEvent, settings: IAppSettings) => callback(settings)
    ipcRenderer.on('settings:changed', listener)
    return () => ipcRenderer.removeListener('settings:changed', listener)
  },
} as const

const preloadApi = {
  settings: settingsApi,
} as const

contextBridge.exposeInMainWorld('api', preloadApi)

export type PreloadAPI = typeof preloadApi
```

```typescript
// types/preload.d.ts
import type { PreloadAPI } from '@preload/settings'

declare global {
  interface Window {
    api: PreloadAPI
  }
}
```

```typescript
// React component - Full type safety!
function MyComponent() {
  const [theme, setTheme] = useState<string>('')

  useEffect(() => {
    // TypeScript knows exact types!
    window.api.settings.get('theme').then(setTheme)
    //                          ↑
    //    Autocomplete shows all available keys

    // Type error if wrong type
    window.api.settings.set('theme', 123) // ❌ Error: number not assignable to string
    window.api.settings.set('theme', 'dark') // ✅ Correct
  }, [])
}
```

## Migration Guide

### Step 1: Refactor Preload Script

Before:

```typescript
contextBridge.exposeInMainWorld('api', {
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
  },
})
```

After:

```typescript
const settingsApi = {
  get: <K extends keyof IAppSettings>(key: K) =>
    ipcRenderer.invoke('settings:get', key) as Promise<IAppSettings[K]>,
} as const

const preloadApi = {
  settings: settingsApi,
} as const

contextBridge.exposeInMainWorld('api', preloadApi)

export type PreloadAPI = typeof preloadApi
```

### Step 2: Update Type Declarations

Before:

```typescript
// preload.d.ts
export type PreloadAPI = {
  settings: {
    get: (key: string) => Promise<any>
  }
}
```

After:

```typescript
// preload.d.ts
import type { PreloadAPI } from '@preload/settings'

declare global {
  interface Window {
    api: PreloadAPI
  }
}
```

### Step 3: Add Path Alias (if needed)

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@preload/*": ["./src/preload/*"]
    }
  }
}
```

## Advanced Patterns

### Multiple Preload Scripts

If you have multiple preload scripts (e.g., one per window), combine their types:

```typescript
// preload/colorpicker.ts
export type ColorpickerAPI = typeof colorpickerApi

// preload/settings.ts
export type SettingsAPI = typeof settingsApi

// types/preload.d.ts
import type { ColorpickerAPI } from '@preload/colorpicker'
import type { SettingsAPI } from '@preload/settings'

declare global {
  interface Window {
    api: ColorpickerAPI | SettingsAPI // Union type
  }
}
```

### Shared API Across Windows

If all windows expose the same API:

```typescript
// preload/shared.ts
export const createSharedAPI = () =>
  ({
    settings: settingsApi,
    colorpicker: colorpickerApi,
  }) as const

export type SharedAPI = ReturnType<typeof createSharedAPI>

// preload/colorpicker.ts
import { createSharedAPI } from './shared'
contextBridge.exposeInMainWorld('api', createSharedAPI())

// preload/settings.ts
import { createSharedAPI } from './shared'
contextBridge.exposeInMainWorld('api', createSharedAPI())

// types/preload.d.ts
import type { SharedAPI } from '@preload/shared'
declare global {
  interface Window {
    api: SharedAPI
  }
}
```

## Comparison

| Aspect           | Manual Types              | Type Inference            |
| ---------------- | ------------------------- | ------------------------- |
| Code duplication | ❌ High                   | ✅ None                   |
| Maintenance      | ❌ Manual sync required   | ✅ Automatic              |
| Type safety      | ⚠️ Can get out of sync    | ✅ Always correct         |
| IntelliSense     | ⚠️ May be inaccurate      | ✅ Perfect                |
| Refactoring      | ❌ Update multiple places | ✅ Update once            |
| Learning curve   | ✅ Simple                 | ⚠️ Requires understanding |

## Best Practices

1. **Always use `as const`** to preserve literal types
2. **Add explicit type assertions** for Promise return types
3. **Use generics** to maintain type relationships
4. **Export the inferred type** from preload scripts
5. **Keep preload logic simple** - complex logic should be in main process
6. **Document the pattern** so team members understand it

## Common Mistakes

### ❌ Forgetting `as const`

```typescript
const api = {
  get: () => ipcRenderer.invoke('get'),
} // Types are too wide
```

### ❌ Not exporting the type

```typescript
const api = { ... } as const
contextBridge.exposeInMainWorld('api', api)
// Missing: export type PreloadAPI = typeof api
```

### ❌ Wrong type assertion

```typescript
get: (key) => ipcRenderer.invoke('get', key) as any // Too loose
```

### ✅ Correct approach

```typescript
const api = {
  get: <K extends keyof Settings>(key: K) => ipcRenderer.invoke('get', key) as Promise<Settings[K]>,
} as const

export type PreloadAPI = typeof api
```

## Conclusion

The type inference pattern eliminates redundancy and ensures your types always match your implementation. It's a more maintainable and type-safe approach that leverages TypeScript's powerful type system.

**Key Takeaway**: Let TypeScript do the work for you. Define your implementation once, and let the compiler infer the types everywhere else.
