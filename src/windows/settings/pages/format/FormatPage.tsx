import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem } from '@components/settings'
import { Select, Toggle } from '@components/ui'
import { useSettingsStore } from '@stores/settingsStore'
import type { ColorFormat } from '@interfaces/settings'

const FormatPage = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'format' })

  const defaultFormat = useSettingsStore((state) => state.defaultFormat)
  const hexPrefix = useSettingsStore((state) => state.hexPrefix)
  const updateSetting = useSettingsStore((state) => state.updateSetting)

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsItem
        label={SettingsT.t('defaultFormat.label')}
        description={SettingsT.t('defaultFormat.description')}
      >
        <Select
          value={defaultFormat}
          onChange={(value) => updateSetting('defaultFormat', value as ColorFormat)}
          options={[
            { value: 'hex', label: SettingsT.t('defaultFormat.options.hex') },
            { value: 'rgb', label: SettingsT.t('defaultFormat.options.rgb') },
            { value: 'hsl', label: SettingsT.t('defaultFormat.options.hsl') },
            { value: 'hsv', label: SettingsT.t('defaultFormat.options.hsv') },
          ]}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('hexPrefix.label')}
        description={SettingsT.t('hexPrefix.description')}
      >
        <Toggle checked={hexPrefix} onChange={(checked) => updateSetting('hexPrefix', checked)} />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(FormatPage)
