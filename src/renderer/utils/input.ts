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
    this.initEvents()

    return this.input
  }

  public getInput (): HTMLInputElement {

    return this.input
  }

  public getValue (): number {
    const value = this.input.value || '0'

    return this.formatValue(parseInt(value, 10))
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

  private initEvents (): void {

    document.addEventListener('color', (event: any) => {
      this.updateInput(event.detail[this.name])
    })

    this.input.oninput = () => {
      const value = this.getValue()
      const name = this.name.charAt(0).toUpperCase() + this.name.slice(1)

      document.dispatchEvent(new CustomEvent('change', {
        detail: {
          name: name,
          value: value
        }
      }))
    }

    this.input.onwheel = event => {
      const value = this.getValue()
      const name = this.name.charAt(0).toUpperCase() + this.name.slice(1)

      if (event.deltaY < 0) {
        document.dispatchEvent(new CustomEvent('change', {
          detail: {
            name: name,
            value: value + 1
          }
        }))
      } else if (event.deltaY > 0) {
        document.dispatchEvent(new CustomEvent('change', {
          detail: {
            name: name,
            value: value - 1
          }
        }))
      }
    }
  }
}
