import { memo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsToggle } from '@react/components/settings'

const ColorpickerSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.colorpicker' })

  const [openAtLogin, setOpenAtLogin] = useState(false)
  const [keepOnTop, setKeepOnTop] = useState(false)

  const handleOpenAtLoginChange = useCallback((checked: boolean) => {
    setOpenAtLogin(checked)
    // TODO: Call electron API to set login item
  }, [])

  const handleKeepOnTopChange = useCallback((checked: boolean) => {
    setKeepOnTop(checked)
    // TODO: Call electron API to set always on top
  }, [])

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsItem
        label={SettingsT.t('openAtLogin.label')}
        description={SettingsT.t('openAtLogin.description')}
      >
        <SettingsToggle checked={openAtLogin} onChange={handleOpenAtLoginChange} />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('keepOnTop.label')}
        description={SettingsT.t('keepOnTop.description')}
      >
        <SettingsToggle checked={keepOnTop} onChange={handleKeepOnTopChange} />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(ColorpickerSettings)
