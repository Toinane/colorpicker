import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  SettingsSection,
  SettingsItem,
  SettingsItemList,
  SettingsAccordion,
  SettingsButton,
  SettingsLink,
} from '@react/components/settings'

const AboutSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.about' })
  const CommonT = useTranslation('common')

  const versionsList: Array<Record<string, string> | string> = [
    'Stable 3.0.0 (cdf3e8b6)',
    'Windows 11 64-bit (10.0.26100)',
    '2024-10-14T12:00:00Z (2 days ago)',
  ]

  const onCopyVersions = () => {
    const versionsText = versionsList
      .map((item) => (typeof item === 'string' ? item : Object.values(item).join(': ')))
      .join('\n')
    navigator.clipboard.writeText(versionsText)
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
        <SettingsItem
          label={SettingsT.t('author.label')}
          description={SettingsT.t('author.description')}
        />
      </SettingsSection>
    </>
  )
}

export default memo(AboutSettings)
