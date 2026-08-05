import { useSyncExternalStore } from 'react'

import { useSettingsStore } from '@stores/settingsStore'

export type Theme = 'light' | 'dark'

const darkMediaQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

const subscribeToSystemTheme = (callback: () => void): (() => void) => {
  darkMediaQuery?.addEventListener('change', callback)
  return () => darkMediaQuery?.removeEventListener('change', callback)
}

const getSystemTheme = (): Theme => (darkMediaQuery?.matches ? 'dark' : 'light')

/** OS-level color scheme preference, independent of the user's theme setting. */
const useSystemTheme = (): Theme =>
  useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, () => 'light')

/**
 * Resolved theme ('light' | 'dark'), accounting for the user's theme setting:
 * follows the OS when set to 'system' (the default), otherwise the explicit choice.
 * `SettingsProvider` mirrors this onto `<html data-theme>`, which is what CSS
 * actually keys dark-mode overrides off (see tokens.css).
 */
export const useTheme = (): Theme => {
  const themeSetting = useSettingsStore((state) => state.theme)
  const systemTheme = useSystemTheme()
  return themeSetting === 'system' ? systemTheme : themeSetting
}
