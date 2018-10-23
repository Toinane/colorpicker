import { BrowserWindow } from 'electron'

import Storage from '../storage'

export default class ColorpickerView {
  private window!: BrowserWindow | undefined
  private dirname: string
  private storage: Storage

  constructor (dirname: string, storage: Storage) {
    this.dirname = dirname
    this.storage = storage
  }

  public createWindow (): void {
    const pos = this.storage.get('pos')
    const size = this.storage.get('size')

    let options = {
      frame: false,
      autoHideMenuBar: true,
      width: size.width,
      height: size.height,
      minWidth: 440,
      minHeight: 150,
      transparent: true,
      icon: `${this.dirname}/assets/icon.png`
    } as any

    if (pos) {
      options.x = pos.x
      options.y = pos.y
    }

    this.window = new BrowserWindow(options)
    this.window.loadURL(`file://${this.dirname}/views/colorpicker.html`)

    // if (this.util.touchBar) this.window.setTouchBar(this.util.touchBar)

    this.window.on('closed', () => {
      this.window = undefined
      let totalWindows = BrowserWindow.getAllWindows()
      for (let window of totalWindows) window.close()
    })

    // this.initWindowEvents()
    // this.initEvents()
  }
}
