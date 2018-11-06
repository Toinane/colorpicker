import Slider from './slider'
import Input from './input'

interface RGB {
  red: number
  green: number
  blue: number
}

export default class RGBSliders {

  private redSlider: Slider
  private redInput: Input
  private greenSlider: Slider
  private greenInput: Input
  private blueSlider: Slider
  private blueInput: Input

  constructor (rgb: RGB) {
    const colors = Object.keys(rgb)
    const maxValue = 255

    const sliders = colors.map(color => new Slider({
      max: maxValue,
      name: color,
      defaultValue: rgb[color]
    }))

    const inputs = colors.map(color => new Input({
      max: maxValue,
      name: color,
      defaultValue: rgb[color]
    }))

    this.redSlider = sliders[0]
    this.redInput = inputs[0]
    this.greenSlider = sliders[1]
    this.greenInput = inputs[1]
    this.blueSlider = sliders[2]
    this.blueInput = inputs[2]
  }

  public init (): void {
    const sliders = document.querySelector('#sliders')
    const inputs = document.querySelector('#inputs')

    if (sliders) sliders.appendChild(this.getSliders())
    if (inputs) inputs.appendChild(this.getInputs())
  }

  private getSliders (): DocumentFragment {
    const fragment = document.createDocumentFragment()
    fragment.append(
      this.redSlider.createSlider(),
      this.greenSlider.createSlider(),
      this.blueSlider.createSlider()
    )

    return fragment
  }

  private getInputs (): DocumentFragment {
    const fragment = document.createDocumentFragment()
    fragment.append(
      this.redInput.createInput(),
      this.greenInput.createInput(),
      this.blueInput.createInput()
    )

    return fragment
  }
}
