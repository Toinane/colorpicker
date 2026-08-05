import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem } from '@components/settings'
import { Select } from '@components/ui'
import { useSettingsStore } from '@stores/settingsStore'
import { AVAILABLE_LANGUAGES } from '@common/languages'
import type { LanguageOption } from '@interfaces/settings'

const LanguageSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.language' })
  const language = useSettingsStore((state) => state.language)
  const updateSetting = useSettingsStore((state) => state.updateSetting)

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsItem
        label={SettingsT.t('language.label')}
        description={SettingsT.t('language.description')}
      >
        <Select
          value={language}
          onChange={(value) => updateSetting('language', value as LanguageOption)}
          options={AVAILABLE_LANGUAGES}
        />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(LanguageSettings)
