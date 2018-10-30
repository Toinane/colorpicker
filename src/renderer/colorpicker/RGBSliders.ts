
interface RGB {
  red: number // 0 - 255
  green: number // 0 - 255
  blue: number // 0 - 255
}

export default class RGBSliders {

  private redSliderHTML: string = `
    <div class="redSlider">
      <input type="range" min="0" max="255" value="0" />
      <progress min="0" max="255" value="0" />
    </div>
  `
  private greenSliderHTML: string = `
    <div class="greenSlider">
      <input type="range" min="0" max="255" value="0" />
      <progress min="0" max="255" value="0" />
    </div>
  `
  private blueSliderHTML: string = `
    <div class="blueSlider">
      <input type="range" min="0" max="255" value="0" />
      <progress min="0" max="255" value="0" />
    </div>
  `

  public getSliders (): HTMLDivElement {
    const div = document.createElement('div')
    div.innerHTML = this.redSliderHTML + this.greenSliderHTML + this.blueSliderHTML

    return div
  }
}
