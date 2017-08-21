'use strict'

const {app, Tray, Menu} = require('electron')
const storage = require('./storage')
const browsers = require('./browsers')(__dirname, storage)
const {colorpicker, colorsbook, picker, about, settings} = browsers

require('./events')(storage, browsers)

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('--enable-transparent-visuals')
  app.disableHardwareAcceleration()
}

let tray

let createTray = () => {
  if (tray) return
  if (process.platform === 'darwin') tray = new Tray(`${__dirname}/ressources/tray-black@3x.png`)
  if (process.platform === 'win32') tray = new Tray(`${__dirname}/ressources/tray-black@3x.png`) // color here
  if (process.platform === 'linux') tray = new Tray(`${__dirname}/ressources/tray-white@3x.png`)
  if (process.platform === 'darwin') tray.setPressedImage(`${__dirname}/ressources/tray-white@3x.png`)
  tray.on('click', event => colorpicker.init(__dirname))
}

/**
* [setMenu - set new app menu]
* @return {void}
*/
let setMenu = () => {
  let template = [
    {
      label: 'Colorpicker',
      submenu: [
        { label: 'About Colorpicker', 'accelerator': 'Shift+CmdOrCtrl+A', click: () => about.init() },
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
        { label: 'Show ColorsBook', accelerator: 'Shift+CmdOrCtrl+B', click: () => hexacolor.init() },
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
        { label: 'Apply Color from Clipboard', accelerator: 'Shift+CmdOrCtrl+V', click: () => colorpicker.getWindow().webContents.send('shortApply') },
        { label: 'Toggle Shading', accelerator: 'CmdOrCtrl+T', click: () => colorpicker.getWindow().webContents.send('shortShading') },
        { label: 'Toggle Opacity', accelerator: 'CmdOrCtrl+O', click: () => colorpicker.getWindow().webContents.send('shortOpacity') },
        { label: 'Set Random Color', accelerator: 'CmdOrCtrl+M', click: () => colorpicker.getWindow().webContents.send('shortRandom') }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

/**
* [App ready - On app ready]
*/
app.on('ready', () => {
  storage.init().then(() => {
    createTray()
    setMenu()
    colorpicker.init()
  })
})

/**
* [App activate - On app icon clicked]
*/
app.on('activate', () => {
  colorpicker.init()
})

/**
* [App window-all-closed - quit app on all window closed ]
*/
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
