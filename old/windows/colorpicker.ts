'use strict'

import {BrowserWindow, ipcMain, app} from 'electron';

export default class ColorpickerWindow {

  private dirname:string;
  private storage:Colorpicker.Storage;
  private util = <any>{};
  private window:BrowserWindow;

  constructor(dirname:string, storage:Colorpicker.Storage, util:object) {
    this.dirname = dirname;
    this.storage = storage;
    this.util = util;
  }

  public showWindow(forceInit:boolean = false):void {
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
    const pos = this.storage.get('pos');
    const size = this.storage.get('size');

    let options = <any>{
      frame: false,
      autoHideMenuBar: true,
      width: size.width,
      height: size.height,
      minWidth: 440,
      minHeight: 150,
      transparent: true,
      icon: `${this.dirname}/assets/icon.png`
    }
    if (pos) { options.x = pos.x; options.y = pos.y }

    this.window = new BrowserWindow(options)
    this.window.loadURL(`file://${this.dirname}/views/colorpicker.html`)

    if (this.util.touchBar) this.window.setTouchBar(this.util.touchBar)

    this.window.on('closed', () => {
      this.window = undefined;
      let totalWindows = BrowserWindow.getAllWindows();
      for (let window of totalWindows) window.close();
    })

    this.initWindowEvents();
    this.initEvents();
  }

  private initWindowEvents():void {
    let timing;

    this.window.on('focus', event => this.window.webContents.send('hasLooseFocus', false));
    this.window.on('blur', event => this.window.webContents.send('hasLooseFocus', true));

    this.window.on('resize', event => {
      const size = this.window.getBounds();
      clearTimeout(timing);
      timing = setTimeout(() => this.storage.set({ width: size.width, height: size.height }, 'size'), 300);
    })

    this.window.on('move', event => {
      const pos = this.window.getBounds();
      clearTimeout(timing);
      timing = setTimeout(() => this.storage.set({ x: pos.x, y: pos.y }, 'pos'), 300);
    })
  }

  private initEvents():void {
    let opacity, shading;

    this.util.eventEmitter.on('changeColor', color => {
      this.window.webContents.send('changeColor', color);
    })
  
    ipcMain.on('init-colorpicker', event => {
      let config = {
        color: this.storage.has('lastColor') ? this.storage.get('lastColor') : '#00AEEF',
        posButton: this.storage.get('buttonsPosition'),
        typeButton:  this.storage.get('buttonsType'),
        tools: this.storage.get('tools'),
        colorfullApp: this.storage.get('colorfullApp'),
        history: this.storage.get('history')
      }
  
      event.sender.send('init', config);
    })
  
    ipcMain.on('changeLastColor', (event, color) => {
      this.storage.set('lastColor', color);
    })
  
    ipcMain.on('saveColor', (event, color) => {
      let colorsbook = this.storage.get('colors', 'colorsbook')
      colorsbook[Object.getOwnPropertyNames(colorsbook)[Object.values(colorsbook).length - 1]].push(color)
      this.storage.set('colors', colorsbook, 'colorsbook')
    })
  
    ipcMain.on('changeHistory', (event, array) => {
      this.storage.set('history', array)
      this.util.eventEmitter.emit('updateHistory', array)
    })
  
    ipcMain.on('opacityActive', (event, bool) => {
      opacity = bool;
      let size = this.window.getSize()
      if (!opacity && shading) return this.window.setMinimumSize(440, 220)
      if (!opacity) return this.window.setMinimumSize(440, 150)
      if (size[1] < 180 && !shading) this.window.setSize(size[0], 180, true)
      if (size[1] < 255 && shading) this.window.setSize(size[0], 255, true)
      if (!shading) this.window.setMinimumSize(440, 180)
      else this.window.setMinimumSize(440, 255)
    })
  
    ipcMain.on('shadingActive', (event, bool) => {
      shading = bool
      let size = this.window.getSize()
      if (!shading && !opacity) return this.window.setMinimumSize(440, 150)
      if (!shading && opacity) return this.window.setMinimumSize(440, 180)
      if (size[1] < 220 && !opacity) this.window.setSize(size[0], 220, true)
      if (size[1] < 255 && opacity) this.window.setSize(size[0], 255, true)
      if (!opacity) this.window.setMinimumSize(440, 220)
      else this.window.setMinimumSize(440, 255)
    })
  
    ipcMain.on('minimize-colorpicker', event => this.window.minimize())
    ipcMain.on('maximize-colorpicker', event => {
      if (this.window.isMaximized()) return this.window.unmaximize()
      else return this.window.maximize()
    })
    ipcMain.on('close-colorpicker', event => this.window.close())
    ipcMain.on('setOnTop', (event, bool) => this.window.setAlwaysOnTop(bool))

    //ipcMain.on('launchPicker', event => picker.init())
    //this.eventEmitter.on('launchPicker', event => picker.init())
    //ipcMain.on('launchColorsbook', event => colorsbook.init())
    //this.eventEmitter.on('launchColorsbook', event => colorsbook.init())
    //ipcMain.on('showPreferences', event => settings.init())
    //this.eventEmitter.on('showPreferences', event => settings.init())
  }
}