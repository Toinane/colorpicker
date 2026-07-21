import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Router, Route } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { I18nextProvider } from 'react-i18next'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { emit } from '@tauri-apps/api/event'

import i18n from './i18n'

import Colorpicker from '@windows/colorpicker/colorpicker'
import Settings from '@windows/settings/settings'
import SettingsProvider from '@components/SettingsProvider'

import './style.global.css'

const AppRouter = () => {
  const readyEmitted = useRef(false)

  useEffect(() => {
    // Signal that the frontend is ready and window can be shown
    // Wait a brief moment for the DOM to fully render
    // Guard against React StrictMode's dev-only double-invocation of effects
    if (readyEmitted.current) return
    readyEmitted.current = true

    const label = getCurrentWindow().label
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        emit('window-ready', label).catch(console.error)
      })
    })
  }, [])

  return (
    <>
      <Route path="/colorpicker" component={Colorpicker} />
      <Route path="/settings" component={Settings} />
      <Route path="/settings/*" component={Settings} />
      <Route path="/" component={Colorpicker} />
    </>
  )
}

const App = () => (
  <I18nextProvider i18n={i18n}>
    <SettingsProvider>
      <Router hook={useHashLocation}>
        <AppRouter />
      </Router>
    </SettingsProvider>
  </I18nextProvider>
)

// Set the initial hash synchronously (before the first render) so the router
// never briefly renders the default "/" (Colorpicker) route in the settings window.
const initialWindowLabel = getCurrentWindow().label
if (initialWindowLabel === 'settings' && !window.location.hash.startsWith('#/settings')) {
  window.location.hash = '/settings'
} else if (
  initialWindowLabel === 'colorpicker' &&
  !window.location.hash.startsWith('#/colorpicker')
) {
  window.location.hash = '/colorpicker'
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
