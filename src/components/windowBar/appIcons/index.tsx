import { FunctionComponent, JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { getAllWebviewWindows, WebviewWindow } from '@tauri-apps/api/webviewWindow'
import Color from 'colorjs.io'

import Icon, { IconColors, IconEnum } from '../../icons'
import { useTheme } from '@hooks/index'
import { useColorStore } from '@stores/colorStore'
import { useSettingsStore } from '@stores/settingsStore'

import style from './appIcons.module.css'

const THEME_COLORS = {
  light: {
    main: '#000000',
    secondary: '#3e3e3e',
    tertiary: '#7b7b7b',
  },
  dark: {
    main: '#ffffff',
    secondary: '#bebdbd',
    tertiary: '#989898',
  },
} as const satisfies Record<'light' | 'dark', IconColors>

const AppIcons: FunctionComponent = (): JSX.Element => {
  const { t } = useTranslation()
  const theme = useTheme()
  const iconColors = THEME_COLORS[theme]
  const { setColor } = useColorStore()
  const {
    eyedropperHideMain,
    eyedropperGridSize,
    eyedropperShowHex,
    eyedropperMagnifierSize,
    eyedropperDetectBackgroundChanges,
    eyedropperAllowHoverThrough,
  } = useSettingsStore()

  const handlePickerClick = async () => {
    const currentWindow = getCurrentWindow()

    try {
      // Hide main window if setting enabled
      if (eyedropperHideMain) {
        await currentWindow.hide()
      }

      // Launch native picker (blocks until color selected)
      const result = await invoke<{ r: number; g: number; b: number } | null>('pick_color', {
        gridSize: eyedropperGridSize,
        showHex: eyedropperShowHex,
        magnifierSize: eyedropperMagnifierSize,
        detectBackgroundChanges: eyedropperDetectBackgroundChanges,
        allowHoverThrough: eyedropperAllowHoverThrough,
      })

      // Show main window again
      if (eyedropperHideMain) {
        await currentWindow.show()
      }

      // Update color if selected
      if (result) {
        const color = new Color('srgb', [result.r / 255, result.g / 255, result.b / 255])
        setColor(color)
      }
    } catch (err) {
      console.error('Picker failed:', err)
      // Re-show window on error
      if (eyedropperHideMain) {
        await currentWindow.show()
      }
    }
  }

  const handleSettingsClick = async () => {
    try {
      // Check if settings window already exists
      const windows = await getAllWebviewWindows()
      let settingsWindow = windows.find((w) => w.label === 'settings')

      if (settingsWindow) {
        // Window exists, just show and focus it
        await settingsWindow.show()
        await settingsWindow.setFocus()
      } else {
        // Create the settings window on-demand (hidden initially)
        // It will be shown automatically when the frontend emits "window-ready"
        console.log('Creating settings window')
        try {
          const newWindow = new WebviewWindow('settings', {
            url: '/',
            title: 'Settings',
            width: 543,
            height: 550,
            minWidth: 555,
            minHeight: 560,
            resizable: true,
            transparent: true,
            center: true,
            decorations: false,
            visible: false,
            windowEffects: {
              effects: ['mica' as any],
              state: 'followsWindowActiveState' as any,
              radius: 8.0,
              color: [0, 0, 0, 0],
            },
          })
          console.log('Settings window created:', newWindow.label)
        } catch (createErr) {
          console.error('Failed to create settings window:', createErr)
        }
      }
    } catch (err) {
      console.error('Failed to open settings:', err)
    }
  }

  return (
    <section className={style.appIcons}>
      <div
        className={style.iconContainer}
        title={t('common.eyedropper')}
        onClick={handlePickerClick}
        style={{ cursor: 'pointer' }}
      >
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.PICKER} colors={iconColors} />
        </div>
      </div>
      <div className={style.iconContainer} title={t('common.swatch')}>
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.SWATCH} colors={iconColors} />
        </div>
      </div>
      <div className={style.iconContainer} title={t('common.tint')}>
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.TINT} colors={iconColors} />
        </div>
      </div>
      <div className={style.iconContainer} title={t('common.contrast')}>
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.CONTRAST} colors={iconColors} />
        </div>
      </div>
      <div className={style.iconContainer} title={t('common.opacity')}>
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.OPACITY} colors={iconColors} />
        </div>
      </div>
      {/* <div className={style.iconContainer} title={t('common.lock')}>
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.LOCK} colors={iconColors} />
        </div>
      </div> */}
      <div
        className={style.iconContainer}
        title={t('common.settings')}
        onClick={handleSettingsClick}
        style={{ cursor: 'pointer' }}
      >
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.SETTINGS} colors={iconColors} />
        </div>
      </div>
    </section>
  )
}

export default AppIcons
