
interface RGB {
  red: number // 0 - 255
  green: number // 0 - 255
  blue: number // 0 - 255
}

export default class RGBSliders {

  private redSliderHTML: string = `
    <div id="redSlider">
      <input type="range" min="0" max="255" value="0" />
      <progress min="0" max="255" value="0" />
    </div>
  `
  private greenSliderHTML: string = `
    <div id="greenSlider">
      <input type="range" min="0" max="255" value="0" />
      <progress min="0" max="255" value="0" />
    </div>
  `
  private blueSliderHTML: string = `
    <div id="blueSlider">
      <input type="range" min="0" max="255" value="0" />
      <progress min="0" max="255" value="0" />
    </div>
  `
  private redSlider: HTMLDivElement | null = document.querySelector('#redSlider')

  public getSliders (): HTMLDivElement {
    const div = document.createElement('div')
    div.innerHTML = this.redSliderHTML + this.greenSliderHTML + this.blueSliderHTML

    return div
  }

  public initEvents (): void {
    if (!this.redSlider) return

  }
}
