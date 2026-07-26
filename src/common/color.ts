import Color from 'colorjs.io'
import type { ColorFormat } from '@interfaces/settings'

export const isValidHex = (hex: string): boolean => {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex)
}

export interface RGBColor {
  r: number
  g: number
  b: number
}

export const rgbToColor = ({ r, g, b }: RGBColor): Color =>
  new Color('srgb', [r / 255, g / 255, b / 255])

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const toByte = (channel: number | null): number => Math.round(clamp(channel ?? 0, 0, 1) * 255)

const toHexByte = (byte: number): string => byte.toString(16).padStart(2, '0')

// Round alpha to 2 decimals (e.g. 0.5, 0.33) rather than long float noise.
const roundAlpha = (alpha: number): number => Math.round(alpha * 100) / 100

/**
 * Serialize a color as hex, e.g. `#FF0000` (or `FF0000` without the `#`,
 * `#FF000080` with alpha). Computed manually from sRGB channels rather than
 * colorjs.io's own `toString({ format: 'hex' })`, which collapses to
 * shorthand (`#f00`) when possible — not what a "copy" action should produce.
 */
export const toHex = (color: Color, hexPrefix: boolean = true): string => {
  const [r, g, b] = color.to('srgb').coords.map(toByte)
  let hex = `${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`

  if (color.alpha < 1) {
    hex += toHexByte(toByte(color.alpha))
  }

  hex = hex.toUpperCase()
  return hexPrefix ? `#${hex}` : hex
}

/** Serialize a color as `rgb(r, g, b)`, or `rgba(r, g, b, a)` when alpha < 1. */
export const toRgb = (color: Color): string => {
  const [r, g, b] = color.to('srgb').coords.map(toByte)
  const alpha = roundAlpha(color.alpha)
  return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`
}

/** Serialize a color as `hsl(h, s%, l%)`, or `hsla(...)` when alpha < 1. */
export const toHsl = (color: Color): string => {
  const [h, s, l] = color.to('hsl').coords
  const hh = Math.round(h ?? 0)
  const ss = Math.round(s ?? 0)
  const ll = Math.round(l ?? 0)
  const alpha = roundAlpha(color.alpha)
  return alpha < 1 ? `hsla(${hh}, ${ss}%, ${ll}%, ${alpha})` : `hsl(${hh}, ${ss}%, ${ll}%)`
}

/**
 * Serialize a color as `hsv(h, s%, v%)`. No alpha variant: HSV has no
 * standard CSS syntax at all (unlike rgb/hsl), so there's no "hsva" either.
 */
export const toHsv = (color: Color): string => {
  const [h, s, v] = color.to('hsv').coords
  const hh = Math.round(h ?? 0)
  const ss = Math.round(s ?? 0)
  const vv = Math.round(v ?? 0)
  return `hsv(${hh}, ${ss}%, ${vv}%)`
}

/** Serialize a color to the given format — the single entry point the copy system uses. */
export const serializeColor = (
  color: Color,
  format: ColorFormat,
  options: { hexPrefix?: boolean } = {},
): string => {
  switch (format) {
    case 'hex':
      return toHex(color, options.hexPrefix ?? true)
    case 'rgb':
      return toRgb(color)
    case 'hsl':
      return toHsl(color)
    case 'hsv':
      return toHsv(color)
  }
}
