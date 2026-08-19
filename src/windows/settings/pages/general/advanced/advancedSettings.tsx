import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsAccordion } from '@components/settings'
import { Button, Text } from '@components/ui'
import { revealApplicationFile, revealSettingsFile } from '@common/ipc'

const ColorpickerSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.advanced' })
  const CommonT = useTranslation('common')

  const onResetSettings = useCallback(() => {
    // TODO: Call Tauri API to set login item
  }, [])

  const onRevealSettingsFile = useCallback(() => {
    revealSettingsFile().catch((err) => console.error('Failed to reveal settings file:', err))
  }, [])

  const onRevealApplicationFile = useCallback(() => {
    revealApplicationFile().catch((err) => console.error('Failed to reveal application file:', err))
  }, [])

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsAccordion label={SettingsT.t('accordion.label')}>
        <SettingsItem
          label={SettingsT.t('resetSettings.label')}
          description={SettingsT.t('resetSettings.description')}
        >
          <Button variant="solid" onClick={() => onResetSettings()}>
            <Text>{CommonT.t('action.reset')}</Text>
          </Button>
        </SettingsItem>
        <SettingsItem
          label={SettingsT.t('openSettingsFile.label')}
          description={SettingsT.t('openSettingsFile.description')}
        >
          <Button variant="solid" onClick={onRevealSettingsFile}>
            <Text>{SettingsT.t('openSettingsFile.action')}</Text>
          </Button>
        </SettingsItem>
        <SettingsItem
          label={SettingsT.t('openApplicationFile.label')}
          description={SettingsT.t('openApplicationFile.description')}
        >
          <Button variant="solid" onClick={onRevealApplicationFile}>
            <Text>{SettingsT.t('openApplicationFile.action')}</Text>
          </Button>
        </SettingsItem>
      </SettingsAccordion>
    </SettingsSection>
  )
}

export default memo(ColorpickerSettings)
