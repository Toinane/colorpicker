import { Route, Switch } from 'wouter'

import { SettingsTopBar } from '@components/settings'

import GeneralPage from './pages/general/generalPage'
import PickerPage from './pages/picker/PickerPage'
import ShortcutsPage from './pages/shortcuts/shortcutsPage'
import PalettePage from './pages/palette/PalettePage'
import FormatPage from './pages/format/FormatPage'

import style from './settings.module.css'

const Settings = () => {
  return (
    <section className={style.settingsWindow}>
      <SettingsTopBar />
      <section className={style.settingsContent}>
        <Switch>
          <Route path="/settings" component={GeneralPage} />
          <Route path="/settings/picker" component={PickerPage} />
          <Route path="/settings/palette" component={PalettePage} />
          <Route path="/settings/shortcuts" component={ShortcutsPage} />
          <Route path="/settings/format" component={FormatPage} />
        </Switch>
      </section>
    </section>
  )
}

export default Settings
