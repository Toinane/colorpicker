import { ipcMain, BrowserWindowConstructorOptions } from 'electron'

import Window from './window'
import Storage from '../storage'

export default class PickerView extends Window {

  protected windowParams: BrowserWindowConstructorOptions = {
    frame: false,
    autoHideMenuBar: true,
    width: 100,
    height: 100,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    focusable: true,
    hasShadow: false,
    icon: `${__dirname}/logo.png`
  }

  constructor () {
    super('picker')
  }
}
