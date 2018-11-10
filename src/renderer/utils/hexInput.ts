export default class HexInput {
  private input: HTMLInputElement
  private value: string
  private tempValue: string

  constructor (defaultValue: string) {
    this.input = document.createElement('input')
    this.value = defaultValue
    this.tempValue = defaultValue

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

    return this.value
  }

  public updateInput (value: string): void {
    this.value = value
    this.tempValue = '#' + value
    this.input.value = '#' + value
  }

  private checkInputValue (value: string): boolean {
    const regex = /[0-9-a-f-A-F]/gm

    if (value.match(regex)) return true

    return false
  }

  private preventFakeInput (event: any): boolean {
    const value = this.input.value

    console.log(event)
    if (value.charAt(0) !== '#' && event.inputType !== 'insertFromPaste') {
      this.input.value = this.tempValue

      return false
    }

    if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {
      if (value.length <= 0) {
        this.input.value = '#'

        return false
      }
    }

    if (event.inputType === 'insertFromPaste') {
      console.log('not formated', this.input.value)
      const formatedValue = this.input.value.replace(this.tempValue, '')
      console.log('formated', formatedValue)
      if (!this.checkInputValue(formatedValue)) {
        this.input.value = this.tempValue

        return false
      }

      if (formatedValue.charAt(0) !== '#' && formatedValue.length === 6) {
        this.input.value = '#' + formatedValue
      }

      if (formatedValue.charAt(0) === '#' && formatedValue.length === 7) {
        this.input.value = formatedValue
      }
    }

    if (event.data && event.data.length) {
      if (!this.checkInputValue(event.data)) {
        this.input.value = this.tempValue

        return false
      }
      if (value.length > 7) {
        this.input.value = this.tempValue

        return false
      }
    }

    return true
  }

  private initEvents (): void {

    document.addEventListener('color', (event: any) => {
      this.updateInput(event.detail.hex)
    })

    this.input.oninput = (event) => {
      if (!this.preventFakeInput(event)) return
      const value = this.input.value.replace('#', '')
      this.tempValue = this.input.value

      console.log('before send', value)

      if (value.length !== 6) return

      console.log('send final value:', value)

      document.dispatchEvent(new CustomEvent('change', {
        detail: {
          name: 'Hex',
          value: value
        }
      }))
    }

    this.input.onwheel = e => {
      const value: string = this.getValue()

      if (e.deltaY < 0) document.dispatchEvent(new CustomEvent('hexValue', { detail: value }))
      else if (e.deltaY > 0) document.dispatchEvent(new CustomEvent('hexValue', { detail: value }))
    }
  }
}
