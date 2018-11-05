interface InputParams {
  min?: number
  max: number
  defaultValue?: number
  name: string
}

export default class Input {
  private name: string
  private input: HTMLInputElement
  private value: number
  private minValue: number
  private maxValue: number

  constructor (params: InputParams) {
    this.input = document.createElement('input')

    this.name = params.name
    this.value = params.defaultValue || 0
    this.minValue = params.min || 0
    this.maxValue = params.max

    this.input.type = 'number'
    this.input.id = this.name + 'Value'
    this.input.min = params.min ? params.min.toString() : '0'
    this.input.max = params.max.toString()
    this.input.value = params.defaultValue ? params.defaultValue.toString() : '0'
  }

  public createInput (): HTMLInputElement {
    this.initEvent()

    return this.input
  }

  public getValue (): number {

    return this.formatValue(parseInt(this.input.value, 10))
  }

  public updateInput (value: number): void {
    value = this.formatValue(value)

    this.value = value
    this.input.value = value.toString()
  }

  private formatValue (value: number): number {
    if (value < this.minValue) return 0
    if (value > this.maxValue) return this.maxValue
    if (Number.isNaN(value)) return this.value

    return value
  }

  private initEvent (): void {

    document.addEventListener(this.name + 'Value', (event: any) => {
      this.updateInput(event.detail)
    })

    this.input.oninput = () => {
      const value = this.getValue()

      document.dispatchEvent(new CustomEvent(this.name + 'Value', { detail: value }))
    }
  }
}
