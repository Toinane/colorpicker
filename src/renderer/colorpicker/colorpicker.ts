import Color from './color'

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

type Hexadecimal = string

export default class Colorpicker extends Color {

  constructor () {
    super()

    this.testColor('111')
    this.testColor('a2c843')
    this.testColor('123456')
    this.testColor('8e2fff')
  }

  public getRGBCSS (): string {
    return `rgb(${this.red}, ${this.green}, ${this.blue})`
  }

  public getRGBACSS (): string {
    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`
  }

  protected testColor (hex: Hexadecimal): void {
    console.log('hex', hex)
    const rgb = this.getRGBfromHEX(hex)
    console.log('rgb', rgb.red, rgb.green, rgb.blue)
    const hsl = this.getHSLfromRGB(rgb)
    console.log('hsl', hsl.hue, hsl.saturation, hsl.lightness)
    const rgb2 = this.getRGBfromHSL(hsl)
    console.log('rgb', rgb2.red, rgb2.green, rgb2.blue)
    const cmyk = this.getCMYKfromRGB(rgb2)
    console.log('cmyk', cmyk.cyan, cmyk.magenta, cmyk.yellow, cmyk.key)
    const rgb3 = this.getRGBfromCMYK(cmyk)
    console.log('rgb', rgb3.red, rgb3.green, rgb3.blue)
    const hex2 = this.getHEXfromRGB(rgb2)
    console.log('hex', hex2)
    console.log('###########')
  }
}

const colorpicker = new Colorpicker()
