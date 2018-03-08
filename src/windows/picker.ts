'use strict'

import {BrowserWindow, ipcMain} from 'electron';
import * as Robot from 'robotjs';

export default class PickerWindow {
  private dirname:string;
  private storage:Colorpicker.Storage;
  private window:BrowserWindow;

  constructor(dirname:string, storage:Colorpicker.Storage) {
    this.dirname = dirname;
    this.storage = storage;
  }

  public showWindow(forceInit:boolean = false):void {
    // @TODO Make it work on Linux :(
    if (process.platform !== 'darwin' && process.platform !== 'win32') {
      return;
    }

    if (this.window === null || this.window === undefined || forceInit) {
      this.createWindow();
    } else {
      this.window.show();
    }
  }

  public getWindow():BrowserWindow {
    return this.window;
  }

  private createWindow():void {
    this.window = new BrowserWindow({
      frame: false,
      autoHideMenuBar: true,
      width: 100,
      height: 100,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      focusable: true,
      hasShadow: false,
      icon: `${this.dirname}/assets/icon.png`
    });

    this.window.loadURL(`file://${this.dirname}/views/picker.html`)

    this.window.on('closed', () => {
      this.window = undefined;
    });

    this.initEvents();
  }

  private initEvents():void {
    let size, mouse, mouseEvent, color;

    ipcMain.on('pickerRequested', event => {
      let realtime = this.storage.get('realtime', 'picker')
  
      if (process.platform === 'darwin') mouseEvent = require('osx-mouse')()
      // if (process.platform === 'linux') mouseEvent = require('linux-mouse')()
      if (process.platform === 'win32') mouseEvent = require('win-mouse')()
      
      color = this.storage.get('lastColor')
  
      this.window.on('close', () => mouseEvent.destroy())
  
      mouseEvent.on('move', (x, y) => {
        let color = '#' + Robot.getPixelColor(parseInt(x), parseInt(y))
        this.window.setPosition(parseInt(x) - 50, parseInt(y) - 50)
        this.window.webContents.send('updatePicker', color)
        //if (realtime) colorpicker.getWindow().webContents.send('previewColor', color)
      })
  
      mouseEvent.on('left-up', (x, y) => {
        this.closePicker('#' + Robot.getPixelColor(parseInt(x), parseInt(y)))
      })
  
      let pos = Robot.getMousePos()
      this.window.setPosition(pos.x - 50, pos.y - 50)
      this.window.webContents.send('updatePicker', Robot.getPixelColor(pos.x, pos.y))
  
      ipcMain.on('closePicker', this.closePicker)
      mouseEvent.on('right-up', this.closePicker)
    })
  }

  private closePicker(newColor:string):void {
    if (this.window) {
      this.window.close()
      //colorpicker.getWindow().webContents.send('changeColor', newColor)
      //colorpicker.getWindow().focus()
      ipcMain.removeListener('closePicker', this.closePicker)
      ipcMain.removeListener('pickerRequested', event => {})
    }
  }

}