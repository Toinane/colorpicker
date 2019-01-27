import { ipcMain, BrowserWindowConstructorOptions } from 'electron'

import Window from './window'
import Storage from '../storage'

export default class SettingsView extends Window {

  protected windowParams: BrowserWindowConstructorOptions = {
    width: 700,
    height: 500,
    minWidth: 460,
    minHeight: 340,
    fullscreenable: false,
    icon: `${__dirname}/logo.png`
  }

  constructor () {
    super('settings')
  }
}
