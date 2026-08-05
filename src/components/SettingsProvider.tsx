import { memo, useEffect, useState, type ReactNode } from 'react'
import i18n from '../i18n'
import {
  useInitializeSettings,
  useInitializeHistory,
  useInitializePalettes,
  useTheme,
} from '@hooks/index'
import { useLanguage, useSettingsStore } from '@stores/settingsStore'
import { useColorpickerStore } from '@stores/colorpickerStore'
import { getOsAccentColor } from '@common/ipc'
import { getPlatformInfo } from '@common/platform'

interface SettingsProviderProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Provider component that initializes settings on mount
 * Wrap your app with this component to ensure settings are loaded
 */
const SettingsProvider = ({ children, fallback }: SettingsProviderProps) => {
  const { isInitialized, isLoading, error } = useInitializeSettings()
  // Not gating render on this — history is independent of settings and a
  // slower/failed load here shouldn't block the app from showing up.
  useInitializeHistory()
  useInitializePalettes()
  const language = useLanguage()
  const isBordered = useSettingsStore((state) => state.isBordered)
  const isFullColored = useSettingsStore((state) => state.isFullColored)
  const isVibrant = useSettingsStore((state) => state.isVibrant)
  const theme = useTheme()

  useEffect(() => {
    if (isInitialized && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [isInitialized, language])

  // Mirror the resolved theme onto the document so CSS (tokens.css) can key
  // dark-mode overrides off `:root[data-theme]` instead of only the OS
  // preference — this is what makes the light/dark/system setting actually do
  // something, rather than the app always following the OS regardless.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // One-shot read of the OS accent color (Windows/macOS; `null` on Linux or
  // failure) - see accent_color.rs for why this isn't live-synced while the
  // app runs. The raw color is set once into --accent-default; tokens.css
  // derives the light/dark-tinted --accent-variant-default from it natively
  // per `[data-theme]`, so no JS-side recompute is needed on theme change.
  const [rawAccentColor, setRawAccentColor] = useState<string | null>(null)

  useEffect(() => {
    getOsAccentColor()
      .then(setRawAccentColor)
      .catch((err) => console.error('Failed to read OS accent color:', err))
  }, [])

  useEffect(() => {
    if (!rawAccentColor) return
    document.documentElement.style.setProperty('--accent-default', rawAccentColor)
  }, [rawAccentColor])

  // Warm up the platform-info fetch so `isWindowsSync`/`isMacosSync`/
  // `isLinuxSync` (@common/platform) resolve to the accurate Rust-derived
  // value as early as possible, rather than staying on the user-agent guess
  // until whatever first consumer happens to call `getPlatformInfo()`.
  useEffect(() => {
    getPlatformInfo().catch((err) => console.error('Failed to read platform info:', err))
  }, [])

  // Hydrate the colorpicker's rendering store from the persisted appearance
  // settings, at init and on every change (incl. synced from other windows).
  useEffect(() => {
    if (!isInitialized) return
    useColorpickerStore.setState({ isBordered, isFullColored, isVibrant })
  }, [isInitialized, isBordered, isFullColored, isVibrant])

  if (isLoading || !isInitialized) {
    return <>{fallback || null}</>
  }

  if (error) {
    console.error('Settings initialization error:', error)
    // Still render children even if there's an error
    // Settings will use defaults
  }

  return <>{children}</>
}

export default memo(SettingsProvider)
