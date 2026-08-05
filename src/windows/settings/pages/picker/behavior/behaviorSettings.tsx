import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem } from '@components/settings'
import { Toggle } from '@components/ui'
import { useSettingsStore } from '@stores/settingsStore'

const BehaviorSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'magnifier.behavior' })

  const eyedropperHideMain = useSettingsStore((state) => state.eyedropperHideMain)
  const eyedropperDetectBackgroundChanges = useSettingsStore(
    (state) => state.eyedropperDetectBackgroundChanges,
  )
  const eyedropperAllowHoverThrough = useSettingsStore((state) => state.eyedropperAllowHoverThrough)
  const eyedropperAllowHoverThroughBeforeCursorAside = useSettingsStore(
    (state) => state.eyedropperAllowHoverThroughBeforeCursorAside,
  )
  const autoCopyOnPick = useSettingsStore((state) => state.autoCopyOnPick)
  const quickPickHeadless = useSettingsStore((state) => state.quickPickHeadless)
  const eyedropperCursorAsideMode = useSettingsStore((state) => state.eyedropperCursorAsideMode)
  const updateSetting = useSettingsStore((state) => state.updateSetting)
  const updateSettings = useSettingsStore((state) => state.updateSettings)

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
        <Toggle
          checked={eyedropperHideMain}
          onChange={(checked) => updateSetting('eyedropperHideMain', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('detectBackgroundChanges.label')}
        description={SettingsT.t('detectBackgroundChanges.description')}
      >
        <Toggle
          checked={eyedropperDetectBackgroundChanges}
          onChange={(checked) => updateSetting('eyedropperDetectBackgroundChanges', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('allowHoverThrough.label')}
        description={SettingsT.t('allowHoverThrough.description')}
        disabled={eyedropperCursorAsideMode}
      >
        <Toggle
          checked={eyedropperAllowHoverThrough}
          onChange={(checked) => updateSetting('eyedropperAllowHoverThrough', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('autoCopyOnPick.label')}
        description={SettingsT.t('autoCopyOnPick.description')}
      >
        <Toggle
          checked={autoCopyOnPick}
          onChange={(checked) => updateSetting('autoCopyOnPick', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('quickPickHeadless.label')}
        description={SettingsT.t('quickPickHeadless.description')}
      >
        <Toggle
          checked={quickPickHeadless}
          onChange={(checked) => updateSetting('quickPickHeadless', checked)}
        />
      </SettingsItem>
      <SettingsItem
        label={SettingsT.t('cursorAsideMode.label')}
        description={SettingsT.t('cursorAsideMode.description')}
      >
        <Toggle checked={eyedropperCursorAsideMode} onChange={handleCursorAsideModeChange} />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(BehaviorSettings)
