import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { load, type Store } from '@tauri-apps/plugin-store'

import type { IAppSettings } from '@interfaces/settings'
import { createScopedLogger } from '@common/logger'
import { resolveSupportedLanguage } from '@common/languages'
import { emitSettingsChanged, onSettingsChanged } from '@common/ipc'

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
export const DEFAULT_SETTINGS: IAppSettings = {
  openAtLogin: false,
  theme: 'system' as const,
  language: 'en_US',
  sendCrashReport: true,
  keepOnTop: false,
  showHistory: true,
  maxHistorySize: 50,
  defaultFormat: 'hex' as const,
  hexPrefix: true,
  closeToTray: false,
  autoCopyOnPick: false,
  quickPickHeadless: false,
  isBordered: false,
  isFullColored: false,
  isVibrant: true,
  eyedropperGridSize: 5,
  eyedropperShowHex: true,
  eyedropperHideMain: true,
  eyedropperMagnifierSize: 300,
  eyedropperDetectBackgroundChanges: false,
  eyedropperAllowHoverThrough: false,
  eyedropperShowPixelGrid: false,
  pickerHotkey: 'CommandOrControl+Shift+C',
  experimentalFeaturesUnlocked: false,
  eyedropperAdaptiveBorder: false,
}

// Passed to the Tauri store's `defaults` so that everything except `language`
// is present from the very first read. `language` is deliberately left out so
// its absence can be used to detect a first launch and trigger OS-locale detection.
const { language: _language, ...STORE_DEFAULTS } = DEFAULT_SETTINGS

const log = createScopedLogger('SettingsStore')

const SETTINGS_FILE = 'settings.json'

// Identifies this window instance so it can ignore its own broadcasted changes
const INSTANCE_ID = crypto.randomUUID()

// Shared across all windows/tabs of this webview
let storeHandle: Store | null = null
let listening = false

async function persistAndBroadcast(updates: Partial<IAppSettings>): Promise<void> {
  try {
    if (storeHandle) {
      for (const [key, value] of Object.entries(updates)) {
        await storeHandle.set(key, value)
      }
      await storeHandle.save()
    } else {
      log.error('Settings store not loaded yet, change was not persisted', { updates })
    }
  } catch (err) {
    log.error('Failed to persist settings to disk', { error: String(err), updates })
  }

  try {
    await emitSettingsChanged({ source: INSTANCE_ID, updates })
  } catch (err) {
    log.error('Failed to broadcast settings change to other windows', {
      error: String(err),
      updates,
    })
  }
}

/**
 * Zustand store for application settings
 * Persisted to disk via tauri-plugin-store and synced across windows via events
 */
export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector((set, get) => ({
    ...DEFAULT_SETTINGS,

    // State management
    isLoading: false,
    isInitialized: false,
    error: null,

    /**
     * Load settings from disk and start listening for changes made in other windows
     */
    initialize: async () => {
      if (get().isInitialized || get().isLoading) return
      set({ isLoading: true, error: null })

      try {
        storeHandle = await load(SETTINGS_FILE, {
          autoSave: false,
          defaults: STORE_DEFAULTS as unknown as Record<string, unknown>,
        })
        const entries = await storeHandle.entries<IAppSettings[keyof IAppSettings]>()
        const loaded = Object.fromEntries(entries) as Partial<IAppSettings>

        // `language` is absent only on a fresh install (see STORE_DEFAULTS above) -
        // detect it from the OS/browser locale once, then persist it so this only runs once.
        if (loaded.language === undefined) {
          loaded.language = resolveSupportedLanguage(navigator.language)
          await storeHandle.set('language', loaded.language)
          await storeHandle.save()
          log.info('First launch detected, resolved language from OS locale', {
            osLocale: navigator.language,
            resolved: loaded.language,
          })
        }

        set({ ...DEFAULT_SETTINGS, ...loaded, isInitialized: true, isLoading: false })

        if (!listening) {
          listening = true
          await onSettingsChanged((payload) => {
            if (payload.source === INSTANCE_ID) return
            set(payload.updates)
            log.debug('Settings synced from another window', payload.updates)
          })
        }
      } catch (err) {
        log.error('Failed to load settings from disk', { error: String(err) })
        set({ isInitialized: true, isLoading: false, error: String(err) })
      }
    },

    /**
     * Update a single setting, persist it, and notify other windows
     */
    updateSetting: async <K extends keyof IAppSettings>(key: K, value: IAppSettings[K]) => {
      set({ [key]: value } as Partial<SettingsStore>)
      log.debug('Setting updated:', { [key]: value })
      await persistAndBroadcast({ [key]: value } as Partial<IAppSettings>)
    },

    /**
     * Update multiple settings at once, persist them, and notify other windows
     */
    updateSettings: async (updates: Partial<IAppSettings>) => {
      set(updates)
      log.debug('Multiple settings updated', { updates })
      await persistAndBroadcast(updates)
    },

    /**
     * Reset all settings to defaults, persist them, and notify other windows
     */
    resetSettings: async () => {
      set(DEFAULT_SETTINGS)
      await persistAndBroadcast(DEFAULT_SETTINGS)
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
