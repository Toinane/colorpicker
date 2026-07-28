import { memo, useEffect, type ReactNode } from 'react'
import i18n from '../i18n'
import { useInitializeSettings, useInitializeHistory, useInitializePalettes } from '@hooks/index'
import { useLanguage, useSettingsStore } from '@stores/settingsStore'
import { useColorpickerStore } from '@stores/colorpickerStore'

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

  useEffect(() => {
    if (isInitialized && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [isInitialized, language])

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
