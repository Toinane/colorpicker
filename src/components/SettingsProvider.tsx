import { memo, useEffect, type ReactNode } from 'react'
import i18n from '../i18n'
import { useInitializeSettings } from '@hooks/index'
import { useLanguage } from '@stores/settingsStore'

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
  const language = useLanguage()

  useEffect(() => {
    if (isInitialized && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [isInitialized, language])

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
