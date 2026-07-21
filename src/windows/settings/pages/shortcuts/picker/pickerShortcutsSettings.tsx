import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { invoke } from '@tauri-apps/api/core'

import { SettingsSection, SettingsItem, SettingsHotkeyInput } from '@components/settings'
import { useSettingsStore, DEFAULT_SETTINGS } from '@stores/settingsStore'
import { useHotkeyConflict } from '@hooks/index'

const PickerShortcutsSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'shortcuts.picker' })
  const HotkeyT = useTranslation('settings', { keyPrefix: 'hotkey' })
  const { pickerHotkey, updateSetting } = useSettingsStore()
  const checkConflict = useHotkeyConflict('pickerHotkey')

  const handleHotkeyChange = useCallback(
    async (hotkey: string) => {
      try {
        // Register with the OS first; only persist if it actually succeeded
        await invoke('set_picker_hotkey', { hotkey })
        await updateSetting('pickerHotkey', hotkey)
      } catch (error) {
        console.error('Failed to register picker hotkey:', error)
        // TODO: Show error notification to user
      }
    },
    [updateSetting],
  )

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsItem
        label={SettingsT.t('pickerHotkey.label')}
        description={SettingsT.t('pickerHotkey.description')}
      >
        <SettingsHotkeyInput
          value={pickerHotkey}
          defaultValue={DEFAULT_SETTINGS.pickerHotkey}
          onChange={handleHotkeyChange}
          onValidate={checkConflict}
          recordingLabel={SettingsT.t('pickerHotkey.recording')}
          noModifierErrorLabel={HotkeyT.t('noModifier')}
          reservedErrorLabel={HotkeyT.t('reserved')}
          resetLabel={HotkeyT.t('reset')}
        />
      </SettingsItem>
    </SettingsSection>
  )
}

export default memo(PickerShortcutsSettings)
