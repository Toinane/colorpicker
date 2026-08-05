import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Router, Route } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { I18nextProvider } from 'react-i18next'
import { getCurrentWindow } from '@tauri-apps/api/window'

import i18n from './i18n'
import { emitWindowReady } from '@common/ipc'

import Colorpicker from '@windows/colorpicker/colorpicker'
import Settings from '@windows/settings/settings'
import Palettes from '@windows/palettes/palettes'
import SettingsProvider from '@components/SettingsProvider'
import ToastContainer from '@components/toast/toast'
import ErrorBoundary from '@components/ErrorBoundary'
import { useColorpickerStore } from '@stores/colorpickerStore'
import { useColorStore } from '@stores/colorStore'

import './style.global.css'

const AppRouter = () => {
  const readyEmitted = useRef(false)
  const isBordered = useColorpickerStore((state) => state.isBordered)
  const isFullColored = useColorpickerStore((state) => state.isFullColored)
  const isVibrant = useColorpickerStore((state) => state.isVibrant)
  const color = useColorStore((state) => state.color)
  const oppositeColor = useColorStore((state) => state.oppositeColor)
  const isDarkColor = useColorStore((state) => state.isDarkColor)

  useEffect(() => {
    const handleFocus = () => document.body.classList.remove('BLUR')
    const handleBlur = () => document.body.classList.add('BLUR')

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useEffect(() => {
    // Signal that the frontend is ready and window can be shown
    // Wait a brief moment for the DOM to fully render
    // Guard against React StrictMode's dev-only double-invocation of effects
    if (readyEmitted.current) return
    readyEmitted.current = true

    const label = getCurrentWindow().label
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        emitWindowReady(label).catch(console.error)
      })
    })
  }, [])

  useEffect(() => {
    const rgb = color.to('srgb')

    document.documentElement.style.setProperty('--main-color', `${color}`)
    document.documentElement.style.setProperty(
      '--main-color-r',
      `${Math.round((rgb.r ?? 0) * 100)}%`,
    )
    document.documentElement.style.setProperty(
      '--main-color-g',
      `${Math.round((rgb.g ?? 0) * 100)}%`,
    )
    document.documentElement.style.setProperty(
      '--main-color-b',
      `${Math.round((rgb.b ?? 0) * 100)}%`,
    )
    document.documentElement.style.setProperty('--opposite-color', `${oppositeColor}`)
  }, [color, oppositeColor])

  useEffect(() => {
    document.body.classList.toggle('BORDERED', isBordered)
    document.body.classList.toggle('COLORED', isFullColored)
    document.body.classList.toggle('NO_VIBRANCY', !isVibrant)
    document.body.classList.toggle('DARK_COLOR', isDarkColor)

    return () => {
      document.body.classList.remove('BORDERED', 'COLORED', 'NO_VIBRANCY', 'DARK_COLOR')
    }
  }, [isBordered, isFullColored, isVibrant, isDarkColor])

  return (
    <ErrorBoundary>
      <Route path="/colorpicker" component={Colorpicker} />
      <Route path="/settings" component={Settings} />
      <Route path="/settings/*" component={Settings} />
      <Route path="/palettes" component={Palettes} />
      <Route path="/" component={Colorpicker} />
    </ErrorBoundary>
  )
}

const App = () => (
  <I18nextProvider i18n={i18n}>
    <SettingsProvider>
      <Router hook={useHashLocation}>
        <AppRouter />
      </Router>
      <ToastContainer />
    </SettingsProvider>
  </I18nextProvider>
)

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
