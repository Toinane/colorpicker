import { FunctionComponent, JSX } from 'react'
import { useTranslation } from 'react-i18next'

import AppIcon, { IAppIcon } from './appIcon'

import style from './appIcons.module.css'

const AppIcons: FunctionComponent = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <section className={style.appIcons}>
      {/* <AppIcon type={IAppIcon.UNLOCK} /> */}
      <AppIcon type={IAppIcon.PICKER} alt={t('common.eyedropper')} />
      <AppIcon type={IAppIcon.SWATCH} />
      <AppIcon type={IAppIcon.TINT} />
      <AppIcon type={IAppIcon.CONTRAST} />
      <AppIcon type={IAppIcon.OPACITY} />
      <AppIcon type={IAppIcon.LOCK} alt={t('common.lock')} />
      {/* <AppIcon type={IAppIcon.LOCK} /> */}
    </section>
  )
}

export default AppIcons
