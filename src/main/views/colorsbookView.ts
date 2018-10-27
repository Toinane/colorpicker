import { ipcMain } from 'electron'

import Window from './window'
import Storage from '../storage'

export default class ColorsbookView extends Window {

  protected windowParams: Object = {
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
