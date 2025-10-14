import { memo, useMemo, type CSSProperties, type FC, type ReactElement } from 'react'
import { iconMap, iconNames, getAvailableIcons } from './iconLoader'

// Use the dynamically loaded icon map
const ICON_MAP = iconMap

// Export the dynamically generated icon names
export const IconEnum = iconNames

// Export type for the icon names
export type IconType = (typeof IconEnum)[keyof typeof IconEnum]

// Export helper to get available icons
export { getAvailableIcons }

export interface IconColors {
  main?: string
  secondary?: string
  tertiary?: string
}

interface IconProps {
  type: IconType
  colors?: IconColors
}

const DEFAULT_COLORS: IconColors = {
  main: '#000',
  secondary: '#3e3e3e',
  tertiary: '#7b7b7b',
}

/**
 * Icon component - A pure component that renders SVG icons with customizable colors
 * Automatically discovers and supports any SVG files added to @assets/svg directory
 *
 * @param type - The type of icon to render (icon filename without extension, uppercase)
 * @param colors - Optional custom colors for the icon
 */
const Icon: FC<IconProps> = ({ type, colors }): ReactElement => {
  const style = useMemo<CSSProperties>(
    () =>
      ({
        width: '100%',
        height: '100%',
        '--app-icon-main-color': colors?.main ?? DEFAULT_COLORS.main,
        '--app-icon-secondary-color': colors?.secondary ?? DEFAULT_COLORS.secondary,
        '--app-icon-tertiary-color': colors?.tertiary ?? DEFAULT_COLORS.tertiary,
      }) as CSSProperties,
    [colors?.main, colors?.secondary, colors?.tertiary],
  )

  // Direct lookup - no runtime transformation needed
  const IconComponent = ICON_MAP[type]

  if (!IconComponent) {
    console.warn(`Icon: Icon "${type}" not found. Available icons:`, Object.keys(ICON_MAP))
    return null as unknown as ReactElement
  }

  return <IconComponent style={style} />
}

export default memo(Icon)
