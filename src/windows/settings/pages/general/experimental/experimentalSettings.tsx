import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsSection, SettingsItem, SettingsAccordion } from '@components/settings'
import { Toggle } from '@components/ui'
import { useSettingsStore } from '@stores/settingsStore'
import { useSetting } from '@hooks/index'

// Hidden by default — unlocked via the click-counter Easter egg in AboutSettings.
const ExperimentalSettings = () => {
  const SettingsT = useTranslation('settings', { keyPrefix: 'general.experimental' })
  const unlocked = useSettingsStore((state) => state.experimentalFeaturesUnlocked)

  const [isBordered, setIsBordered] = useSetting('isBordered')
  const [isFullColored, setIsFullColored] = useSetting('isFullColored')
  const [isVibrant, setIsVibrant] = useSetting('isVibrant')
  const [eyedropperAdaptiveBorder, setEyedropperAdaptiveBorder] = useSetting(
    'eyedropperAdaptiveBorder',
  )

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
          <Toggle checked={isBordered} onChange={setIsBordered} />
        </SettingsItem>
        <SettingsItem
          label={SettingsT.t('isFullColored.label')}
          description={SettingsT.t('isFullColored.description')}
        >
          <Toggle checked={isFullColored} onChange={setIsFullColored} />
        </SettingsItem>
        <SettingsItem
          label={SettingsT.t('isVibrant.label')}
          description={SettingsT.t('isVibrant.description')}
        >
          <Toggle checked={isVibrant} onChange={setIsVibrant} />
        </SettingsItem>
        <SettingsItem
          label={SettingsT.t('eyedropperAdaptiveBorder.label')}
          description={SettingsT.t('eyedropperAdaptiveBorder.description')}
        >
          <Toggle checked={eyedropperAdaptiveBorder} onChange={setEyedropperAdaptiveBorder} />
        </SettingsItem>
      </SettingsAccordion>
    </SettingsSection>
  )
}

export default memo(ExperimentalSettings)
