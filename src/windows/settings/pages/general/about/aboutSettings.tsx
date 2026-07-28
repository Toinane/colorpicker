import { memo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'

import {
  SettingsSection,
  SettingsItem,
  SettingsItemList,
  SettingsAccordion,
  SettingsButton,
  SettingsLink,
} from '@components/settings'
import { useSettingsStore } from '@stores/settingsStore'
import { showToast } from '@stores/toastStore'

// Consecutive clicks (within CLICK_WINDOW_MS of each other) needed to toggle
// the Experimental section, à la Android's "tap build number" trick.
const TOGGLE_CLICK_COUNT = 10
const CLICK_WINDOW_MS = 1500

const AboutSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.about' })
  const CommonT = useTranslation('common')

  const clickCountRef = useRef(0)
  const lastClickAtRef = useRef(0)

  const versionsList: Array<Record<string, string> | string> = [
    'Stable 3.0.0 (cdf3e8b6)',
    'Windows 11 64-bit (10.0.26100)',
    '2024-10-14T12:00:00Z (2 days ago)',
  ]

  const onCopyVersions = () => {
    const versionsText = versionsList
      .map((item) => (typeof item === 'string' ? item : Object.values(item).join(': ')))
      .join('\n')
    writeText(versionsText).catch((err) => console.error('Failed to copy versions:', err))
  }

  const onAuthorClick = () => {
    const now = Date.now()
    clickCountRef.current =
      now - lastClickAtRef.current > CLICK_WINDOW_MS ? 1 : clickCountRef.current + 1
    lastClickAtRef.current = now

    if (clickCountRef.current >= TOGGLE_CLICK_COUNT) {
      clickCountRef.current = 0
      const nowUnlocked = !useSettingsStore.getState().experimentalFeaturesUnlocked
      useSettingsStore.getState().updateSetting('experimentalFeaturesUnlocked', nowUnlocked)
      showToast(SettingsT.t(nowUnlocked ? 'experimentalUnlockedToast' : 'experimentalLockedToast'))
    }
  }

  return (
    <>
      <SettingsSection title={SettingsT.t('title')}>
        <SettingsAccordion
          label={SettingsT.t('versions.label')}
          description={SettingsT.t('versions.description')}
          accordionContent={
            <SettingsButton
              label={CommonT.t('action.copy')}
              clickedLabel={CommonT.t('action.copied')}
              onClick={onCopyVersions}
            />
          }
        >
          <SettingsItemList items={versionsList} />
        </SettingsAccordion>
      </SettingsSection>
      <SettingsSection>
        <SettingsItem label={CommonT.t('website')}>
          <SettingsLink href="https://colorpicker.fr" label="colorpicker.fr" />
        </SettingsItem>
        <div onClick={onAuthorClick}>
          <SettingsItem
            label={SettingsT.t('author.label')}
            description={SettingsT.t('author.description')}
          />
        </div>
      </SettingsSection>
    </>
  )
}

export default memo(AboutSettings)
