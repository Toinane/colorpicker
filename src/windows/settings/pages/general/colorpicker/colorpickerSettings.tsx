import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsToggle } from '@components/settings'
import { useOpenAtLogin, useKeepOnTop, useCloseToTray } from '@hooks/index'

const ColorpickerSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.colorpicker' })

  const [openAtLogin, setOpenAtLogin] = useOpenAtLogin()
  const [keepOnTop, setKeepOnTop] = useKeepOnTop()
  const [closeToTray, setCloseToTray] = useCloseToTray()

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

  const handleCloseToTrayChange = useCallback(
    async (checked: boolean) => {
      try {
        await setCloseToTray(checked)
      } catch (error) {
        console.error('Failed to update close to tray:', error)
        // TODO: Show error notification to user
      }
    },
    [setCloseToTray],
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
      <SettingsItem
        label={SettingsT.t('closeToTray.label')}
        description={SettingsT.t('closeToTray.description')}
      >
        <SettingsToggle checked={closeToTray} onChange={handleCloseToTrayChange} />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(ColorpickerSettings)
