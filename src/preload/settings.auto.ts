/**
 * Settings Preload Script (Auto-generated)
 *
 * This preload script is automatically generated from the settings API definition.
 * No need to manually write or maintain this code!
 */

import { exposeApis } from '@electron/utils/preloadGenerator'
import { settingsIpcApi, type SettingsRendererApi } from '@electron/stores/settingsApi'

// Automatically expose the settings API to the renderer
exposeApis({
  settings: settingsIpcApi,
})

// Export type for global declarations
export type PreloadAPI = {
  settings: SettingsRendererApi
}
