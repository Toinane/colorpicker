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

  constructor (params: SliderParams) {
    this.input = document.createElement('input')
    this.progress = document.createElement('progress')

    this.name = params.name
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

    this.initEvent()

    return div
  }

  private initEvent (): void {
    this.input.oninput = () => {
      console.log(this.input.value)
    }
  }
}
