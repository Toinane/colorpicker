import { FunctionComponent, JSX } from 'react'

import Picker from '@assets/svg/picker.svg?react'
import Swatch from '@assets/svg/swatch.svg?react'
import Tint from '@assets/svg/tint.svg?react'
import Contrast from '@assets/svg/contrast.svg?react'
import Opacity from '@assets/svg/opacity.svg?react'
import Lock from '@assets/svg/lock.svg?react'
import Unlock from '@assets/svg/unlock.svg?react'

import style from './appIcon.module.css'

export enum IAppIcon {
  PICKER = 'picker',
  SWATCH = 'swatch',
  TINT = 'tint',
  CONTRAST = 'contrast',
  OPACITY = 'opacity',
  LOCK = 'lock',
  UNLOCK = 'unlock',
}

type AppIconProps = {
  type: IAppIcon
  alt?: string
}

const AppIcon: FunctionComponent<AppIconProps> = ({ type, alt }): JSX.Element => {
  const getIcon = (icon: IAppIcon) => {
    switch (icon) {
      case IAppIcon.PICKER:
        return <Picker />
      case IAppIcon.SWATCH:
        return <Swatch />
      case IAppIcon.TINT:
        return <Tint />
      case IAppIcon.CONTRAST:
        return <Contrast />
      case IAppIcon.OPACITY:
        return <Opacity />
      case IAppIcon.LOCK:
        return <Lock />
      case IAppIcon.UNLOCK:
        return <Unlock />
    }
  }

  return (
    <section className={style.section} title={alt}>
      {getIcon(type)}
    </section>
  )
}

export default AppIcon
