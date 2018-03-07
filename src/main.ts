'use strict'

import * as eventEmitter from 'events';
import {app, Tray, Menu, NativeImage} from 'electron';

import Storage from './storage';
import ColorpickerTouchBar from './touchbar';
import Window from './windows';

export abstract class ColorpickerApp {
  private dirname:string;
  private eventEmitter:eventEmitter.EventEmitter;
  private storage:Storage;
  private colorpickerTouchBar:ColorpickerTouchBar;
  private window:Window;

  private tray:Tray;
  private menuTemplate:Array<object> = [
    {
      label: 'Colorpicker',
      submenu: [
        { label: 'About Colorpicker', 'accelerator': 'Shift+CmdOrCtrl+A', click: () => settings.init() },
        { label: `Version ${app.getVersion()}`, enabled: false },
        { type: 'separator' },
        { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => settings.init() },
        { type: 'separator' },
        { label: 'Hide Colorpicker', accelerator: 'CmdOrCtrl+H', role: 'minimize' },
        {
          label: 'Developer',
          submenu: [
            { label: 'Toggle Devtools', accelerator: 'CmdOrCtrl+Alt+I', role: 'toggledevtools' },
            { label: 'Reload Window', accelerator: 'CmdOrCtrl+R', role: 'reload' }
          ]
        },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    }, {
      label: 'Edit', role: 'editMenu'
    }, {
      label: 'View',
      submenu: [
        { label: 'Show Colorpicker', accelerator: 'Shift+CmdOrCtrl+C', click: () => colorpicker.init() },
        { label: 'Show ColorsBook', accelerator: 'Shift+CmdOrCtrl+B', click: () => colorsbook.init() },
        { type: 'separator' },
        { label: 'Save Color', accelerator: 'CmdOrCtrl+S', click: () => colorpicker.getWindow().webContents.send('shortSave') },
        { type: 'separator' },
        { label: 'Copy Hex Color', accelerator: 'CmdOrCtrl+W', click: () => colorpicker.getWindow().webContents.send('shortCopyHex') },
        { label: 'Copy RGB(a) Color', accelerator: 'Shift+CmdOrCtrl+W', click: () => colorpicker.getWindow().webContents.send('shortCopyRGB') },
        { type: 'separator' },
        { label: 'set Negative Color', accelerator: 'CmdOrCtrl+N', click: () => colorpicker.getWindow().webContents.send('shortNegative') }
      ]
    }, {
      label: 'Tools',
      submenu: [
        { label: 'Pin to Foreground', accelerator: 'CmdOrCtrl+F', click: () => colorpicker.getWindow().webContents.send('shortPin') },
        { type: 'separator' },
        { label: 'Pick Color', accelerator: 'CmdOrCtrl+P', click: () => picker.init() },
        { label: 'Get Clipboard\'s Colors', accelerator: 'Shift+CmdOrCtrl+V', click: () => colorpicker.getWindow().webContents.send('shortApply') },
        { label: 'Toggle Shading', accelerator: 'CmdOrCtrl+T', click: () => colorpicker.getWindow().webContents.send('shortShading') },
        { label: 'Toggle Opacity', accelerator: 'CmdOrCtrl+O', click: () => colorpicker.getWindow().webContents.send('shortOpacity') },
        { label: 'Set Random Color', accelerator: 'CmdOrCtrl+M', click: () => colorpicker.getWindow().webContents.send('shortRandom') }
      ]
    }
  ];

  constructor() {
    this.dirname = __dirname;
    this.eventEmitter = new eventEmitter();

    this.storage = new Storage();
    this.colorpickerTouchBar = new ColorpickerTouchBar(this.dirname, this.eventEmitter);
    this.window = new Window(this.dirname, this.storage, {
      touchBar: this.colorpickerTouchBar,
      eventEmitter: this.eventEmitter
    });

    if (process.platform === 'linux') {
      app.commandLine.appendSwitch('--enable-transparent-visuals')
      app.disableHardwareAcceleration()
    }

    this.initEvents();
  }

  private initEvents():void {
    app.on('ready', () => {
      this.createTray();
      this.createMenu();
      this.window.colorpicker.init();
    });

    app.on('activate', () => colorpicker.init());
    
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    });
  }

  private createTray():Tray {
    const image = NativeImage.createFromPath(`${this.dirname}/ressources/trayTemplate.png`);

    if (this.tray) return this.tray;
    this.tray = new Tray(image);
    this.tray.on('click', event => colorpicker.init())

    return this.tray;
  }

  private createMenu():void {
    Menu.setApplicationMenu(Menu.buildFromTemplate(this.menuTemplate))
  }

}