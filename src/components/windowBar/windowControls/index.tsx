import { FunctionComponent, JSX, useEffect, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

import style from './windowControls.module.css'

const WindowControls: FunctionComponent = (): JSX.Element => {
  const currentWindow = getCurrentWindow()
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Check initial maximize state
    currentWindow.isMaximized().then(setIsMaximized)

    // Listen for resize events to track maximize state
    const unlisten = currentWindow.onResized(async () => {
      const maximized = await currentWindow.isMaximized()
      setIsMaximized(maximized)
    })

    return () => {
      unlisten.then((fn) => fn())
    }
  }, [currentWindow])

  const handleMinimize = () => {
    currentWindow.minimize()
  }

  const handleMaximize = () => {
    currentWindow.toggleMaximize()
  }

  const handleClose = () => {
    currentWindow.close()
  }

  return (
    <section className={style.windowControls}>
      <button
        className={style.controlButton}
        onClick={handleMinimize}
        aria-label="Minimize"
        title="Minimize"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect width="10" height="1" x="1" y="6" fill="currentColor" />
        </svg>
      </button>
      <button
        className={style.controlButton}
        onClick={handleMaximize}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        title={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? (
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect
              width="7"
              height="7"
              x="2.5"
              y="2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M 3.5,2.5 L 3.5,1.5 L 10.5,1.5 L 10.5,8.5 L 9.5,8.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect
              width="9"
              height="9"
              x="1.5"
              y="1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        )}
      </button>
      <button
        className={`${style.controlButton} ${style.closeButton}`}
        onClick={handleClose}
        aria-label="Close"
        title="Close"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M 2,2 L 10,10 M 10,2 L 2,10"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </section>
  )
}

export default WindowControls
