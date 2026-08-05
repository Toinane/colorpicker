import type { FC, CSSProperties } from 'react'

type IconModule = { default: FC<{ style: CSSProperties }> }

/**
 * Canonical list of icon names — the single source of truth for `IconType`.
 * Every SVG in assets/icons/ui must have a matching UPPERCASE entry here.
 * Unlike deriving the type from `import.meta.glob`'s runtime output, this
 * makes `IconType` a real compile-time union: passing a name that isn't
 * listed here is a type error, not a silent `console.warn` at runtime.
 */
export const ICON_NAMES = [
  'ARROW',
  'CONTRAST',
  'COPY',
  'EXPAND',
  'LOCK',
  'OPACITY',
  'PICKER',
  'RESET',
  'SETTINGS',
  'SWATCH',
  'TEST',
  'TINT',
  'UNLOCK',
] as const

export type IconType = (typeof ICON_NAMES)[number]

/**
 * Icons whose SVG paints more than one fill color (a "primary" tone plus
 * secondary/tertiary accents). Everything else is single-tone and renders
 * with `fill="currentColor"`, so it just inherits the CSS `color` of
 * whatever wraps it — no `colors` prop needed.
 */
export const MULTI_TONE_ICONS = ['SWATCH', 'LOCK', 'UNLOCK'] as const

export type MultiToneIconType = (typeof MULTI_TONE_ICONS)[number]

const iconModules: Record<string, IconModule> = import.meta.glob('@assets/icons/ui/*.svg', {
  eager: true,
  query: '?react',
})

const extractIconName = (path: string): string => {
  const fileName = path.split('/').pop()?.replace('.svg', '') ?? ''
  return fileName.toUpperCase()
}

export const iconMap = Object.entries(iconModules).reduce(
  (acc, [path, module]) => {
    acc[extractIconName(path)] = module.default
    return acc
  },
  {} as Record<string, FC<{ style: CSSProperties }>>,
)

// Keep the manifest and the actual SVG files honest with each other during
// development — a mismatch here means `IconType` would be lying about what's
// actually renderable.
if (import.meta.env.DEV) {
  const iconNameSet: ReadonlySet<string> = new Set(ICON_NAMES)
  for (const name of ICON_NAMES) {
    if (!(name in iconMap)) {
      console.error(`[icons] "${name}" is listed in ICON_NAMES but has no matching SVG file.`)
    }
  }
  for (const name of Object.keys(iconMap)) {
    if (!iconNameSet.has(name)) {
      console.error(`[icons] "${name}.svg" exists but is missing from ICON_NAMES.`)
    }
  }
}

/** Get list of available icon names for debugging */
export const getAvailableIcons = (): string[] => Object.keys(iconMap)
