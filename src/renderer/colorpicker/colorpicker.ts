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
  private body: HTMLBodyElement | null

  constructor () {
    super()

    this.body = document.querySelector('body')
    this.RGBSliders = new RGBSliders()

    this.initColorpicker()
  }

  public updateColor (): void {
    if (this.body) this.body.style.background = this.getRGBACSS()
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
    const inputs = document.querySelector('#inputs')

    if (sliders) sliders.appendChild(this.RGBSliders.getSliders())
    if (inputs) inputs.appendChild(this.RGBSliders.getInputs())

    this.eventManager()
  }

  private eventManager (): void {
    document.addEventListener('redValue', (event: any) => {
      this.updateColorFromRGB({
        red: event.detail,
        green: this.green,
        blue: this.blue
      })

      this.updateColor()
    })

    document.addEventListener('greenValue', (event: any) => {
      this.updateColorFromRGB({
        red: this.red,
        green: event.detail,
        blue: this.blue
      })

      this.updateColor()
    })

    document.addEventListener('blueValue', (event: any) => {
      this.updateColorFromRGB({
        red: this.red,
        green: this.green,
        blue: event.detail
      })

      this.updateColor()
    })
  }
}

const colorpicker = new Colorpicker()
