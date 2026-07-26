/**
 * Hand-written mirror of the Tauri IPC surface: commands defined in
 * `src-tauri/src/commands.rs` and events emitted from Rust or shared
 * across windows. This is what `tauri-specta` would normally generate —
 * the current tauri-specta 2.x line only builds on nightly Rust (fails on
 * stable with an unstable `fmt::from_fn` usage inside `specta`), so this
 * file is the manual stand-in until that's fixed upstream. Keep it in sync
 * by hand: every `invoke`/`emit`/`listen` call site should go through here
 * rather than using raw event/command name strings.
 */
import { invoke } from '@tauri-apps/api/core'
import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event'

import type { RGBColor } from './color'
import type { IAppSettings } from '@interfaces/settings'

// ---------------------------------------------------------------------------
// Commands — mirrors src-tauri/src/commands.rs
// ---------------------------------------------------------------------------

/** Launch the native picker using the current persisted settings. */
export const launchPicker = (): Promise<void> => invoke('launch_picker')

/** Register a new global hotkey for launching the picker, replacing any previous one. */
export const setPickerHotkey = (hotkey: string): Promise<void> =>
  invoke('set_picker_hotkey', { hotkey })

/** Open the settings window, creating it on first call or focusing it otherwise. */
export const openSettings = (): Promise<void> => invoke('open_settings')

/** Apply "keep on top" to the main colorpicker window immediately. */
export const setKeepOnTop = (enabled: boolean): Promise<void> =>
  invoke('set_keep_on_top', { enabled })

/** Enable or disable launching the app at OS login. */
export const setOpenAtLogin = (enabled: boolean): Promise<void> =>
  invoke('set_open_at_login', { enabled })

/** Read the actual OS-level autostart registration state (may drift from the persisted setting). */
export const getOpenAtLogin = (): Promise<boolean> => invoke('get_open_at_login')

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Emitted from Rust (`shortcuts::trigger_global_pick`) once a pick session ends. */
const COLOR_PICKED_EVENT = 'color-picked'

export const onColorPicked = (
  handler: (color: RGBColor | null) => void,
): Promise<UnlistenFn> => listen<RGBColor | null>(COLOR_PICKED_EVENT, (event) => handler(event.payload))

/** Broadcast between windows on any settings change; also passively read by Rust (`tray.rs`). */
const SETTINGS_CHANGED_EVENT = 'settings-changed'

export interface SettingsChangedPayload {
  source: string
  updates: Partial<IAppSettings>
}

export const emitSettingsChanged = (payload: SettingsChangedPayload): Promise<void> =>
  emit(SETTINGS_CHANGED_EVENT, payload)

export const onSettingsChanged = (
  handler: (payload: SettingsChangedPayload) => void,
): Promise<UnlistenFn> =>
  listen<SettingsChangedPayload>(SETTINGS_CHANGED_EVENT, (event) => handler(event.payload))

/** Emitted by each window once its DOM is ready; read by Rust (`main.rs`) to show it. */
const WINDOW_READY_EVENT = 'window-ready'

export const emitWindowReady = (windowLabel: string): Promise<void> =>
  emit(WINDOW_READY_EVENT, windowLabel)
