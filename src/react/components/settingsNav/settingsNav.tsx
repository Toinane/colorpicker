import ColorpickerIcon from '@assets/svg/settings/colorpicker-icon.svg?react'
import PickerIcon from '@assets/svg/settings/picker-icon.svg?react'
import ShortcutsIcon from '@assets/svg/settings/shortcuts-icon.svg?react'
import AboutIcon from '@assets/svg/settings/about-icon.svg?react'

import './settingsNav.css'

const SettingsNav = () => {
  return (
    <nav className="settingsNav">
      <section className="generalSettings active">
        <ColorpickerIcon />
        <h1>General</h1>
      </section>
      <section className="pickerSettings">
        <PickerIcon />
        <h1>Magnifier</h1>
      </section>
      <section className="shortcutsSettings">
        <ShortcutsIcon />
        <h1>Shortcuts</h1>
      </section>
      <section className="aboutSettings">
        <AboutIcon />
        <h1>About</h1>
      </section>
    </nav>
  )
}

export default SettingsNav
