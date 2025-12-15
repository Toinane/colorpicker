import path from 'node:path'
import { app, ipcMain } from 'electron'
import Store, { Schema } from 'electron-store'
import createLogger from '@electron/utils/logger'

const logger = createLogger('SettingsStore')

/**
 * Application-wide settings schema
 * Defines all configurable settings with their types and defaults
 */
export interface IAppSettings {
  // General Settings
  openAtLogin: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  sendCrashReport: boolean

  // Colorpicker Settings
  keepOnTop: boolean
  showHistory: boolean
  maxHistorySize: number
  defaultFormat: 'hex' | 'rgb' | 'hsl' | 'hsv'

  // Appearance Settings
  isBordered: boolean
  isFullColored: boolean
  isVibrant: boolean
}

/**
 * Schema definition for electron-store validation
 */
const settingsSchema: Schema<IAppSettings> = {
  openAtLogin: {
    type: 'boolean',
    default: false,
  },
  theme: {
    type: 'string',
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
  language: {
    type: 'string',
    default: 'en_US',
  },
  sendCrashReport: {
    type: 'boolean',
    default: true,
  },
  keepOnTop: {
    type: 'boolean',
    default: false,
  },
  showHistory: {
    type: 'boolean',
    default: true,
  },
  maxHistorySize: {
    type: 'number',
    default: 50,
    minimum: 10,
    maximum: 200,
  },
  defaultFormat: {
    type: 'string',
    enum: ['hex', 'rgb', 'hsl', 'hsv'],
    default: 'hex',
  },
  isBordered: {
    type: 'boolean',
    default: false,
  },
  isFullColored: {
    type: 'boolean',
    default: false,
  },
  isVibrant: {
    type: 'boolean',
    default: true,
  },
}

/**
 * Settings Store Manager
 * Centralized store for application settings with IPC handlers
 * Provides type-safe access to settings and automatic synchronization
 */
export class SettingsStore {
  private store: Store<IAppSettings>
  private watchers: Set<(settings: IAppSettings) => void> = new Set()

  constructor() {
    logger.debug('Initializing SettingsStore')

    this.store = new Store<IAppSettings>({
      schema: settingsSchema,
      name: 'app_settings',
      cwd: path.join(app.getPath('userData'), 'config'),
      clearInvalidConfig: true,
      migrations: {
        // Example migration for version updates
        '>=3.0.0': (store) => {
          logger.info('Running settings migration for v3.0.0')
          // Add migration logic here if needed
        },
      },
    })

    logger.info('SettingsStore initialized with config:', this.getAll())
    // Note: IPC handlers are now registered via settingsApi.ts
  }

  /**
   * Get all settings
   */
  public getAll(): IAppSettings {
    return this.store.store
  }

  /**
   * Get a specific setting value
   */
  public get<K extends keyof IAppSettings>(key: K): IAppSettings[K] {
    return this.store.get(key)
  }

  /**
   * Set a specific setting value
   */
  public set<K extends keyof IAppSettings>(key: K, value: IAppSettings[K]): void {
    logger.debug(`Setting ${key} to: ${value}`)
    this.store.set(key, value)
    this.notifyWatchers()
  }

  /**
   * Update multiple settings at once
   */
  public update(updates: Partial<IAppSettings>): IAppSettings {
    logger.debug('Updating settings:', updates)
    Object.entries(updates).forEach(([key, value]) => {
      this.store.set(key as keyof IAppSettings, value)
    })
    this.notifyWatchers()
    return this.getAll()
  }

  /**
   * Reset all settings to defaults
   */
  public reset(): IAppSettings {
    logger.warn('Resetting all settings to defaults')
    this.store.clear()
    this.notifyWatchers()
    return this.getAll()
  }

  /**
   * Watch for settings changes
   * Callback is called whenever any setting changes
   */
  public watch(callback: (settings: IAppSettings) => void): () => void {
    this.watchers.add(callback)
    // Return unwatch function
    return () => {
      this.watchers.delete(callback)
    }
  }

  /**
   * Notify all watchers about settings changes
   * Also broadcasts changes to all renderer processes
   */
  private notifyWatchers(): void {
    const settings = this.getAll()

    // Notify in-process watchers
    this.watchers.forEach((callback) => {
      try {
        callback(settings)
      } catch (error) {
        logger.error('Error in settings watcher:', error)
      }
    })

    // Broadcast to all renderer processes
    this.broadcastToRenderers(settings)
  }

  /**
   * Broadcast settings changes to all renderer processes
   */
  private broadcastToRenderers(settings: IAppSettings): void {
    const { BrowserWindow } = require('electron')
    const windows = BrowserWindow.getAllWindows()

    windows.forEach((window: Electron.BrowserWindow) => {
      try {
        window.webContents.send('settings:changed', settings)
      } catch (error) {
        logger.error('Error broadcasting settings to renderer:', error)
      }
    })
  }

  /**
   * Get the underlying electron-store instance
   * Use with caution - prefer using the provided methods
   */
  public getStore(): Store<IAppSettings> {
    return this.store
  }
}

// Singleton instance
let settingsStoreInstance: SettingsStore | null = null

/**
 * Get the singleton SettingsStore instance
 */
export function getSettingsStore(): SettingsStore {
  if (!settingsStoreInstance) {
    settingsStoreInstance = new SettingsStore()
  }
  return settingsStoreInstance
}

/**
 * Initialize the settings store
 * Should be called once during app startup
 */
export function initSettingsStore(): SettingsStore {
  logger.info('Initializing settings store')
  return getSettingsStore()
}
