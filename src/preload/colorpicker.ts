import { contextBridge, ipcRenderer } from 'electron'

/**
 * Colorpicker API exposed to renderer process
 * Types are automatically inferred from this implementation
 */
const colorpickerApi = {
  store: {
    get: () => ipcRenderer.invoke('colorpicker:store:get'),
  },
} as const

/**
 * Complete API exposed to renderer process
 */
const preloadApi = {
  colorpicker: colorpickerApi,
} as const

contextBridge.exposeInMainWorld('api', preloadApi)

/**
 * Export the type to be used in global declarations
 */
export type PreloadAPI = typeof preloadApi
