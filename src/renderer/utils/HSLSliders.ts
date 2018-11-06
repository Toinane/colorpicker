import Slider from './slider'
import Input from './input'

interface HSL {
  hue: number
  saturation: number
  lightness: number
}

export default class HSLSliders {

  private hueSlider: Slider
  private hueInput: Input
  private saturationSlider: Slider
  private saturationInput: Input
  private lightnessSlider: Slider
  private lightnessInput: Input

  constructor (hsl: HSL) {
    const colors: Array<string> = Object.keys(hsl)
    const maxValues: Object = {
      hue: 360,
      saturation: 100,
      lightness: 100
    }

    const sliders: Array<Slider> = colors.map(color => new Slider({
      max: maxValues[color],
      name: color,
      defaultValue: hsl[color]
    }))

    const inputs: Array<Input> = colors.map(color => new Input({
      max: maxValues[color],
      name: color,
      defaultValue: hsl[color]
    }))

    this.hueSlider = sliders[0]
    this.hueInput = inputs[0]
    this.saturationSlider = sliders[1]
    this.saturationInput = inputs[1]
    this.lightnessSlider = sliders[2]
    this.lightnessInput = inputs[2]
  }

  public init (): void {
    const sliders: HTMLDivElement | null = document.querySelector('#sliders')
    const inputs: HTMLDivElement | null = document.querySelector('#inputs')

    if (sliders) sliders.appendChild(this.getSliders())
    if (inputs) inputs.appendChild(this.getInputs())
  }

  private getSliders (): DocumentFragment {
    const fragment: DocumentFragment = document.createDocumentFragment()
    fragment.append(
      this.hueSlider.createSlider(),
      this.saturationSlider.createSlider(),
      this.lightnessSlider.createSlider()
    )

    return fragment
  }

  private getInputs (): DocumentFragment {
    const fragment: DocumentFragment = document.createDocumentFragment()
    fragment.append(
      this.hueInput.createInput(),
      this.saturationInput.createInput(),
      this.lightnessInput.createInput()
    )

    return fragment
  }
}
