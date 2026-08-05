import { getPlatformInfo as fetchPlatformInfo, type PlatformInfo } from './ipc'

export type { PlatformInfo }

/** Best-effort family guess from the user agent, used for the `*Sync` helpers
 * until the accurate Rust-derived family (see `platform_info.rs`) resolves. */
const uaFamilyGuess = (): PlatformInfo['family'] => {
  if (typeof navigator === 'undefined') return 'other'
  if (/Mac|iPhone|iPad|iPod/.test(navigator.userAgent)) return 'macos'
  if (/Win/.test(navigator.userAgent)) return 'windows'
  if (/Linux/.test(navigator.userAgent)) return 'linux'
  return 'other'
}

let resolvedFamily: PlatformInfo['family'] = uaFamilyGuess()
let cached: Promise<PlatformInfo> | null = null

/**
 * Detailed OS info from Rust (type, version, edition, bitness, architecture)
 * — e.g. `label` is "Windows 11 Pro 64-bit (10.0.26100)". Cached after the
 * first call since it can't change while the app runs.
 */
export const getPlatformInfo = (): Promise<PlatformInfo> =>
  (cached ??= fetchPlatformInfo().then((info) => {
    resolvedFamily = info.family
    return info
  }))

export const isWindows = async (): Promise<boolean> => (await getPlatformInfo()).family === 'windows'

export const isMacos = async (): Promise<boolean> => (await getPlatformInfo()).family === 'macos'

export const isLinux = async (): Promise<boolean> => (await getPlatformInfo()).family === 'linux'

/**
 * Synchronous counterparts to `isWindows`/`isMacos`/`isLinux`, for call sites
 * that can't await (e.g. module-level constants). Backed by a user-agent
 * guess until `getPlatformInfo()` resolves for the first time — call it once
 * early (see `SettingsProvider`) to narrow that window.
 */
export const isWindowsSync = (): boolean => resolvedFamily === 'windows'

export const isMacosSync = (): boolean => resolvedFamily === 'macos'

export const isLinuxSync = (): boolean => resolvedFamily === 'linux'
