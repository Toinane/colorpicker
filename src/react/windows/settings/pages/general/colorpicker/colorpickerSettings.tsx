import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsToggle } from '@react/components/settings'
import { useOpenAtLogin, useKeepOnTop } from '@react/hooks'

const ColorpickerSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.colorpicker' })

  const [openAtLogin, setOpenAtLogin] = useOpenAtLogin()
  const [keepOnTop, setKeepOnTop] = useKeepOnTop()

  const handleOpenAtLoginChange = useCallback(
    async (checked: boolean) => {
      try {
        await setOpenAtLogin(checked)
      } catch (error) {
        console.error('Failed to update open at login:', error)
        // TODO: Show error notification to user
      }
    },
    [setOpenAtLogin],
  )

  const handleKeepOnTopChange = useCallback(
    async (checked: boolean) => {
      try {
        await setKeepOnTop(checked)
      } catch (error) {
        console.error('Failed to update keep on top:', error)
        // TODO: Show error notification to user
      }
    },
    [setKeepOnTop],
  )

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
