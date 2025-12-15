/**
 * Settings IPC API Definition
 *
 * This file defines the IPC contract between main and renderer processes.
 * The preload script is automatically generated from these definitions.
 */

import { createIpcApi } from '../utils/ipcApiBuilder'
import { getSettingsStore, type IAppSettings } from '@electron/stores/settingsStore'

/**
 * Settings IPC API
 * All handlers are automatically registered and exposed to renderer
 */
export const settingsIpcApi = createIpcApi()
  .handle('settings:getAll', async () => {
    return getSettingsStore().getAll()
  })
  .handle('settings:get', async <K extends keyof IAppSettings>(event: any, key: K) => {
    return getSettingsStore().get(key)
  })
  .handle(
    'settings:set',
    async <K extends keyof IAppSettings>(event: any, key: K, value: IAppSettings[K]) => {
      getSettingsStore().set(key, value)
    },
  )
  .handle('settings:update', async (event: any, updates: Partial<IAppSettings>) => {
    return getSettingsStore().update(updates)
  })
  .handle('settings:reset', async () => {
    return getSettingsStore().reset()
  })
  .handle('settings:setOpenAtLogin', async (event: any, value: boolean) => {
    const { app } = require('electron')
    try {
      app.setLoginItemSettings({
        openAtLogin: value,
        openAsHidden: false,
      })
      getSettingsStore().set('openAtLogin', value)
      return true
    } catch (error) {
      console.error('Failed to set open at login:', error)
      return false
    }
  })
  .event('settings:changed')

/**
 * Register all settings IPC handlers
 * Call this during app initialization
 */
export function registerSettingsApi() {
  settingsIpcApi.register()
}

/**
 * Renderer API type for settings
 * This type is automatically inferred and used in the preload script
 */
export interface SettingsRendererApi {
  getAll: () => Promise<IAppSettings>
  get: <K extends keyof IAppSettings>(key: K) => Promise<IAppSettings[K]>
  set: <K extends keyof IAppSettings>(key: K, value: IAppSettings[K]) => Promise<void>
  update: (updates: Partial<IAppSettings>) => Promise<IAppSettings>
  reset: () => Promise<IAppSettings>
  setOpenAtLogin: (value: boolean) => Promise<boolean>
  onChanged: (callback: (settings: IAppSettings) => void) => () => void
}
