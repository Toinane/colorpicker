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

/** Open the Palettes window, creating it on first call or focusing it otherwise. */
export const openPalettes = (): Promise<void> => invoke('open_palettes')

/** Apply "keep on top" to the main colorpicker window immediately. */
export const setKeepOnTop = (enabled: boolean): Promise<void> =>
  invoke('set_keep_on_top', { enabled })

/** Enable or disable launching the app at OS login. */
export const setOpenAtLogin = (enabled: boolean): Promise<void> =>
  invoke('set_open_at_login', { enabled })

/** Read the actual OS-level autostart registration state (may drift from the persisted setting). */
export const getOpenAtLogin = (): Promise<boolean> => invoke('get_open_at_login')

/** The portable data directory, or `null` in a normal (non-portable) build — see src-tauri/src/portable.rs. */
export const getPortableDataDir = (): Promise<string | null> => invoke('get_portable_data_dir')

/** Read the legacy v2 (Electron) storage file's raw text, or `null` if there isn't one. */
export const readLegacyPalettes = (): Promise<string | null> => invoke('read_legacy_palettes')

/** Back up the legacy v2 storage file to `<path>.bak`, without touching the original. */
export const backupCorruptLegacyPalettes = (): Promise<void> =>
  invoke('backup_corrupt_legacy_palettes')

/**
 * The OS accent color as `#rrggbb`, or `null` on Linux (no standard concept
 * of one) or if the platform API failed. Read once at startup — see
 * `--accent-default` in tokens.css — not live-synced while the app runs.
 */
export const getOsAccentColor = (): Promise<string | null> => invoke('get_os_accent_color')

/** Version control revision and timestamp embedded when the current artifact was compiled. */
export interface BuildInfo {
  version: string
  commit: string
  compiledAt: number
}

export const getBuildInfo = (): Promise<BuildInfo> => invoke('get_build_info')

/** Detailed OS info (type, version, edition, bitness, architecture) — see `platform_info.rs`. */
export interface PlatformInfo {
  osType: string
  family: 'windows' | 'macos' | 'linux' | 'other'
  version: string
  edition: string | null
  bitness: string
  architecture: string | null
  label: string
}

export const getPlatformInfo = (): Promise<PlatformInfo> => invoke('get_platform_info')

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Emitted from Rust (`shortcuts::trigger_global_pick`) once a pick session ends. */
const COLOR_PICKED_EVENT = 'color-picked'

export const onColorPicked = (handler: (color: RGBColor | null) => void): Promise<UnlistenFn> =>
  listen<RGBColor | null>(COLOR_PICKED_EVENT, (event) => handler(event.payload))

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

/** Emitted by the Palettes window when a saved swatch is clicked, applying it to the main window. */
const PALETTE_COLOR_APPLIED_EVENT = 'palette-color-applied'

export const emitPaletteColorApplied = (hex: string): Promise<void> =>
  emit(PALETTE_COLOR_APPLIED_EVENT, hex)

export const onPaletteColorApplied = (handler: (hex: string) => void): Promise<UnlistenFn> =>
  listen<string>(PALETTE_COLOR_APPLIED_EVENT, (event) => handler(event.payload))
