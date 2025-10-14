import type { FC, CSSProperties } from 'react'

type IconModule = { default: FC<{ style: CSSProperties }> }

/**
 * Dynamically import all SVG icons from the assets/svg directory
 * This uses Vite's glob import feature to automatically discover new icons
 */
// @ts-expect-error - import.meta.glob is a Vite feature and TypeScript may not recognize it in all configs
const iconModules: Record<string, IconModule> = import.meta.glob('@assets/icons/ui/*.svg', {
  eager: true,
  query: '?react',
})

/**
 * Extract icon name from file path
 * Example: '@assets/icons/ui/picker.svg' -> 'PICKER'
 */
const extractIconName = (path: string): string => {
  const fileName = path.split('/').pop()?.replace('.svg', '') ?? ''
  return fileName.toUpperCase()
}

export const iconMap = Object.entries(iconModules).reduce(
  (acc, [path, module]) => {
    const iconName = extractIconName(path)
    acc[iconName] = module.default
    return acc
  },
  {} as Record<string, FC<{ style: CSSProperties }>>,
)

export const iconNames = Object.keys(iconMap).reduce(
  (acc, key) => {
    acc[key] = key
    return acc
  },
  {} as Record<string, string>,
)

/**
 * Get list of available icon names for debugging
 */
export const getAvailableIcons = (): string[] => Object.keys(iconMap)
