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

  constructor () {
    const colors = ['red', 'green', 'blue']
    const maxValue = 255

    const sliders = colors.map(color => new Slider({
      max: maxValue,
      name: color
    }))

    const inputs = colors.map(color => new Input({
      max: maxValue,
      name: color
    }))

    this.redSlider = sliders[0]
    this.redInput = inputs[0]
    this.greenSlider = sliders[1]
    this.greenInput = inputs[1]
    this.blueSlider = sliders[2]
    this.blueInput = inputs[2]
  }

  public getSliders (): DocumentFragment {
    const fragment = document.createDocumentFragment()
    fragment.append(
      this.redSlider.createSlider(),
      this.greenSlider.createSlider(),
      this.blueSlider.createSlider()
    )

    return fragment
  }

  public getInputs (): DocumentFragment {
    const fragment = document.createDocumentFragment()
    fragment.append(
      this.redInput.createInput(),
      this.greenInput.createInput(),
      this.blueInput.createInput()
    )

    return fragment
  }
}
