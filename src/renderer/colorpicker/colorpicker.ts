import { clipboard } from 'electron'

import Color from './color'
import RGBSliders from './RGBSliders'

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

  private RGBSliders: RGBSliders

  constructor () {
    super()

    this.RGBSliders = new RGBSliders()

    this.initColorpicker()
  }

  public getRGBCSS (): string {
    return `rgb(${this.red}, ${this.green}, ${this.blue})`
  }

  public getRGBACSS (): string {
    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`
  }

  public copyHex (): void {
    clipboard.writeText(this.hex)
  }

  public copyRGB (): void {
    clipboard.writeText(this.getRGBCSS())
  }

  public copyRGBA (): void {
    clipboard.writeText(this.getRGBACSS())
  }

  private initColorpicker (): void {
    const sliders = document.querySelector('#sliders')
    if (sliders) sliders.appendChild(this.RGBSliders.getSliders())
  }
}

const colorpicker = new Colorpicker()
