import { BrowserWindow } from 'electron'
import Window from './windowManager'
import is from '@electron/utils/is'

export default class SettingsWindow extends Window {
  constructor() {
    super('settings', {
      width: {
        type: 'number',
        default: 462,
      },
      height: {
        type: 'number',
        default: 550,
      },
    })

    this.props = {
      minWidth: 462,
      minHeight: 550,
      backgroundMaterial: 'mica',
      // TODO: test with different vibrancy types on macOS
      vibrancy: 'appearance-based',
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
}
