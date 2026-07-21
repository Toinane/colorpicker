import Color from 'colorjs.io'

export const isValidHex = (hex: string): boolean => {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)
}

export interface RGBColor {
  r: number
  g: number
  b: number
}

export const rgbToColor = ({ r, g, b }: RGBColor): Color =>
  new Color('srgb', [r / 255, g / 255, b / 255])
