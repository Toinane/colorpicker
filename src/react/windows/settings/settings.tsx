import SettingsNav from '@components/settingsNav/settingsNav'

import './settings.css'

const Settings = () => {
  return (
    <section className="settingsWindow">
      <SettingsNav />
      <section className="settingsContent">
        <h1>Colorpicker</h1>
        <section className="settingsPage">
          <p>Open Colorpicker at login</p>
        </section>
        <section className="settingsPage">
          <p>Keep Colorpicker on top</p>
        </section>
        <section className="settingsPage">
          <h1>Theme</h1>
          <p>Change theme settings here</p>
        </section>
        <h1>Sliders</h1>
        <section className="settingsPage">
          <h1>Slider Format</h1>
          <p>
            Using RGB <span>(255, 255, 255)</span> (Sample)
          </p>
        </section>
        <section className="settingsPage">
          <p>
            Using HSL <span>(240, 100%, 50%)</span> (Sample)
          </p>
        </section>
        <section className="settingsPage">
          <p>
            Using OkLch <span>(240, 100%, 50%)</span> (Sample)
          </p>
        </section>
      </section>
    </section>
  )
}

export default Settings
