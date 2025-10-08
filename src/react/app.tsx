import { createRoot } from 'react-dom/client'
import { Router, Route } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { I18nextProvider } from 'react-i18next'

import i18n from './i18n'

import Colorpicker from '@react/windows/colorpicker/colorpicker'
import Settings from '@react/windows/settings/settings'

import './style.global.css'

const App = () => (
  <I18nextProvider i18n={i18n}>
    <Router hook={useHashLocation}>
      <Route path="/colorpicker" component={Colorpicker} />
      <Route path="/settings" component={Settings} />
      <Route path="/" component={Colorpicker} />
    </Router>
  </I18nextProvider>
)

createRoot(document.body).render(<App />)
