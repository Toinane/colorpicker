import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsToggle } from '@components/settings'
import { useSettingsStore } from '@stores/settingsStore'

const BehaviorSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'magnifier.behavior' })

  const {
    eyedropperHideMain,
    eyedropperDetectBackgroundChanges,
    eyedropperAllowHoverThrough,
    autoCopyOnPick,
    quickPickHeadless,
    updateSetting,
  } = useSettingsStore()

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsItem
        label={SettingsT.t('hideMain.label')}
        description={SettingsT.t('hideMain.description')}
      >
        <SettingsToggle
          checked={eyedropperHideMain}
          onChange={(checked) => updateSetting('eyedropperHideMain', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('detectBackgroundChanges.label')}
        description={SettingsT.t('detectBackgroundChanges.description')}
      >
        <SettingsToggle
          checked={eyedropperDetectBackgroundChanges}
          onChange={(checked) => updateSetting('eyedropperDetectBackgroundChanges', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('allowHoverThrough.label')}
        description={SettingsT.t('allowHoverThrough.description')}
      >
        <SettingsToggle
          checked={eyedropperAllowHoverThrough}
          onChange={(checked) => updateSetting('eyedropperAllowHoverThrough', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('autoCopyOnPick.label')}
        description={SettingsT.t('autoCopyOnPick.description')}
      >
        <SettingsToggle
          checked={autoCopyOnPick}
          onChange={(checked) => updateSetting('autoCopyOnPick', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('quickPickHeadless.label')}
        description={SettingsT.t('quickPickHeadless.description')}
      >
        <SettingsToggle
          checked={quickPickHeadless}
          onChange={(checked) => updateSetting('quickPickHeadless', checked)}
        />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(BehaviorSettings)
