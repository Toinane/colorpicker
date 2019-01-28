import { ipcMain, BrowserWindowConstructorOptions } from 'electron'

import Window from './window'
import Storage from '../storage'

export default class ColorsbookView extends Window {

  protected windowParams: BrowserWindowConstructorOptions = {
    frame: false,
    autoHideMenuBar: true,
    width: 365,
    height: 400,
    minHeight: 285,
    minWidth: 360,
    icon: `${__dirname}/logo.png`
  }

  constructor () {
    super('colorsbook')
  }
}
