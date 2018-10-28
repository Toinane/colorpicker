interface RGB {
  red: Number // 0 - 255
  green: Number // 0 - 255
  blue: Number // 0 - 255
}

interface HSL {
  hue: Number // 0 - 360
  saturation: Number // 0 - 100
  lightness: Number // 0 - 100
}

type Hexadecimal = string

export default class Color {
  protected red: Number
  protected green: Number
  protected blue: Number
  protected alpha: number

  protected hex: Hexadecimal
  protected rgb: RGB
  // protected hsl: HSL

  constructor () {
    this.red = 0
    this.green = 0
    this.blue = 0
    this.alpha = 0

    this.hex = '000000'
    this.rgb = {
      red: this.red,
      green: this.green,
      blue: this.blue
    }
    // this.hsl = this.getHSLfromRGB(this.rgb)
  }

  protected getHEXfromRGB (rgb: RGB): Hexadecimal {
    const hex = [
      Number(rgb.red).toString(16),
      Number(rgb.green).toString(16),
      Number(rgb.blue).toString(16)
    ]

    return hex
      .map(value => value.length === 1 ? '0' + value : value)
      .join('')
  }

  protected getRGBfromHEX (hex: Hexadecimal): RGB {
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    let num = parseInt(hex, 16)

    return {
      red: num >> 16,
      green: num >> 8 & 255,
      blue: num & 255
    }
  }

}
