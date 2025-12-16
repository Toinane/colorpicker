import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import type { IAppSettings } from '@interfaces/settings'
import { createScopedLogger } from '@common/logger'

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
}

// Default settings
const DEFAULT_SETTINGS: IAppSettings = {
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
  eyedropperGridSize: 5,
  eyedropperShowHex: true,
  eyedropperHideMain: true,
}

const log = createScopedLogger('SettingsStore')

/**
 * Zustand store for application settings
 * Simplified version - uses local state only (no persistence)
 */
export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector((set, get) => ({
    ...DEFAULT_SETTINGS,

    // State management
    isLoading: false,
    isInitialized: false,
    error: null,

    /**
     * Initialize store - now just sets initialized flag
     */
    initialize: async () => {
      set({
        isInitialized: true,
        isLoading: false,
        error: null,
      })
    },

    /**
     * Update a single setting (local state only)
     */
    updateSetting: async <K extends keyof IAppSettings>(key: K, value: IAppSettings[K]) => {
      set({ [key]: value } as Partial<SettingsStore>)
      log.debug('Setting updated:', { [key]: value })
    },

    /**
     * Update multiple settings at once (local state only)
     */
    updateSettings: async (updates: Partial<IAppSettings>) => {
      set(updates)
      log.debug('Multiple settings updated', { updates })
    },

    /**
     * Reset all settings to defaults
     */
    resetSettings: async () => {
      set(DEFAULT_SETTINGS)
      log.info('Settings reset to default values')
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
