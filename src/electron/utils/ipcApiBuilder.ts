import { ipcMain, type IpcMainInvokeEvent } from 'electron'

/**
 * Type definitions for IPC handlers
 */
export type IpcHandler<TArgs extends any[] = any[], TReturn = any> = (
  event: IpcMainInvokeEvent,
  ...args: TArgs
) => TReturn | Promise<TReturn>

export type IpcListener<TArgs extends any[] = any[]> = (
  event: IpcMainInvokeEvent,
  ...args: TArgs
) => void

/**
 * IPC Channel definition
 * Defines the contract between main and renderer processes
 */
export interface IpcChannel<TArgs extends any[] = any[], TReturn = any> {
  /** Channel name (e.g., 'settings:get') */
  name: string
  /** Handler function to be registered in main process */
  handler: IpcHandler<TArgs, TReturn>
}

/**
 * IPC Event channel definition (for one-way communication from main to renderer)
 */
export interface IpcEventChannel {
  /** Channel name (e.g., 'settings:changed') */
  name: string
}

/**
 * IPC API Builder
 * Provides a declarative way to define IPC channels with full type safety
 * Automatically generates both main process handlers and renderer process APIs
 */
export class IpcApiBuilder {
  private channels: Map<string, IpcChannel> = new Map()
  private eventChannels: Map<string, IpcEventChannel> = new Map()
  private isRegistered = false

  /**
   * Define an IPC invoke channel (request/response pattern)
   *
   * @example
   * const api = new IpcApiBuilder('settings')
   * api.handle('getAll', () => settingsStore.getAll())
   * api.handle('get', (event, key: string) => settingsStore.get(key))
   */
  handle<TArgs extends any[], TReturn>(method: string, handler: IpcHandler<TArgs, TReturn>): this {
    const channelName = this.getChannelName(method)
    this.channels.set(method, { name: channelName, handler })
    return this
  }

  /**
   * Define an IPC event channel (one-way communication from main to renderer)
   *
   * @example
   * api.event('changed')
   */
  event(method: string): this {
    const channelName = this.getChannelName(method)
    this.eventChannels.set(method, { name: channelName })
    return this
  }

  /**
   * Register all defined handlers with ipcMain
   * Should be called once during app initialization
   */
  register(): void {
    if (this.isRegistered) {
      throw new Error('IPC handlers already registered')
    }

    this.channels.forEach((channel) => {
      ipcMain.handle(channel.name, channel.handler)
    })

    this.isRegistered = true
  }

  /**
   * Get the full channel name
   */
  private getChannelName(method: string): string {
    return method
  }

  /**
   * Get all registered channel names (for debugging)
   */
  getChannelNames(): string[] {
    return Array.from(this.channels.values()).map((c) => c.name)
  }

  /**
   * Get renderer API metadata
   * Used by preload script generator
   */
  getApiMetadata() {
    return {
      channels: Array.from(this.channels.entries()).map(([method, channel]) => ({
        method,
        channelName: channel.name,
      })),
      events: Array.from(this.eventChannels.entries()).map(([method, channel]) => ({
        method,
        channelName: channel.name,
      })),
    }
  }
}

/**
 * Create a typed IPC API builder
 *
 * @example
 * // In electron/api/settingsApi.ts
 * export const settingsApi = createIpcApi()
 *   .handle('getAll', () => settingsStore.getAll())
 *   .handle('get', (event, key: keyof IAppSettings) => settingsStore.get(key))
 *   .handle('set', (event, key: keyof IAppSettings, value: any) => settingsStore.set(key, value))
 *   .event('changed')
 *
 * // Types are automatically inferred!
 * export type SettingsApi = InferApi<typeof settingsApi>
 */
export function createIpcApi() {
  return new IpcApiBuilder()
}

/**
 * Infer the renderer API types from an IPC API builder
 * This allows TypeScript to automatically generate types for the preload script
 */
export type InferApi<T extends IpcApiBuilder> = T extends IpcApiBuilder
  ? {
      [K in keyof ReturnType<T['getApiMetadata']>['channels'][number] as ReturnType<
        T['getApiMetadata']
      >['channels'][number]['method']]: any
    }
  : never
