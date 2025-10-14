import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  SettingsSection,
  SettingsItem,
  SettingsAccordion,
  SettingsButton,
} from '@react/components/settings'

const ColorpickerSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.advanced' })
  const CommonT = useTranslation('common')

  const onResetSettings = useCallback((checked: boolean) => {
    // TODO: Call electron API to set login item
  }, [])

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsAccordion label={SettingsT.t('accordion.label')}>
        <SettingsItem
          label={SettingsT.t('resetSettings.label')}
          description={SettingsT.t('resetSettings.description')}
        >
          <SettingsButton label={CommonT.t('action.reset')} onClick={() => onResetSettings} />
        </SettingsItem>
      </SettingsAccordion>
    </SettingsSection>
  )
}

export default memo(ColorpickerSettings)
