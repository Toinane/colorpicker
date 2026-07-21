import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useSettingsStore } from '@stores/settingsStore'
import { HOTKEY_REGISTRY } from '@common/hotkeys'
import type { IAppSettings } from '@interfaces/settings'

/**
 * Returns a validator that checks a candidate accelerator against every other
 * registered app-level hotkey, so two shortcuts can never silently collide.
 * @param selfKey - the setting being edited, excluded from the conflict check
 */
export function useHotkeyConflict(selfKey: keyof IAppSettings) {
  const settings = useSettingsStore()
  const { t } = useTranslation('settings')

  return useCallback(
    (accelerator: string): string | null => {
      const conflict = HOTKEY_REGISTRY.find(
        (entry) => entry.settingKey !== selfKey && settings[entry.settingKey] === accelerator,
      )
      return conflict ? t('hotkey.conflict', { label: t(conflict.labelKey) }) : null
    },
    [settings, selfKey, t],
  )
}
