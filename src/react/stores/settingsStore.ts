import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { IAppSettings } from '@electron/stores/settingsStore'

export interface SettingsStore extends IAppSettings {
  // Loading state
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  updateSetting: <K extends keyof IAppSettings>(key: K, value: IAppSettings[K]) => Promise<void>
  updateSettings: (updates: Partial<IAppSettings>) => Promise<void>
  resetSettings: () => Promise<void>
  setOpenAtLogin: (value: boolean) => Promise<void>
}

/**
 * Zustand store for application settings
 * Automatically syncs with Electron main process via IPC
 */
export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector((set, get) => ({
    // Default values (will be overwritten on init)
    openAtLogin: false,
    theme: 'system' as const,
    language: 'en_US',
    sendCrashReport: true,
    keepOnTop: false,
    showHistory: true,
    maxHistorySize: 50,
    defaultFormat: 'hex' as const,
    isBordered: false,
    isFullColored: false,
    isVibrant: true,

    // State management
    isLoading: false,
    isInitialized: false,
    error: null,

    /**
     * Initialize store with settings from Electron
     * Should be called once when the app starts
     */
    initialize: async () => {
      try {
        set({ isLoading: true, error: null })

        // Fetch all settings from Electron
        const settings = await window.api.settings.getAll()

        // Set up listener for settings changes from Electron
        window.api.settings.onSettingsChange((updatedSettings) => {
          set({
            ...updatedSettings,
            isInitialized: true,
          })
        })

        set({
          ...settings,
          isLoading: false,
          isInitialized: true,
        })
      } catch (error) {
        console.error('Failed to initialize settings:', error)
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize settings',
        })
      }
    },

    /**
     * Update a single setting
     * Automatically syncs with Electron main process
     */
    updateSetting: async <K extends keyof IAppSettings>(key: K, value: IAppSettings[K]) => {
      try {
        // Optimistic update
        set({ [key]: value } as Partial<SettingsStore>)

        // Sync with Electron
        await window.api.settings.set(key, value)
      } catch (error) {
        console.error(`Failed to update setting ${String(key)}:`, error)

        // Revert on error
        const currentValue = await window.api.settings.get(key)
        set({ [key]: currentValue } as Partial<SettingsStore>)

        throw error
      }
    },

    /**
     * Update multiple settings at once
     * More efficient than calling updateSetting multiple times
     */
    updateSettings: async (updates: Partial<IAppSettings>) => {
      try {
        // Optimistic update
        set(updates)

        // Sync with Electron
        const updatedSettings = await window.api.settings.update(updates)

        // Ensure we have the latest state
        set(updatedSettings)
      } catch (error) {
        console.error('Failed to update settings:', error)

        // Revert on error
        const currentSettings = await window.api.settings.getAll()
        set(currentSettings)

        throw error
      }
    },

    /**
     * Reset all settings to defaults
     */
    resetSettings: async () => {
      try {
        const defaultSettings = await window.api.settings.reset()
        set(defaultSettings)
      } catch (error) {
        console.error('Failed to reset settings:', error)
        throw error
      }
    },

    /**
     * Special handler for openAtLogin which requires OS integration
     */
    setOpenAtLogin: async (value: boolean) => {
      try {
        // Optimistic update
        set({ openAtLogin: value })

        // Sync with Electron (includes OS-level changes)
        const success = await window.api.settings.setOpenAtLogin(value)

        if (!success) {
          throw new Error('Failed to set open at login')
        }
      } catch (error) {
        console.error('Failed to set open at login:', error)

        // Revert on error
        const currentValue = await window.api.settings.get('openAtLogin')
        set({ openAtLogin: currentValue })

        throw error
      }
    },
  })),
)

/**
 * Selector hooks for specific settings
 * Use these for better performance when you only need specific settings
 */

export const useOpenAtLogin = () => useSettingsStore((state) => state.openAtLogin)
export const useKeepOnTop = () => useSettingsStore((state) => state.keepOnTop)
export const useTheme = () => useSettingsStore((state) => state.theme)
export const useLanguage = () => useSettingsStore((state) => state.language)
export const useDefaultFormat = () => useSettingsStore((state) => state.defaultFormat)

/**
 * Action hooks for updating settings
 */
export const useUpdateSetting = () => useSettingsStore((state) => state.updateSetting)
export const useUpdateSettings = () => useSettingsStore((state) => state.updateSettings)
export const useSetOpenAtLogin = () => useSettingsStore((state) => state.setOpenAtLogin)
