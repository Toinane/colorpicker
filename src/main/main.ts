require('source-map-support').install()

import { app, Menu, Tray, NativeImage } from 'electron'

import ColorpickerView from './views/colorpickerView'
import ColorsbookView from './views/colorsbookView'
import PickerView from './views/pickerView'
import SettingsView from './views/settingsView'

export default class ColorpickerApp {
  private colorpickerView: ColorpickerView
  private colorsbookView: ColorsbookView
  private pickerView: PickerView
  private settingsView: SettingsView

  private tray?: Tray

  private menuTemplate: Array<object> = [
    {
      label: 'Colorpicker',
      submenu: [
        { label: 'About Colorpicker', 'accelerator': 'Shift+CmdOrCtrl+A', click: () => this.settingsView.createWindow() },
        { label: `Version ${app.getVersion()}`, enabled: false },
        { type: 'separator' },
        { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => this.settingsView.createWindow() },
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
        { label: 'Show Colorpicker', accelerator: 'Shift+CmdOrCtrl+C', click: () => this.colorpickerView.createWindow() },
        { label: 'Show ColorsBook', accelerator: 'Shift+CmdOrCtrl+B', click: () => this.colorsbookView.createWindow() },
        { type: 'separator' },
        { label: 'Save Color', accelerator: 'CmdOrCtrl+S', click: () => this.colorpickerView.sendEvent('shortSave') },
        { type: 'separator' },
        { label: 'Copy Hex Color', accelerator: 'CmdOrCtrl+W', click: () => this.colorpickerView.sendEvent('shortCopyHex') },
        { label: 'Copy RGB(a) Color', accelerator: 'Shift+CmdOrCtrl+W', click: () => this.colorpickerView.sendEvent('shortCopyRGB') },
        { type: 'separator' },
        { label: 'set Negative Color', accelerator: 'CmdOrCtrl+N', click: () => this.colorpickerView.sendEvent('shortNegative') }
      ]
    }, {
      label: 'Tools',
      submenu: [
        { label: 'Pin to Foreground', accelerator: 'CmdOrCtrl+F', click: () => this.colorpickerView.sendEvent('shortPin') },
        { type: 'separator' },
        { label: 'Pick Color', accelerator: 'CmdOrCtrl+P', click: () => this.pickerView.createWindow() },
        { label: 'Get Clipboard\'s Colors', accelerator: 'Shift+CmdOrCtrl+V', click: () => this.colorpickerView.sendEvent('shortApply') },
        { label: 'Toggle Shading', accelerator: 'CmdOrCtrl+T', click: () => this.colorpickerView.sendEvent('shortShading') },
        { label: 'Toggle Opacity', accelerator: 'CmdOrCtrl+O', click: () => this.colorpickerView.sendEvent('shortOpacity') },
        { label: 'Set Random Color', accelerator: 'CmdOrCtrl+M', click: () => this.colorpickerView.sendEvent('shortRandom') }
      ]
    }
  ]

  constructor () {
    this.colorpickerView = new ColorpickerView()
    this.colorsbookView = new ColorsbookView()
    this.pickerView = new PickerView()
    this.settingsView = new SettingsView()

    if (process.platform === 'linux') {
      app.commandLine.appendSwitch('--enable-transparent-visuals')
      app.disableHardwareAcceleration()
    }

    this.initApplication()
  }

  private initApplication (): void {
    app.on('ready', () => {
      this.createTray()
      this.createMenu()
      this.colorpickerView.createWindow()
    })

    app.on('activate', () => this.colorpickerView.createWindow())

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit()
    })
  }

  private createMenu (): void {
    Menu.setApplicationMenu(Menu.buildFromTemplate(this.menuTemplate))
  }

  private createTray (): Tray {
    if (this.tray) return this.tray

    this.tray = new Tray(`${__dirname}/tray-white.png`)
    this.tray.on('click', event => this.colorpickerView.createWindow())

    return this.tray
  }
}

const application = new ColorpickerApp()
