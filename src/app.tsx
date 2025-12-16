import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Router, Route, useLocation } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { I18nextProvider } from 'react-i18next'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { emit } from '@tauri-apps/api/event'

import i18n from './i18n'

import Colorpicker from '@windows/colorpicker/colorpicker'
import Settings from '@windows/settings/settings'

import './style.global.css'

const AppRouter = () => {
  const [, setLocation] = useLocation()

  useEffect(() => {
    // Detect which window we're in and route accordingly
    const setupWindow = async () => {
      const window = getCurrentWindow()
      const label = window.label

      if (label === 'settings') {
        setLocation('/settings')
      } else if (label === 'colorpicker') {
        setLocation('/colorpicker')
      }

      // Signal that the frontend is ready and window can be shown
      // Wait a brief moment for the DOM to fully render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          emit('window-ready', label).catch(console.error)
        })
      })
    }

    setupWindow()
  }, [setLocation])

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
    <Router hook={useHashLocation}>
      <AppRouter />
    </Router>
  </I18nextProvider>
)

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
