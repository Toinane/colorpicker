import { CMYK, HEX, HSL, HSV, RGB } from '@/types/colors'

export const isValidHex = (hex: string): hex is HEX => {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)
}

export const getHexFromRGB = (color: RGB): HEX => {
  const r = color.red.toString(16).padStart(2, '0')
  const g = color.green.toString(16).padStart(2, '0')
  const b = color.blue.toString(16).padStart(2, '0')
  return `#${r}${g}${b}` as HEX
}

export const getHexFromHSL = (color: HSL): HEX => {
  const { hue, saturation, lightness } = color
  const a = (saturation * Math.min(lightness, 1 - lightness)) / 100
  const f = (n: number) => {
    const k = (n + hue / 30) % 12
    const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0') // convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}` as HEX
}

export const getHexFromHSV = (color: HSV): HEX => {
  const { hue, saturation, value } = color
  const c = (value / 100) * (saturation / 100)
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = value / 100 - c
  let r = 0,
    g = 0,
    b = 0
  if (hue < 60) {
    r = c
    g = x
  } else if (hue < 120) {
    r = x
    g = c
  } else if (hue < 180) {
    g = c
    b = x
  } else if (hue < 240) {
    g = x
    b = c
  } else if (hue < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}` as HEX
}

export const getHexFromCMYK = (color: CMYK): HEX => {
  const { cyan, magenta, yellow, black } = color
  const r = Math.round(255 * (1 - cyan / 100) * (1 - black / 100))
  const g = Math.round(255 * (1 - magenta / 100) * (1 - black / 100))
  const b = Math.round(255 * (1 - yellow / 100) * (1 - black / 100))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` as HEX
}

export const getRGBFromHex = (hex: HEX): RGB => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { red: r, green: g, blue: b }
}
