import { BrowserWindow } from 'electron'

import Window from './windowManager'
import is from '../utils/is'

export default class ColorpickerWindow extends Window {
  constructor() {
    super('colorpicker', {
      width: {
        type: 'number',
        default: 400,
      },
      height: {
        type: 'number',
        default: 150,
      },
    })

    this.props = {
      minWidth: 400,
      minHeight: 150,
      // TODO: play with the accentColor on Windows.
      // accentColor: '#1E90FF',
    }
  }

  show(): boolean {
    super.show()

    if (!(this.window instanceof BrowserWindow)) return false
    if (is.dev) this.window.setAlwaysOnTop(true, 'normal')
    if (is.dev) this.window.webContents.openDevTools()

    return true
  }

  registerEvents() {
    super.registerEvents()

    // ipcMain.handle('colorpicker:store:get', (el) => this.store.get(el))

    // ipcMain.handle(
    //   'colorpicker:store:update',
    //   (_, updatedStore: Partial) => {
    //     console.log(this.window?.getBounds())
    //     console.log(updatedStore)
    //     this.store.set(updatedStore)
    //   },
    // )
  }
}
