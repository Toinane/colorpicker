import { memo } from 'react'
import { Link, useLocation } from 'wouter'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import ColorpickerIcon from '@assets/svg/settings/colorpicker-icon.svg?react'
import PickerIcon from '@assets/svg/settings/picker-icon.svg?react'
import ShortcutsIcon from '@assets/svg/settings/shortcuts-icon.svg?react'
import FormatIcon from '@assets/svg/settings/format-icon.svg?react'
import PaletteIcon from '@assets/svg/settings/palette-icon.svg?react'

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
      <h1 className={style.navTitle}>{label}</h1>
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
    <nav className={style.settingsTopBar}>
      {navItems.map((item) => (
        <NavItem key={item.to} {...item} isActive={location === item.to} />
      ))}
    </nav>
  )
}

export default memo(SettingsTopBar)
