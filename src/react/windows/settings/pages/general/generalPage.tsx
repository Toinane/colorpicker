import { memo, useCallback, useState } from 'react'

import { SettingsSection, SettingsItem } from '@components/settings'

import AboutSettings from './about/aboutSettings'

const GeneralPage = () => {
  const [openAtLogin, setOpenAtLogin] = useState(false)
  const [keepOnTop, setKeepOnTop] = useState(false)

  const handleOpenAtLoginChange = useCallback((checked: boolean) => {
    setOpenAtLogin(checked)
    // TODO: Call electron API to set login item
  }, [])

  const handleKeepOnTopChange = useCallback((checked: boolean) => {
    setKeepOnTop(checked)
    // TODO: Call electron API to set always on top
  }, [])

  return (
    <>
      <SettingsSection title="Colorpicker">
        <SettingsItem
          label="Open Colorpicker at login"
          description="Launch Colorpicker automatically when you log in"
        >
          {/* <Toggle checked={openAtLogin} onChange={handleOpenAtLoginChange} /> */}
        </SettingsItem>
        <SettingsItem
          label="Keep Colorpicker on top"
          description="Always display Colorpicker above other windows"
        >
          {/* <Toggle checked={keepOnTop} onChange={handleKeepOnTopChange} /> */}
        </SettingsItem>
      </SettingsSection>
      <SettingsSection>
        <SettingsItem
          label="Open Colorpicker at login"
          description="Launch Colorpicker automatically when you log in"
        >
          {/* <Toggle checked={openAtLogin} onChange={handleOpenAtLoginChange} /> */}
        </SettingsItem>
      </SettingsSection>
      <AboutSettings />
    </>
  )
}

export default memo(GeneralPage)
