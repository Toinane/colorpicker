
interface RGB {
  red: number // 0 - 255
  green: number // 0 - 255
  blue: number // 0 - 255
}

export default class RGBSliders {

  private sliderHTML: string = `
    <input type="range" min="0" max="255" value="0" />
    <progress min="0" max="255" value="0" />
  `

  private redSlider: HTMLDivElement
  private greenSlider: HTMLDivElement
  private blueSlider: HTMLDivElement

  constructor () {
    const colors = ['red', 'green', 'blue']

    const sliders = colors.map(color => {
      const div = document.createElement('div')
      div.id = color + 'Slider'
      div.innerHTML = this.sliderHTML

      return div
    })

    this.redSlider = sliders[0]
    this.greenSlider = sliders[1]
    this.blueSlider = sliders[2]

    this.initEvents()
  }

  public getSliders (): DocumentFragment {
    const fragment = document.createDocumentFragment()
    fragment.appendChild(this.redSlider)
    fragment.appendChild(this.greenSlider)
    fragment.appendChild(this.blueSlider)

    return fragment
  }

  public initEvents (): void {
    this.redSlider.addEventListener('click', e => {
      console.log(e)
    })

  }
}
