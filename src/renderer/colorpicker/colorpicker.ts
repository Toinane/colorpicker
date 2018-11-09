import { clipboard } from 'electron'

import Color from './color'
import RGBSliders from '../utils/RGBSliders'
import HSLSliders from '../utils/HSLSliders'
import HexInput from '../utils/hexInput'

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
  private HexInput: HexInput

  constructor () {
    super()

    this.updateColorFromHEX('#49ccac') // TO DELETE (DEVELOPMENT USE)

    this.RGBSliders = new RGBSliders(this.rgb)
    this.HSLSliders = new HSLSliders(this.hsl)
    this.HexInput = new HexInput(this.hex)

    this.initColorpicker()
  }

  public updateColor (): void {
    document.body.style.setProperty('--red', this.red.toString())
    document.body.style.setProperty('--green', this.green.toString())
    document.body.style.setProperty('--blue', this.blue.toString())
    document.body.style.setProperty('--hue', this.hsl.hue.toString())
    document.body.style.setProperty('--saturation', this.hsl.saturation + '%')
    document.body.style.setProperty('--lightness', this.hsl.lightness + '%')

    this.HexInput.updateInput(this.hex)
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
    const hexBox: HTMLDivElement | null = document.querySelector('#hexBox')

    this.RGBSliders.init()
    if (hexBox) hexBox.appendChild(this.HexInput.createInput())

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
        red: parseInt(event.detail, 10),
        green: this.green,
        blue: this.blue
      })

      this.updateColor()
    })

    document.addEventListener('greenValue', (event: any) => {
      this.updateColorFromRGB({
        red: this.red,
        green: parseInt(event.detail, 10),
        blue: this.blue
      })

      this.updateColor()
    })

    document.addEventListener('blueValue', (event: any) => {
      this.updateColorFromRGB({
        red: this.red,
        green: this.green,
        blue: parseInt(event.detail, 10)
      })

      this.updateColor()
    })

    document.addEventListener('hueValue', (event: any) => {
      this.updateColorFromHSL({
        hue: parseInt(event.detail, 10),
        saturation: this.hsl.saturation,
        lightness: this.hsl.lightness
      })

      this.updateColor()
    })

    document.addEventListener('saturationValue', (event: any) => {
      this.updateColorFromHSL({
        hue: this.hsl.hue,
        saturation: parseInt(event.detail, 10),
        lightness: this.hsl.lightness
      })

      this.updateColor()
    })

    document.addEventListener('lightnessValue', (event: any) => {
      this.updateColorFromHSL({
        hue: this.hsl.hue,
        saturation: this.hsl.saturation,
        lightness: parseInt(event.detail, 10)
      })

      this.updateColor()
    })

    document.addEventListener('hexValue', (event: any) => {
      this.updateColorFromHEX(event.detail)

      this.updateColor()
    })
  }
}

const colorpicker = new Colorpicker()
