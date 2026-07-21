import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsSelect } from '@components/settings'
import { useSettingsStore } from '@stores/settingsStore'
import { AVAILABLE_LANGUAGES } from '@common/languages'
import type { LanguageOption } from '@interfaces/settings'

const LanguageSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.language' })
  const { language, updateSetting } = useSettingsStore()

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsItem
        label={SettingsT.t('language.label')}
        description={SettingsT.t('language.description')}
      >
        <SettingsSelect
          value={language}
          onChange={(value) => updateSetting('language', value as LanguageOption)}
          options={AVAILABLE_LANGUAGES}
        />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(LanguageSettings)
