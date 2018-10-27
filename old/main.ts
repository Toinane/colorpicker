'use strict'

import * as eventEmitter from 'events'
import { app, Tray, Menu, NativeImage } from 'electron'

import Storage from './storage'
import ColorpickerTouchBar from './touchbar'
import Window from './windows'

export abstract class ColorpickerApp {
  private dirname: string
  private eventEmitter: eventEmitter.EventEmitter
  private storage: Storage
  private colorpickerTouchBar: ColorpickerTouchBar
  private window: Window

  private tray: Tray

  constructor () {
    this.dirname = __dirname
    this.eventEmitter = new eventEmitter()

    this.storage = new Storage()
    this.colorpickerTouchBar = new ColorpickerTouchBar(this.dirname, this.eventEmitter)
    this.window = new Window(this.dirname, this.storage, {
      touchBar: this.colorpickerTouchBar,
      eventEmitter: this.eventEmitter
    })
  }
}
