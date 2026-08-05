import { useEffect, useCallback } from 'react'
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
