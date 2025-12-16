import { FunctionComponent, JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
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
  const { eyedropperHideMain } = useSettingsStore()

  const handlePickerClick = async () => {
    const currentWindow = getCurrentWindow()

    try {
      // Hide main window if setting enabled
      if (eyedropperHideMain) {
        await currentWindow.hide()
      }

      // Launch native picker (blocks until color selected)
      const result = await invoke<{ r: number; g: number; b: number } | null>('pick_color')

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

  return (
    <section className={style.appIcons}>
      <div
        className={style.iconContainer}
        title={t('common.eyedropper')}
        onClick={handlePickerClick}
        style={{ cursor: 'pointer' }}
      >
        <Icon type={IconEnum.PICKER} colors={iconColors} />
      </div>
      <div className={style.iconContainer} title={t('common.swatch')}>
        <Icon type={IconEnum.SWATCH} colors={iconColors} />
      </div>
      <div className={style.iconContainer} title={t('common.tint')}>
        <Icon type={IconEnum.TINT} colors={iconColors} />
      </div>
      <div className={style.iconContainer} title={t('common.contrast')}>
        <Icon type={IconEnum.CONTRAST} colors={iconColors} />
      </div>
      <div className={style.iconContainer} title={t('common.opacity')}>
        <Icon type={IconEnum.OPACITY} colors={iconColors} />
      </div>
      <div className={style.iconContainer} title={t('common.lock')}>
        <Icon type={IconEnum.LOCK} colors={iconColors} />
      </div>
    </section>
  )
}

export default AppIcons
