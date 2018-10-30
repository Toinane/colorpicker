import Slider from './slider'

interface RGB {
  red: number
  green: number
  blue: number
}

export default class RGBSliders {

  private redSlider: Slider
  private greenSlider: Slider
  private blueSlider: Slider

  constructor () {
    const colors = ['red', 'green', 'blue']

    const sliders = colors.map(color => new Slider({
      max: 255,
      name: color
    }))

    this.redSlider = sliders[0]
    this.greenSlider = sliders[1]
    this.blueSlider = sliders[2]
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

}
