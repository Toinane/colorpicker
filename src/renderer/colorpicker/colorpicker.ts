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

    this.updateColorFromHex('#49ccac') // TO DELETE (DEVELOPMENT USE)

    this.RGBSliders = new RGBSliders(this.rgb)
    this.HSLSliders = new HSLSliders(this.hsl)
    this.HexInput = new HexInput(this.hex)

    this.initColorpicker()
  }

  public changeColor (): void {
    document.body.style.setProperty('--red', this.red.toString())
    document.body.style.setProperty('--green', this.green.toString())
    document.body.style.setProperty('--blue', this.blue.toString())
    document.body.style.setProperty('--hue', this.hsl.hue.toString())
    document.body.style.setProperty('--saturation', this.hsl.saturation + '%')
    document.body.style.setProperty('--lightness', this.hsl.lightness + '%')

    document.dispatchEvent(new CustomEvent('color', { detail: this.getColor() }))

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
    this.changeColor()
  }

  private updateDarkMode (): void {
    if (this.isDark() && !document.body.classList.contains('dark')) document.body.classList.add('dark')
    else if (!this.isDark() && document.body.classList.contains('dark')) document.body.classList.remove('dark')
  }

  private eventManager (): void {
    document.addEventListener('change', (event: any) => {
      if (!event.detail) return
      this['updateColorFrom' + event.detail.name](event.detail.value)
      this.changeColor()
    })
  }
}

const colorpicker = new Colorpicker()
