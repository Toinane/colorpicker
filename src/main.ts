'use strict'

import * as eventEmitter from 'events';
import { app, Tray, Menu, NativeImage } from 'electron';

import Storage from './storage';
import ColorpickerTouchBar from './touchbar';

import ColorpickerWindow from './windows/colorpicker';
import ColorsbookWindow from './windows/colorsbook';
import PickerWindow from './windows/picker';
import PreviewWindow from './windows/preview';
import SettingsWindow from './windows/settings';

export abstract class Colorpicker {
  private dirname: string;
  private eventEmitter: eventEmitter.EventEmitter;
  private storage: Storage;
  private colorpickerTouchBar: ColorpickerTouchBar;
  private colorpickerWindow: ColorpickerWindow;
  private colorsbookWindow: ColorsbookWindow;
  private pickerWindow: PickerWindow;
  private previewWindow: PreviewWindow;
  private settingsWindow: SettingsWindow;

  private tray: Tray;

  constructor() {
    this.dirname = __dirname;
    this.eventEmitter = new eventEmitter();

    this.storage = new Storage();
    this.colorpickerTouchBar = new ColorpickerTouchBar(this.dirname, this.eventEmitter);

    if (process.platform === 'linux') {
      app.commandLine.appendSwitch('--enable-transparent-visuals')
      app.disableHardwareAcceleration()
    }

    this.colorpickerWindow = new ColorpickerWindow(this.dirname, this.storage, {
      eventEmitter: this.eventEmitter,
      touchBar: this.colorpickerTouchBar
    });
    this.colorsbookWindow = new ColorsbookWindow(this.dirname, this.storage);
    this.pickerWindow = new PickerWindow(this.dirname, this.storage);
    this.previewWindow = new PreviewWindow(this.dirname, this.storage);
    this.settingsWindow = new SettingsWindow(this.dirname, this.storage);

    this.initEvents();
  }

  private initEvents(): void {
    app.on('ready', () => {
      this.createTray();
      this.createMenu();
      this.colorpickerWindow.showWindow();
    });

    app.on('activate', () => this.colorpickerWindow.showWindow());

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    });
  }

  private createTray(): Tray {
    const image = NativeImage.createFromPath(`${this.dirname}/ressources/trayTemplate.png`);

    if (this.tray) return this.tray;
    this.tray = new Tray(image);
    this.tray.on('click', event => this.colorpickerWindow.showWindow())

    return this.tray;
  }

  private createMenu(): void {
    const menuTemplate: Array<object> = [
      {
        label: 'Colorpicker',
        submenu: [
          { label: 'About Colorpicker', 'accelerator': 'Shift+CmdOrCtrl+A', click: () => this.settingsWindow.showWindow() },
          { label: `Version ${app.getVersion()}`, enabled: false },
          { type: 'separator' },
          { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => this.settingsWindow.showWindow() },
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
          { label: 'Show Colorpicker', accelerator: 'Shift+CmdOrCtrl+C', click: () => this.colorpickerWindow.showWindow() },
          { label: 'Show ColorsBook', accelerator: 'Shift+CmdOrCtrl+B', click: () => this.colorsbookWindow.showWindow() },
          { type: 'separator' },
          { label: 'Save Color', accelerator: 'CmdOrCtrl+S', click: () => this.colorpickerWindow.getWindow().webContents.send('shortSave') },
          { type: 'separator' },
          { label: 'Copy Hex Color', accelerator: 'CmdOrCtrl+W', click: () => this.colorpickerWindow.getWindow().webContents.send('shortCopyHex') },
          { label: 'Copy RGB(a) Color', accelerator: 'Shift+CmdOrCtrl+W', click: () => this.colorpickerWindow.getWindow().webContents.send('shortCopyRGB') },
          { type: 'separator' },
          { label: 'set Negative Color', accelerator: 'CmdOrCtrl+N', click: () => this.colorpickerWindow.getWindow().webContents.send('shortNegative') }
        ]
      }, {
        label: 'Tools',
        submenu: [
          { label: 'Pin to Foreground', accelerator: 'CmdOrCtrl+F', click: () => this.colorpickerWindow.getWindow().webContents.send('shortPin') },
          { type: 'separator' },
          { label: 'Pick Color', accelerator: 'CmdOrCtrl+P', click: () => this.pickerWindow.showWindow() },
          { label: 'Get Clipboard\'s Colors', accelerator: 'Shift+CmdOrCtrl+V', click: () => this.colorpickerWindow.getWindow().webContents.send('shortApply') },
          { label: 'Toggle Shading', accelerator: 'CmdOrCtrl+T', click: () => this.colorpickerWindow.getWindow().webContents.send('shortShading') },
          { label: 'Toggle Opacity', accelerator: 'CmdOrCtrl+O', click: () => this.colorpickerWindow.getWindow().webContents.send('shortOpacity') },
          { label: 'Set Random Color', accelerator: 'CmdOrCtrl+M', click: () => this.colorpickerWindow.getWindow().webContents.send('shortRandom') }
        ]
      }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  }

}