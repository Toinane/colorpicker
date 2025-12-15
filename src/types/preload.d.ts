/**
 * Global type declarations for preload API
 * Types are automatically inferred from the actual preload implementations
 * No need to manually maintain type definitions!
 */

import type { PreloadAPI as SettingsPreloadAPI } from '@preload/settings'

declare global {
  interface Window {
    /**
     * API exposed by preload scripts
     * Types are automatically inferred from the implementation
     */
    api: SettingsPreloadAPI
  }
}
