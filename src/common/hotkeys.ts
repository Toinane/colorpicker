import type { IAppSettings } from '@interfaces/settings'

export interface HotkeyRegistryEntry {
  settingKey: Extract<keyof IAppSettings, string>
  /** i18n key (in the 'settings' namespace) resolving to a human-readable label */
  labelKey: string
}

/**
 * All app-level global shortcuts, used to detect conflicts between them.
 * Add an entry here whenever a new global-shortcut setting is introduced.
 */
export const HOTKEY_REGISTRY: HotkeyRegistryEntry[] = [
  { settingKey: 'pickerHotkey', labelKey: 'shortcuts.picker.pickerHotkey.label' },
]
