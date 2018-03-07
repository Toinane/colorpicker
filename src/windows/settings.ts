'use strict'

import {BrowserWindow, ipcMain, app, Notification, shell} from 'electron';
import request from 'request';

export default class SettingsWindow {
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
      width: 700,
      height: 500,
      minWidth: 460,
      minHeight: 340,
      fullscreenable: false,
      icon: `${this.dirname}/assets/icon.png`
    });

    this.window.loadURL(`file://${this.dirname}/views/settings.html`)

    this.window.on('closed', () => {
      this.window = undefined;
    });

    this.initEvents();
  }

  private initEvents():void {
    ipcMain.on('init-settings', event => {
      let config = {
        versions: {
          colorpicker: app.getVersion(),
          node: process.versions.node,
          electron: process.versions.electron,
          v8: process.versions.v8,
          chrome: process.versions.chrome
        },
        posButton: this.storage.get('buttonsPosition'),
        typeButton:  this.storage.get('buttonsType'),
        tools: this.storage.get('tools'),
        realtime: this.storage.get('realtime', 'picker'),
        colorfullApp: this.storage.get('colorfullApp')
      }
  
      event.sender.send('init', config)
      event.sender.send('export', this.storage.get('colors', 'colorsbook'))
      this.updateApp(event);
    })
  
    ipcMain.on('set-position', (event, position) => {
      this.storage.set('buttonsPosition', position)
      //colorpicker.getWindow().webContents.send('changePosition', position)
    })
  
    ipcMain.on('set-type-icon', (event, type) => {
      this.storage.set('buttonsType', type)
      //colorpicker.getWindow().webContents.send('changeTypeIcons', type)
    })
  
    ipcMain.on('set-colorfull-app', (event, bool) => {
      this.storage.set('colorfullApp', bool)
      //colorpicker.getWindow().webContents.send('changeColorfullApp', bool)
    })
  
    ipcMain.on('set-realtime', (event, bool) => this.storage.set('realtime', bool, 'picker'))
  
    ipcMain.on('changeTools', (event, tools) => {
      this.storage.set('tools', tools)
      //colorpicker.getWindow().webContents.send('changeTools', tools)
    })
  
    ipcMain.on('resetPreferences', () => {
      this.storage.reset()
      app.relaunch({args: process.argv.slice(1).concat(['--reset'])})
      app.exit(0)
    })
  }

  private updateApp(event:Electron.Event):void {
    const options = {
      url: 'https://crea-th.at/p/colorpicker/release.json',
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'user-agent': `colorpicker-${app.getVersion()}`
      }
    }
    let message = '<i class="fa fa-ban"></i> Can\'t connect to server, check manually <span data-link="https://colorpicker.crea-th.at">here</span>'
    request(options, (err, res, body) => {
      if (err) return event.sender.send('update', message)
      let update = JSON.parse(body)
      if (update === undefined || update === null) return event.sender.send('update', message)
      if (update.release <= app.getVersion()) return event.sender.send('update', '<i class="fa fa-check"></i> You\'re up to date :)!')
      else {
        let notification = new Notification({
          title: 'New update available',
          body: 'You can download the lastest version now!',
          subtitle: update.release + ' release is available!'
        })
        notification.show()
        notification.on('click', () => {
          shell.openExternal('https://colorpicker.crea-th.at')
        })
        return event.sender.send('update', `<i class="fa fa-exclamation-triangle"></i> New update available <span data-link="${update.link}">here</span>`)
      }
    })
  }
}