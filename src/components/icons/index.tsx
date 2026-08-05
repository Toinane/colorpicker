import { memo, useMemo, type CSSProperties, type FC, type ReactElement } from 'react'
import {
  iconMap,
  ICON_NAMES,
  getAvailableIcons,
  type IconType,
  type MultiToneIconType,
} from './iconLoader'

export type { IconType, MultiToneIconType }
export { getAvailableIcons }

/** `IconEnum.PICKER` etc., for call-site ergonomics — values are the names themselves. */
export const IconEnum = Object.fromEntries(ICON_NAMES.map((name) => [name, name])) as {
  [K in IconType]: K
}

/** `tone` forces which direction `--icon-tone-target` mixes toward, overriding whatever the ambient theme says. */
export type IconTone = 'light' | 'dark'

const TONE_TARGET: Record<IconTone, string> = { light: 'white', dark: 'black' }

/**
 * Overrides for a multi-tone icon's secondary/tertiary fills. Left unset,
 * they default to a color-mix of `currentColor` toward `--icon-tone-target`
 * (see tokens.css) — light theme lightens, dark theme darkens — so a
 * multi-tone icon just works without this prop in the common case.
 */
export interface IconColors {
  secondary?: string
  tertiary?: string
  /** Force the default mix to lighten/darken regardless of the ambient theme (e.g. an icon on a deliberately dark surface in light theme). */
  tone?: IconTone
}

/**
 * Single-tone icons render with `fill="currentColor"` and take no `colors`
 * prop — set CSS `color` on an ancestor (e.g. `:hover { color: ... }`) to
 * theme or animate them. Multi-tone icons accept `colors` to override their
 * secondary/tertiary fills or force a tone; the type enforces this split at
 * each call site.
 */
type IconProps =
  | { type: Exclude<IconType, MultiToneIconType>; colors?: undefined }
  | { type: MultiToneIconType; colors?: IconColors }

/**
 * Icon component - renders SVG icons discovered from @assets/icons/ui.
 * @param type - The icon to render (see IconEnum)
 * @param colors - Multi-tone icons only; overrides secondary/tertiary fills and/or forces a tone
 */
const Icon: FC<IconProps> = ({ type, colors }): ReactElement => {
  const style = useMemo<CSSProperties>(() => {
    if (!colors) return { width: '100%', height: '100%' }
    const vars: Record<string, string> = {}
    if (colors.secondary) vars['--icon-secondary'] = colors.secondary
    if (colors.tertiary) vars['--icon-tertiary'] = colors.tertiary
    if (colors.tone) vars['--icon-tone-target'] = TONE_TARGET[colors.tone]
    return { width: '100%', height: '100%', ...vars } as CSSProperties
  }, [colors])

  const IconComponent = iconMap[type]

  if (!IconComponent) {
    console.warn(`Icon: Icon "${type}" not found. Available icons:`, getAvailableIcons())
    return null as unknown as ReactElement
  }

  return <IconComponent style={style} />
}

export default memo(Icon)
