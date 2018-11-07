export default class Input {
  private input: HTMLInputElement
  private value: string

  constructor (defaultValue: string) {
    this.input = document.createElement('input')
    this.value = defaultValue

    this.input.type = 'text'
    this.input.id = 'hexValue'
    this.input.value = defaultValue || '#000000'
  }

  public createInput (): HTMLInputElement {
    this.initEvents()

    return this.input
  }

  public getInput (): HTMLInputElement {

    return this.input
  }

  public getValue (): string {
    const value = this.input.value || '#000000'

    return this.formatValue(value)
  }

  public updateInput (value: string): void {
    value = this.formatValue(value)

    this.value = value
    this.input.value = value
  }

  private formatValue (value: string): string {
    // TODO format hex

    return value
  }

  private initEvents (): void {

    document.addEventListener('hexValue', (event: any) => {
      this.updateInput(event.detail)
    })

    this.input.oninput = () => {
      const value = this.getValue()

      document.dispatchEvent(new CustomEvent('hexValue', { detail: value }))
    }

    this.input.onwheel = e => {
      const value: string = this.getValue()

      if (e.deltaY < 0) document.dispatchEvent(new CustomEvent('hexValue', { detail: value }))
      else if (e.deltaY > 0) document.dispatchEvent(new CustomEvent('hexValue', { detail: value }))
    }
  }
}
