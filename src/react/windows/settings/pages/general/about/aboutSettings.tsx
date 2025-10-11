import { memo } from 'react'

import { SettingsSection, SettingsItem } from '@react/components/settings'

const AboutSettings = () => {
  const version = '3.0.0'
  const electronVersion = '38.2.2'
  const chromeVersion = '132.0.0'
  const nodeVersion = '22.0.0'

  return (
    <>
      <SettingsSection title="About">
        <SettingsItem label="Version" description="The current version of Colorpicker">
          <span>{version}</span>
        </SettingsItem>
        <SettingsItem label="Electron" description="The version of Electron used by Colorpicker">
          <span>{electronVersion}</span>
        </SettingsItem>
        <SettingsItem label="Chrome" description="The version of Chrome used by Colorpicker">
          <span>{chromeVersion}</span>
        </SettingsItem>
        <SettingsItem label="Node.js" description="The version of Node.js used by Colorpicker">
          <span>{nodeVersion}</span>
        </SettingsItem>
      </SettingsSection>
      <SettingsSection>
        <SettingsItem label="Website" description="Visit the official Colorpicker website">
          <a
            href="https://colorpicker.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            colorpicker.fr
          </a>
        </SettingsItem>
      </SettingsSection>
    </>
  )
}

export default memo(AboutSettings)
