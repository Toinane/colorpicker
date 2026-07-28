import { FunctionComponent, JSX } from 'react'
import { useTranslation } from 'react-i18next'

import Icon, { IconColors, IconEnum } from '../../icons'
import { useTheme } from '@hooks/index'
import { launchPicker, openSettings, openPalettes } from '@common/ipc'

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
  // Hide/show/restore and applying the result are all handled Rust-side
  // (shortcuts::trigger_global_pick) and delivered via the `color-picked`
  // event listened to in colorpicker.tsx — the single result path shared
  // with the tray "pick" item and the global hotkey.
  const handlePickerClick = async () => {
    try {
      await launchPicker()
    } catch (err) {
      console.error('Picker failed:', err)
    }
  }

  // Window creation, geometry, Mica effects, and the create-or-focus check
  // are all handled Rust-side (commands::open_settings) — the tray
  // "Settings" item calls it directly, so this is just the toolbar's path.
  const handleSettingsClick = async () => {
    try {
      await openSettings()
    } catch (err) {
      console.error('Failed to open settings:', err)
    }
  }

  // Same create-or-focus pattern as settings (commands::open_palettes).
  const handlePalettesClick = async () => {
    try {
      await openPalettes()
    } catch (err) {
      console.error('Failed to open palettes:', err)
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
      <div
        className={style.iconContainer}
        title={t('common.swatch')}
        onClick={handlePalettesClick}
        style={{ cursor: 'pointer' }}
      >
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.SWATCH} colors={iconColors} />
        </div>
      </div>
      {/* <div className={style.iconContainer} title={t("common.tint")}>
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.TINT} colors={iconColors} />
        </div>
      </div>
      <div className={style.iconContainer} title={t("common.contrast")}>
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.CONTRAST} colors={iconColors} />
        </div>
      </div>
      <div className={style.iconContainer} title={t("common.opacity")}>
        <div className={style.svgWrapper}>
          <Icon type={IconEnum.OPACITY} colors={iconColors} />
        </div>
      </div> */}
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
