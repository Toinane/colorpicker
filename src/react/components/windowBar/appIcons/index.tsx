import { FunctionComponent, JSX } from 'react'
import { useTranslation } from 'react-i18next'

import Icon, { IconColors, IconEnum } from '../../icons'
import { useTheme } from '@react/hooks'

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

  return (
    <section className={style.appIcons}>
      <div className={style.iconContainer} title={t('common.eyedropper')}>
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
