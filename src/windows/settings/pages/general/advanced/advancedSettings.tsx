import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsAccordion } from '@components/settings'
import { Button, Text } from '@components/ui'

const ColorpickerSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.advanced' })
  const CommonT = useTranslation('common')

  const onResetSettings = useCallback(() => {
    // TODO: Call Tauri API to set login item
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
      </SettingsAccordion>
    </SettingsSection>
  )
}

export default memo(ColorpickerSettings)
