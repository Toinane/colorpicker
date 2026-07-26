import { useEffect, useCallback, useState } from 'react'
import type { IAppSettings } from '@interfaces/settings'
import { useSettingsStore } from '@stores/settingsStore'
import {
  setKeepOnTop as applyKeepOnTop,
  setOpenAtLogin as applyOpenAtLogin,
  getOpenAtLogin,
} from '@common/ipc'

/**
 * Hook to initialize settings on app startup
 * Should be called once at the root level of your app
 */
export function useInitializeSettings() {
  const initialize = useSettingsStore((state) => state.initialize)
  const isInitialized = useSettingsStore((state) => state.isInitialized)
  const isLoading = useSettingsStore((state) => state.isLoading)
  const error = useSettingsStore((state) => state.error)

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initialize()
    }
  }, [initialize, isInitialized, isLoading])

  return { isInitialized, isLoading, error }
}

/**
 * Hook to get a specific setting with automatic updates
 * @param key - The setting key to watch
 * @returns The current value of the setting
 */
export function useSetting<K extends keyof IAppSettings>(
  key: K,
): [IAppSettings[K], (value: IAppSettings[K]) => Promise<void>] {
  const value = useSettingsStore((state) => state[key])
  const updateSetting = useSettingsStore((state) => state.updateSetting)

  const setValue = useCallback(
    async (newValue: IAppSettings[K]) => {
      await updateSetting(key, newValue)
    },
    [key, updateSetting],
  )

  return [value, setValue]
}

/**
 * Hook to get and update multiple settings at once
 * @param keys - Array of setting keys to watch
 * @returns Object with current values and update function
 */
export function useSettings<K extends keyof IAppSettings>(
  keys: K[],
): {
  values: Pick<IAppSettings, K>
  updateSettings: (updates: Partial<Pick<IAppSettings, K>>) => Promise<void>
} {
  const store = useSettingsStore()
  const updateSettingsFn = store.updateSettings

  const values = keys.reduce(
    (acc, key) => {
      acc[key] = store[key]
      return acc
    },
    {} as Pick<IAppSettings, K>,
  )

  const updateSettings = useCallback(
    async (updates: Partial<Pick<IAppSettings, K>>) => {
      await updateSettingsFn(updates)
    },
    [updateSettingsFn],
  )

  return { values, updateSettings }
}

/**
 * Hook for openAtLogin with OS integration
 * @returns Current value and setter function
 */
export function useOpenAtLogin(): [boolean, (value: boolean) => Promise<void>] {
  const openAtLogin = useSettingsStore((state) => state.openAtLogin)
  const updateSetting = useSettingsStore((state) => state.updateSetting)

  // Reflect the real OS state on load, in case it drifted from the persisted
  // setting (e.g. the user removed the startup entry via Task Manager).
  useEffect(() => {
    getOpenAtLogin()
      .then((actual) => {
        if (actual !== useSettingsStore.getState().openAtLogin) {
          updateSetting('openAtLogin', actual)
        }
      })
      .catch((error) => console.error('Failed to read autostart state from OS:', error))
  }, [updateSetting])

  const setOpenAtLogin = useCallback(
    async (value: boolean) => {
      // Apply to the OS first; only persist if it actually succeeded
      await applyOpenAtLogin(value)
      await updateSetting('openAtLogin', value)
    },
    [updateSetting],
  )

  return [openAtLogin, setOpenAtLogin]
}

/**
 * Hook for keepOnTop setting
 * @returns Current value and setter function
 */
export function useKeepOnTop(): [boolean, (value: boolean) => Promise<void>] {
  const keepOnTop = useSettingsStore((state) => state.keepOnTop)
  const updateSetting = useSettingsStore((state) => state.updateSetting)

  const setKeepOnTop = useCallback(
    async (value: boolean) => {
      // Apply to the window first; only persist if it actually succeeded
      await applyKeepOnTop(value)
      await updateSetting('keepOnTop', value)
    },
    [updateSetting],
  )

  return [keepOnTop, setKeepOnTop]
}

/**
 * Hook for closeToTray setting
 * @returns Current value and setter function
 */
export function useCloseToTray(): [boolean, (value: boolean) => Promise<void>] {
  const closeToTray = useSettingsStore((state) => state.closeToTray)
  const updateSetting = useSettingsStore((state) => state.updateSetting)

  const setCloseToTray = useCallback(
    async (value: boolean) => {
      await updateSetting('closeToTray', value)
    },
    [updateSetting],
  )

  return [closeToTray, setCloseToTray]
}

/**
 * Hook for theme setting
 * @returns Current value and setter function
 */
export function useThemeSetting(): [
  'light' | 'dark' | 'system',
  (value: 'light' | 'dark' | 'system') => Promise<void>,
] {
  const theme = useSettingsStore((state) => state.theme)
  const updateSetting = useSettingsStore((state) => state.updateSetting)

  const setTheme = useCallback(
    async (value: 'light' | 'dark' | 'system') => {
      await updateSetting('theme', value)
    },
    [updateSetting],
  )

  return [theme, setTheme]
}

/**
 * Hook to watch a specific setting for changes
 * Calls the callback whenever the setting changes
 * @param key - The setting key to watch
 * @param callback - Function to call when the setting changes
 */
export function useSettingWatcher<K extends keyof IAppSettings>(
  key: K,
  callback: (value: IAppSettings[K]) => void,
): void {
  const value = useSettingsStore((state) => state[key])

  useEffect(() => {
    callback(value)
  }, [value, callback])
}

/**
 * Hook to debounce setting updates
 * Useful for inputs that update frequently (e.g., sliders, text inputs)
 * @param key - The setting key to update
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns Current value and setter function
 */
export function useDebouncedSetting<K extends keyof IAppSettings>(
  key: K,
  delay: number = 500,
): [IAppSettings[K], (value: IAppSettings[K]) => void] {
  const storeValue = useSettingsStore((state) => state[key])
  const updateSetting = useSettingsStore((state) => state.updateSetting)
  const [localValue, setLocalValue] = useState<IAppSettings[K]>(storeValue)
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Sync local value with store value
  useEffect(() => {
    setLocalValue(storeValue as IAppSettings[K])
  }, [storeValue])

  const setValue = useCallback(
    (newValue: IAppSettings[K]) => {
      setLocalValue(newValue as IAppSettings[K])

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Set new timeout
      const newTimeoutId = setTimeout(() => {
        updateSetting(key, newValue)
      }, delay)

      setTimeoutId(newTimeoutId)
    },
    [key, delay, updateSetting, timeoutId],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return [localValue, setValue]
}

/**
 * Hook to get all settings
 * @returns All settings and update functions
 */
export function useAllSettings() {
  const store = useSettingsStore()

  return {
    settings: {
      openAtLogin: store.openAtLogin,
      theme: store.theme,
      language: store.language,
      sendCrashReport: store.sendCrashReport,
      keepOnTop: store.keepOnTop,
      showHistory: store.showHistory,
      maxHistorySize: store.maxHistorySize,
      defaultFormat: store.defaultFormat,
      isBordered: store.isBordered,
      isFullColored: store.isFullColored,
      isVibrant: store.isVibrant,
    } as IAppSettings,
    updateSetting: store.updateSetting,
    updateSettings: store.updateSettings,
    resetSettings: store.resetSettings,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    error: store.error,
  }
}
