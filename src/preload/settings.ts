import { contextBridge, ipcRenderer } from 'electron'
import type { IAppSettings } from '@electron/stores/settingsStore'

/**
 * Settings API exposed to renderer process
 * Types are automatically inferred from this implementation
 */
const settingsApi = {
  getAll: () => ipcRenderer.invoke('settings:getAll') as Promise<IAppSettings>,
  get: <K extends keyof IAppSettings>(key: K) =>
    ipcRenderer.invoke('settings:get', key) as Promise<IAppSettings[K]>,
  set: <K extends keyof IAppSettings>(key: K, value: IAppSettings[K]) =>
    ipcRenderer.invoke('settings:set', key, value) as Promise<void>,
  update: (updates: Partial<IAppSettings>) =>
    ipcRenderer.invoke('settings:update', updates) as Promise<IAppSettings>,
  reset: () => ipcRenderer.invoke('settings:reset') as Promise<IAppSettings>,
  setOpenAtLogin: (value: boolean) =>
    ipcRenderer.invoke('settings:setOpenAtLogin', value) as Promise<boolean>,
  onSettingsChange: (callback: (settings: IAppSettings) => void) => {
    const listener = (_: Electron.IpcRendererEvent, settings: IAppSettings) => callback(settings)
    ipcRenderer.on('settings:changed', listener)
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('settings:changed', listener)
    }
  },
} as const

/**
 * Colorpicker API exposed to renderer process
 */
const colorpickerApi = {
  store: {
    get: () => ipcRenderer.invoke('colorpicker:store:get'),
  },
} as const

/**
 * Complete API exposed to renderer process
 * Use `typeof preloadApi` to get the inferred types
 */
const preloadApi = {
  colorpicker: colorpickerApi,
  settings: settingsApi,
} as const

contextBridge.exposeInMainWorld('api', preloadApi)

/**
 * Export the type to be used in global declarations
 * This allows TypeScript to infer the exact shape without manual type definitions
 */
export type PreloadAPI = typeof preloadApi
