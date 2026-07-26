import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsToggle, SettingsAccordion } from '@components/settings'
import { useSettingsStore } from '@stores/settingsStore'
import { useSetting } from '@hooks/index'

// Hidden by default — unlocked via the click-counter Easter egg in AboutSettings.
const ExperimentalSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.experimental' })
  const unlocked = useSettingsStore((state) => state.experimentalFeaturesUnlocked)

  const [isBordered, setIsBordered] = useSetting('isBordered')
  const [isFullColored, setIsFullColored] = useSetting('isFullColored')
  const [isVibrant, setIsVibrant] = useSetting('isVibrant')

  if (!unlocked) return null

  return (
    <SettingsSection title={SettingsT.t('title')}>
      <SettingsAccordion
        label={SettingsT.t('accordion.label')}
        description={SettingsT.t('accordion.description')}
      >
        <SettingsItem
          label={SettingsT.t('isBordered.label')}
          description={SettingsT.t('isBordered.description')}
        >
          <SettingsToggle checked={isBordered} onChange={setIsBordered} />
        </SettingsItem>
        <SettingsItem
          label={SettingsT.t('isFullColored.label')}
          description={SettingsT.t('isFullColored.description')}
        >
          <SettingsToggle checked={isFullColored} onChange={setIsFullColored} />
        </SettingsItem>
        <SettingsItem
          label={SettingsT.t('isVibrant.label')}
          description={SettingsT.t('isVibrant.description')}
        >
          <SettingsToggle checked={isVibrant} onChange={setIsVibrant} />
        </SettingsItem>
      </SettingsAccordion>
    </SettingsSection>
  )
}

export default memo(ExperimentalSettings)
