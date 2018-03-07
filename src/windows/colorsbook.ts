'use strict'

import {BrowserWindow, ipcMain} from 'electron';

export default class ColorsbookWindow {
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
    this.window = new BrowserWindow({
      frame: false,
      autoHideMenuBar: true,
      width: 365,
      height: 400,
      minHeight: 285,
      minWidth: 360,
      icon: `${this.dirname}/assets/icon.png`
    })

    this.window.loadURL(`file://${this.dirname}/views/colorsbook.html`)

    this.window.on('closed', () => {
      this.window = undefined;
    })

    this.initWindowEvents();
    this.initEvents();
  }

  private initWindowEvents():void {
    this.window.on('focus', event => this.window.webContents.send('hasLooseFocus', false));
    this.window.on('blur', event => this.window.webContents.send('hasLooseFocus', true));
  }

  private initEvents():void {
    ipcMain.on('init-colorsbook', event => {
      let config = <any>{}

      config.posButton = this.storage.get('buttonsPosition')
      config.typeButton = this.storage.get('buttonsType')
      config.colors = this.storage.get('colors', 'colorsbook')
  
      event.sender.send('init', config)
    })
  
    ipcMain.on('minimize-colorsbook', event => this.window.minimize())
    ipcMain.on('maximize-colorsbook', (event, bool) => {
      if (bool) return this.window.maximize()
      return this.window.unmaximize()
    })
    ipcMain.on('close-colorsbook', event => this.window.close())
  
    ipcMain.on('save-colorsbook', (event, colorsbook) => this.storage.set('colors', colorsbook, 'colorsbook'))
  
    //ipcMain.on('colorsbook-change-color', (event, color) => colorpicker.getWindow().webContents.send('previewColor', color) )
  }
}