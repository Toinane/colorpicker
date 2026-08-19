import { describe, it, expect } from 'vitest'
import Color from 'colorjs.io'
import {
  toHex,
  toRgb,
  toHsl,
  toHsv,
  serializeColor,
  isValidHex,
  hexToColorValue,
  colorValueToColor,
} from './color'

const red = new Color('#FF0000')
const white = new Color('#FFFFFF')
const teal = new Color('#008080')
const semiTransparentRed = new Color('srgb', [1, 0, 0], 0.5)

describe('toHex', () => {
  it('serializes with a leading # by default', () => {
    expect(toHex(red)).toBe('#FF0000')
  })

  it('omits the # when hexPrefix is false', () => {
    expect(toHex(red, false)).toBe('FF0000')
  })

  it('never collapses to shorthand', () => {
    expect(toHex(white)).toBe('#FFFFFF')
  })

  it('appends the alpha byte when alpha < 1', () => {
    expect(toHex(semiTransparentRed)).toBe('#FF000080')
  })
})

describe('toRgb', () => {
  it('serializes an opaque color as rgb()', () => {
    expect(toRgb(red)).toBe('rgb(255, 0, 0)')
    expect(toRgb(teal)).toBe('rgb(0, 128, 128)')
  })

  it('serializes a translucent color as rgba()', () => {
    expect(toRgb(semiTransparentRed)).toBe('rgba(255, 0, 0, 0.5)')
  })
})

describe('toHsl', () => {
  it('serializes an opaque color as hsl()', () => {
    expect(toHsl(red)).toBe('hsl(0, 100%, 50%)')
    expect(toHsl(teal)).toBe('hsl(180, 100%, 25%)')
  })

  it('handles an achromatic color (null hue) as 0', () => {
    expect(toHsl(white)).toBe('hsl(0, 0%, 100%)')
  })

  it('serializes a translucent color as hsla()', () => {
    expect(toHsl(semiTransparentRed)).toBe('hsla(0, 100%, 50%, 0.5)')
  })
})

describe('toHsv', () => {
  it('serializes a color as hsv()', () => {
    expect(toHsv(red)).toBe('hsv(0, 100%, 100%)')
    expect(toHsv(teal)).toBe('hsv(180, 100%, 50%)')
  })

  it('handles an achromatic color (null hue) as 0', () => {
    expect(toHsv(white)).toBe('hsv(0, 0%, 100%)')
  })
})

describe('isValidHex', () => {
  it('accepts 3, 6, and 8 digit hex', () => {
    expect(isValidHex('#F00')).toBe(true)
    expect(isValidHex('#FF0000')).toBe(true)
    expect(isValidHex('#FF000080')).toBe(true)
  })

  it('rejects invalid lengths and missing #', () => {
    expect(isValidHex('FF0000')).toBe(false)
    expect(isValidHex('#FF00')).toBe(false)
    expect(isValidHex('#FF00000')).toBe(false)
    expect(isValidHex('#GGGGGG')).toBe(false)
  })
})

describe('hexToColorValue / colorValueToColor', () => {
  it('parses an opaque hex color into a structured srgb value', () => {
    expect(hexToColorValue('#FF0000')).toEqual({ space: 'srgb', coords: [1, 0, 0], alpha: 1 })
  })

  it('preserves alpha from an 8-digit hex color', () => {
    expect(hexToColorValue('#FF000080')).toEqual({
      space: 'srgb',
      coords: [1, 0, 0],
      alpha: 128 / 255,
    })
  })

  it('round-trips hex -> value -> hex', () => {
    expect(toHex(colorValueToColor(hexToColorValue('#ABCDEF')))).toBe('#ABCDEF')
  })
})

describe('serializeColor', () => {
  it('dispatches to the right serializer per format', () => {
    expect(serializeColor(red, 'hex')).toBe('#FF0000')
    expect(serializeColor(red, 'rgb')).toBe('rgb(255, 0, 0)')
    expect(serializeColor(red, 'hsl')).toBe('hsl(0, 100%, 50%)')
    expect(serializeColor(red, 'hsv')).toBe('hsv(0, 100%, 100%)')
  })

  it('respects the hexPrefix option', () => {
    expect(serializeColor(red, 'hex', { hexPrefix: false })).toBe('FF0000')
  })
})
