import { memo } from 'react'
import { Link, useLocation } from 'wouter'
import classNames from 'clsx'
import { useTranslation } from 'react-i18next'

import ColorpickerIcon from '@assets/icons/settings/colorpicker-icon.svg?react'
import PickerIcon from '@assets/icons/settings/picker-icon.svg?react'
import ShortcutsIcon from '@assets/icons/settings/shortcuts-icon.svg?react'
import FormatIcon from '@assets/icons/settings/format-icon.svg?react'
import PaletteIcon from '@assets/icons/settings/palette-icon.svg?react'
import WindowControls from '@components/windowBar/windowControls'
import { Heading } from '@components/ui'

import style from './settingsTopBar.module.css'

interface NavItemProps {
  to: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  isActive: boolean
}

const NavItem = memo<NavItemProps>(({ to, icon: Icon, label, isActive }) => {
  return (
    <Link href={to} className={classNames(style.navItem, { [style.active]: isActive })}>
      <Icon className={style.navIcon} />
      <Heading level={1} size="small" weight="bold" className={style.navTitle}>
        {label}
      </Heading>
    </Link>
  )
})

const SettingsTopBar = () => {
  const [location] = useLocation()
  const { t } = useTranslation('settings')

  const navItems = [
    { to: '/settings', icon: ColorpickerIcon, label: t('navigation.general') },
    { to: '/settings/picker', icon: PickerIcon, label: t('navigation.magnifier') },
    { to: '/settings/palette', icon: PaletteIcon, label: t('navigation.palette') },
    { to: '/settings/shortcuts', icon: ShortcutsIcon, label: t('navigation.shortcuts') },
    { to: '/settings/format', icon: FormatIcon, label: t('navigation.format') },
  ]

  return (
    <nav className={style.settingsTopBar} data-tauri-drag-region>
      {navItems.map((item) => (
        <NavItem key={item.to} {...item} isActive={location === item.to} />
      ))}
      <div className={style.windowControlsWrapper}>
        <WindowControls />
      </div>
    </nav>
  )
}

export default memo(SettingsTopBar)
