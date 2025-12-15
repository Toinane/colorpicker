/**
 * Automatic Preload Script Generator
 *
 * This utility generates preload scripts from IPC API definitions,
 * eliminating the need to manually write and maintain preload code.
 */

import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

/**
 * Channel configuration for invoke (request/response)
 */
interface InvokeChannel {
  method: string
  channelName: string
}

/**
 * Channel configuration for events (one-way from main to renderer)
 */
interface EventChannel {
  method: string
  channelName: string
}

/**
 * API configuration
 */
interface ApiConfig {
  namespace: string
  channels: InvokeChannel[]
  events: EventChannel[]
}

/**
 * Generate renderer API from channel definitions
 * This creates the actual API object exposed to the renderer
 */
export function generateRendererApi(config: ApiConfig) {
  const api: Record<string, any> = {}

  // Generate invoke methods (request/response)
  config.channels.forEach(({ method, channelName }) => {
    api[method] = (...args: any[]) => ipcRenderer.invoke(channelName, ...args)
  })

  // Generate event listeners (one-way from main)
  config.events.forEach(({ method, channelName }) => {
    const listenerMethod = `on${capitalize(method)}`
    api[listenerMethod] = (callback: (...args: any[]) => void) => {
      const listener = (_event: IpcRendererEvent, ...args: any[]) => callback(...args)
      ipcRenderer.on(channelName, listener)
      // Return cleanup function
      return () => {
        ipcRenderer.removeListener(channelName, listener)
      }
    }
  })

  return api
}

/**
 * Create and expose API to renderer process
 * This replaces the need for manual preload scripts
 *
 * @example
 * // preload/settings.ts
 * import { exposeApi } from '@electron/api/preloadGenerator'
 * import { settingsIpcApi } from '@electron/api/settingsApi'
 *
 * exposeApi('settings', settingsIpcApi)
 */
export function exposeApi(namespace: string, apiBuilder: { getApiMetadata: () => any }) {
  const metadata = apiBuilder.getApiMetadata()

  const config: ApiConfig = {
    namespace,
    channels: metadata.channels,
    events: metadata.events,
  }

  const api = generateRendererApi(config)

  // Expose to renderer
  contextBridge.exposeInMainWorld(namespace, api)

  return api
}

/**
 * Expose multiple APIs at once
 *
 * @example
 * exposeApis({
 *   settings: settingsIpcApi,
 *   colorpicker: colorpickerIpcApi,
 * })
 */
export function exposeApis(apis: Record<string, { getApiMetadata: () => any }>) {
  const exposedApis: Record<string, any> = {}

  Object.entries(apis).forEach(([namespace, apiBuilder]) => {
    exposedApis[namespace] = exposeApi(namespace, apiBuilder)
  })

  // Expose combined API
  contextBridge.exposeInMainWorld('api', exposedApis)

  return exposedApis
}

/**
 * Helper to capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Type helper to extract the renderer API type from an IPC API builder
 * This allows TypeScript to automatically infer the correct types
 */
export type ExtractRendererApi<T> = T extends { getApiMetadata: () => any }
  ? Record<
      string,
      ((...args: any[]) => Promise<any>) | ((callback: (...args: any[]) => void) => () => void)
    >
  : never
