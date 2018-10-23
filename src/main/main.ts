require('source-map-support').install()

import { BrowserWindow, app } from 'electron'

import Storage from './storage'

import ColorpickerView from './views/colorpickerView'

export default class ColorpickerApp {

  private static dirname: string
  private static storage: Storage
  private static colorpickerView: ColorpickerView

  public static init () {
    this.dirname = __dirname
    this.storage = new Storage()

    console.log(this.storage)

    this.colorpickerView = new ColorpickerView(this.dirname, this.storage)
  }

}

ColorpickerApp.init()
