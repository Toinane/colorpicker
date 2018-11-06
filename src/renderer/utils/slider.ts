interface SliderParams {
  min?: number
  max: number
  defaultValue?: number
  name: string
}

export default class Slider {
  private name: string
  private input: HTMLInputElement
  private progress: HTMLProgressElement
  private minValue: number
  private maxValue: number

  constructor (params: SliderParams) {
    this.input = document.createElement('input')
    this.progress = document.createElement('progress')

    this.name = params.name
    this.minValue = params.min || 0
    this.maxValue = params.max

    this.input.type = 'range'
    this.input.min = params.min ? params.min.toString() : '0'
    this.input.max = params.max.toString()
    this.input.value = params.defaultValue ? params.defaultValue.toString() : '0'

    this.progress.max = params.max
    this.progress.value = params.defaultValue ? params.defaultValue : 0
  }

  public createSlider (): HTMLDivElement {
    const div: HTMLDivElement = document.createElement('div')

    div.id = this.name + 'Slider'
    div.append(this.input, this.progress)

    this.initEvents()

    return div
  }

  public getSlider (): HTMLProgressElement {

    return this.progress
  }

  public getValue (): number {

    return this.formatValue(parseInt(this.input.value, 10))
  }

  public updateSlider (value: number): void {
    value = this.formatValue(value)

    this.input.value = value.toString()
    this.progress.value = value
  }

  private formatValue (value: number): number {
    if (value < this.minValue) return 0
    if (value > this.maxValue) return this.maxValue

    return value
  }

  private initEvents (): void {
    document.addEventListener(this.name + 'Value', (event: any) => {
      this.updateSlider(event.detail)
    })

    this.input.oninput = () => {
      const value = this.getValue()

      document.dispatchEvent(new CustomEvent(this.name + 'Value', { detail: value }))
    }

    this.progress.onwheel = event => {
      const value = this.getValue()

      if (event.deltaY < 0) document.dispatchEvent(new CustomEvent(this.name + 'Value', { detail: value + 1 }))
      else if (event.deltaY > 0) document.dispatchEvent(new CustomEvent(this.name + 'Value', { detail: value - 1 }))
    }
  }
}
