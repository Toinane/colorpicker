'use strict'

import { EventEmitter } from 'events';

const {TouchBar, NativeImage} = require('electron')
const {TouchBarColorPicker, TouchBarButton} = TouchBar;

export default class ColorpickerTouchBar {
  private dirname:string;
  private eventEmitter:EventEmitter;
  private touchBar:Electron.TouchBar;

  constructor(dirname:string, eventEmitter:EventEmitter) {
    this.dirname = dirname;
    this.eventEmitter = eventEmitter;
    this.init();
  }

  private init():void {
    const colorpicker = new TouchBarColorPicker({
      change: color => this.eventEmitter.emit('changeColor', color)
    });
    const eyedropper = new TouchBarButton({
      icon: NativeImage.createFromPath(`${this.dirname}/ressources/eyedropper-touchbar.png`),
      click: () => this.eventEmitter.emit('launchPicker')
    });
    const colorsbook = new TouchBarButton({
      icon: NativeImage.createFromPath(`${this.dirname}/ressources/colorsbook-touchbar.png`),
      click: () => this.eventEmitter.emit('launchColorsbook')
    });
    const settings = new TouchBarButton({
      icon: NativeImage.createFromPath(`${this.dirname}/ressources/settings-touchbar.png`),
      click: () => this.eventEmitter.emit('showPreferences')
    });
  
    this.touchBar = new TouchBar({
      items: [colorpicker, eyedropper, colorsbook, settings]
    })
  }

  public getTouchBar():Electron.TouchBar {
    return this.touchBar;
  }
}
