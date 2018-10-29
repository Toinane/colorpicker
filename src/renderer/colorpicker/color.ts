interface RGB {
  red: number // 0 - 255
  green: number // 0 - 255
  blue: number // 0 - 255
}

interface RGBA extends RGB {
  alpha: number // 0 - 1
}

interface HSL {
  hue: number // 0 - 360
  saturation: number // 0 - 100
  lightness: number // 0 - 100
}

interface CMYK {
  cyan: number
  magenta: number
  yellow: number
  key: number
}

type Hexadecimal = string

export default class Color {
  protected red: number
  protected green: number
  protected blue: number
  protected alpha: number

  protected hex: Hexadecimal
  protected rgb: RGB
  protected rgba: RGBA
  protected hsl: HSL
  protected cmyk: CMYK

  constructor () {
    this.red = 0
    this.green = 0
    this.blue = 0
    this.alpha = 1

    this.hex = '000000'
    this.rgb = {
      red: this.red,
      green: this.green,
      blue: this.blue
    }
    this.rgba = {
      alpha: this.alpha,
      ...this.rgb
    }

    this.hsl = this.getHSLfromRGB(this.rgb)
    this.cmyk = this.getCMYKfromRGB(this.rgb)
  }

  public updateColorFromRGB (rgb: RGB): Color {
    this.red = rgb.red
    this.green = rgb.green
    this.blue = rgb.blue
    this.rgb = rgb
    this.hex = this.getHEXfromRGB(this.rgb)
    this.hsl = this.getHSLfromRGB(this.rgb)
    this.cmyk = this.getCMYKfromRGB(this.rgb)

    return this
  }

  public updateColorFromHEX (hex: Hexadecimal): Color {
    const rgb: RGB = this.getRGBfromHEX(hex)

    return this.updateColorFromRGB(rgb)
  }

  public updateColorFromHSL (hsl: HSL): Color {
    const rgb: RGB = this.getRGBfromHSL(hsl)

    return this.updateColorFromRGB(rgb)
  }

  public getFormatedHSL (): HSL {

    return {
      hue: Math.round(this.hsl.hue),
      saturation: Math.round(this.hsl.saturation),
      lightness: Math.round(this.hsl.lightness)
    }
  }

  public getFormatedCMYK (): CMYK {

    return {
      cyan: Math.round(this.cmyk.cyan),
      magenta: Math.round(this.cmyk.magenta),
      yellow: Math.round(this.cmyk.yellow),
      key: Math.round(this.cmyk.key)
    }
  }

  public isDark (limit: number = 128): boolean {

    return (((this.red * 299 + this.green * 587 + this.blue * 114) / 1000) < limit)
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
    const binary = parseInt(hex, 16)

    return {
      red: binary >> 16,
      green: binary >> 8 & 255,
      blue: binary & 255
    }
  }

  protected getHSLfromRGB (rgb: RGB): HSL {
    let red = rgb.red / 255
    let green = rgb.green / 255
    let blue = rgb.blue / 255

    let min = Math.min(red, green, blue)
    let max = Math.max(red, green, blue)

    let hue = 0
    let saturation = 0
    let lightness = (max + min) / 2

    if (max !== min) saturation = lightness < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min)

    if (red === max && green === max && blue === max) hue = 0
    else if (red === max) hue = (green - blue) / (max - min)
    else if (green === max) hue = 2 + (blue - red) / (max - min)
    else if (blue === max) hue = 4 + (red - green) / (max - min)

    hue *= 60
    if (hue < 0) hue += 360

    return {
      hue: hue,
      saturation: saturation * 100,
      lightness: lightness * 100
    }
  }

  protected getRGBfromHSL (hsl: HSL): RGB {
    const hue = hsl.hue / 60
    const saturation = hsl.saturation / 100
    const lightness = hsl.lightness / 100
    let t2 = 0

    if (lightness <= 0.5) t2 = lightness * (saturation + 1)
    else t2 = lightness + saturation - (lightness * saturation)
    let t1 = lightness * 2 - t2

    const red = this.hueToRGB(t1, t2, hue + 2) * 255
    const green = this.hueToRGB(t1, t2, hue) * 255
    const blue = this.hueToRGB(t1, t2, hue - 2) * 255

    return {
      red: Math.round(red),
      green: Math.round(green),
      blue: Math.round(blue)
    }
  }

  protected getRGBfromCMYK (cmyk: CMYK): RGB {
    const cyan = cmyk.cyan / 100
    const magenta = cmyk.magenta / 100
    const yellow = cmyk.yellow / 100
    const key = cmyk.key / 100
    const red = 255 - ((Math.min(1, cyan * (1 - key) + key)) * 255)
    const green = 255 - ((Math.min(1, magenta * (1 - key) + key)) * 255)
    const blue = 255 - ((Math.min(1, yellow * (1 - key) + key)) * 255)

    return {
      red: Math.round(red),
      green: Math.round(green),
      blue: Math.round(blue)
    }
  }

  protected getCMYKfromRGB (rgb: RGB): CMYK {
    let cyan = 0
    let magenta = 0
    let yellow = 0

    let red = rgb.red / 255
    let green = rgb.green / 255
    let blue = rgb.blue / 255

    let key = 1 - Math.max(red, green, blue)

    if (key !== 1) {
      cyan = (1 - red - key) / (1 - key)
      magenta = (1 - green - key) / (1 - key)
      yellow = (1 - blue - key) / (1 - key)
    }

    return {
      cyan : cyan * 100,
      magenta : magenta * 100,
      yellow : yellow * 100,
      key : key * 100
    }
  }

  private hueToRGB (t1: number, t2: number, hue: number): number {
    if (hue < 0) hue += 6
    if (hue >= 6) hue -= 6

    if (hue < 1) return (t2 - t1) * hue + t1
    else if (hue < 3) return t2
    else if (hue < 4) return (t2 - t1) * (4 - hue) + t1
    else return t1
  }
}
