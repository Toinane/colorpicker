import { clipboard } from 'electron'

import Color from './color'
import RGBSliders from '../utils/RGBSliders'
import HSLSliders from '../utils/HSLSliders'

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
  private HSLSliders: HSLSliders

  constructor () {
    super()

    this.updateColorFromHEX('#a5decb') // TO DELETE (DEVELOPMENT USE)

    this.RGBSliders = new RGBSliders(this.rgb)
    this.HSLSliders = new HSLSliders(this.hsl)

    this.initColorpicker()
  }

  public updateColor (): void {
    document.body.style.setProperty('--red', this.red.toString())
    document.body.style.setProperty('--green', this.green.toString())
    document.body.style.setProperty('--blue', this.blue.toString())

    this.updateDarkMode()
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

    this.HSLSliders.init()

    this.eventManager()
    this.updateColor()
  }

  private updateDarkMode (): void {
    if (this.isDark() && !document.body.classList.contains('dark')) document.body.classList.add('dark')
    else if (!this.isDark() && document.body.classList.contains('dark')) document.body.classList.remove('dark')
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

    document.addEventListener('hueValue', (event: any) => {
      this.updateColorFromHSL({
        hue: event.detail,
        saturation: this.hsl.saturation,
        lightness: this.hsl.lightness
      })

      this.updateColor()
    })

    document.addEventListener('saturationValue', (event: any) => {
      this.updateColorFromHSL({
        hue: this.hsl.hue,
        saturation: event.detail,
        lightness: this.hsl.lightness
      })

      this.updateColor()
    })

    document.addEventListener('lightnessValue', (event: any) => {
      this.updateColorFromHSL({
        hue: this.hsl.hue,
        saturation: this.hsl.saturation,
        lightness: event.detail
      })

      this.updateColor()
    })
  }
}

const colorpicker = new Colorpicker()
