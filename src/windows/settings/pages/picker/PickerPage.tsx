import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsToggle, SettingsSelect } from '@components/settings'
import { useSettingsStore } from '@stores/settingsStore'
import type { EyedropperGridSizeOption } from '@interfaces/settings'

const PickerPage = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'magnifier' })

  const { eyedropperGridSize, eyedropperShowHex, eyedropperHideMain, updateSetting } =
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
        label={SettingsT.t('showHex.label')}
        description={SettingsT.t('showHex.description')}
      >
        <SettingsToggle
          checked={eyedropperShowHex}
          onChange={(checked) => updateSetting('eyedropperShowHex', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('hideMain.label')}
        description={SettingsT.t('hideMain.description')}
      >
        <SettingsToggle
          checked={eyedropperHideMain}
          onChange={(checked) => updateSetting('eyedropperHideMain', checked)}
        />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(PickerPage)
