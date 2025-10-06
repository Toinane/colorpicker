export type RGB = {
  red: number
  green: number
  blue: number
}

export type HSL = {
  hue: number
  saturation: number
  lightness: number
}

export type HSV = {
  hue: number
  saturation: number
  value: number
}

export type CMYK = {
  cyan: number
  magenta: number
  yellow: number
  black: number
}

export type HEX = `#${string}`

export type Color = RGB & HSL & HSV & CMYK & HEX
