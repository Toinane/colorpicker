'use strict'

import {BrowserWindow} from 'electron';

export default class PreviewWindow {
  private dirname:string;
  private storage:Colorpicker.Storage;
  private window:BrowserWindow;

  constructor(dirname:string, storage:Colorpicker.Storage) {
    this.dirname = dirname;
    this.storage = storage;
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
      width: 400,
      height: 300,
      resizable: false,
      fullscreenable: false,
      icon: `${this.dirname}/assets/icon.png`
    });

    this.window.loadURL(`file://${this.dirname}/views/preview.html`)

    this.window.on('closed', () => {
      this.window = undefined;
    });
  }
}