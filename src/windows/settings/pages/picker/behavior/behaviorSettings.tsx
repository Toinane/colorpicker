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
    eyedropperAllowHoverThroughBeforeCursorAside,
    autoCopyOnPick,
    quickPickHeadless,
    eyedropperCursorAsideMode,
    updateSetting,
    updateSettings,
  } = useSettingsStore()

  // Cursor-aside mode moves the lens off the cursor entirely, which makes
  // "Allow Hover Through" (letting hover events reach whatever the lens
  // would otherwise be covering) irrelevant to whatever's directly under the
  // cursor but still useful for whatever the offset lens itself ends up
  // sitting on top of — so it's forced on and locked while Cursor-aside mode
  // is active. The user's manual preference is stashed and restored when
  // Cursor-aside mode is turned back off.
  const handleCursorAsideModeChange = (enabled: boolean) => {
    if (enabled) {
      updateSettings({
        eyedropperCursorAsideMode: true,
        eyedropperAllowHoverThrough: true,
        eyedropperAllowHoverThroughBeforeCursorAside: eyedropperAllowHoverThrough,
      })
    } else {
      updateSettings({
        eyedropperCursorAsideMode: false,
        eyedropperAllowHoverThrough: eyedropperAllowHoverThroughBeforeCursorAside,
      })
    }
  }

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
        disabled={eyedropperCursorAsideMode}
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
      <SettingsItem
        label={SettingsT.t('cursorAsideMode.label')}
        description={SettingsT.t('cursorAsideMode.description')}
      >
        <SettingsToggle
          checked={eyedropperCursorAsideMode}
          onChange={handleCursorAsideModeChange}
        />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(BehaviorSettings)
