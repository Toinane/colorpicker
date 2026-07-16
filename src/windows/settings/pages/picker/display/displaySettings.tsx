import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsToggle, SettingsSelect } from '@components/settings'
import { useSettingsStore } from '@stores/settingsStore'
import type { EyedropperGridSizeOption, EyedropperMagnifierSizeOption } from '@interfaces/settings'

const DisplaySettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'magnifier.display' })

  const { eyedropperGridSize, eyedropperMagnifierSize, eyedropperShowHex, updateSetting } =
    useSettingsStore()

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsItem
        label={SettingsT.t('gridSize.label')}
        description={SettingsT.t('gridSize.description')}
      >
        <SettingsSelect
          value={String(eyedropperGridSize)}
          onChange={(value) =>
            updateSetting('eyedropperGridSize', Number(value) as EyedropperGridSizeOption)
          }
          options={[
            { value: '5', label: '5×5' },
            { value: '11', label: '11×11' },
            { value: '21', label: '21×21' },
          ]}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('magnifierSize.label')}
        description={SettingsT.t('magnifierSize.description')}
      >
        <SettingsSelect
          value={String(eyedropperMagnifierSize)}
          onChange={(value) =>
            updateSetting('eyedropperMagnifierSize', Number(value) as EyedropperMagnifierSizeOption)
          }
          options={[
            { value: '220', label: SettingsT.t('magnifierSize.options.small') },
            { value: '300', label: SettingsT.t('magnifierSize.options.normal') },
            { value: '380', label: SettingsT.t('magnifierSize.options.high') },
          ]}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('showHex.label')}
        description={SettingsT.t('showHex.description')}
      >
        <SettingsToggle
          checked={eyedropperShowHex}
          onChange={(checked) => updateSetting('eyedropperShowHex', checked)}
        />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(DisplaySettings)
