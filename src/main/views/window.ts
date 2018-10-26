import { BrowserWindow } from 'electron'

export default class Window {
  private window!: BrowserWindow | undefined

  constructor () {
    this.window = new BrowserWindow({})
  }

  public createWindow (): BrowserWindow {
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
      icon: `${__dirname}/icon.png`
    } as any

    if (pos) {
      options.x = pos.x
      options.y = pos.y
    }

    this.window = new BrowserWindow(options)
    this.window.loadURL(`file://${__dirname}/views/colorpicker.html`)

    // if (this.util.touchBar) this.window.setTouchBar(this.util.touchBar)

    this.window.on('closed', () => {
      this.window = undefined
      let totalWindows = BrowserWindow.getAllWindows()
      for (let window of totalWindows) window.close()
    })

    // this.initWindowEvents()
    // this.initEvents()
    return this.window
  }

  public getWindow (): BrowserWindow {
    if (this.window typeof BrowserWindow) {
      return this.window
    }
  }

}
