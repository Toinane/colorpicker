import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useSettingsStore } from '@stores/settingsStore'
import { HOTKEY_REGISTRY } from '@common/hotkeys'
import type { IAppSettings } from '@interfaces/settings'

/**
 * Returns a validator that checks a candidate accelerator against every other
 * registered app-level hotkey, so two shortcuts can never silently collide.
 * @param selfKey - the setting being edited, excluded from the conflict check
 */
export function useHotkeyConflict(selfKey: keyof IAppSettings) {
  // Only subscribes to the hotkey-registry keys, not the whole settings
  // store, so this doesn't re-render on unrelated setting changes.
  const settings = useSettingsStore(
    useShallow((state) =>
      Object.fromEntries(
        HOTKEY_REGISTRY.map((entry) => [entry.settingKey, state[entry.settingKey]]),
      ),
    ),
  )
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
