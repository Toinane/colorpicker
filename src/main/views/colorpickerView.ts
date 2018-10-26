import { BrowserWindow } from 'electron'

import Storage from '../storage'

export default class ColorpickerView extends Window {
  private dirname: string
  private storage: Storage

  constructor (dirname: string, storage: Storage) {
    this.dirname = dirname
    this.storage = storage
  }

  
}
