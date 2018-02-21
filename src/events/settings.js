'use strict'

  const {ipcMain, BrowserWindow, app} = require('electron')

module.exports = (storage, browsers) => {
  const {colorpicker, picker, colorsbook} = browsers

  ipcMain.on('init-settings', event => {
    let config = {
      versions: {
        colorpicker: app.getVersion(),
        node: process.versions.node,
        electron: process.versions.electron,
        v8: process.versions.v8,
        chrome: process.versions.chrome
      },
      posButton: storage.get('buttonsPosition'),
      typeButton:  storage.get('buttonsType'),
      tools: storage.get('tools'),
      realtime: storage.get('realtime', 'picker'),
      colorfullApp: storage.get('colorfullApp')
    }

    event.sender.send('init', config)
    event.sender.send('export', storage.get('colors', 'colorsbook'))
  })

  ipcMain.on('set-position', (event, position) => {
    storage.add({buttonsPosition: position})
    colorpicker.getWindow().webContents.send('changePosition', position)
  })

  ipcMain.on('set-type-icon', (event, type) => {
    storage.add({buttonsType: type})
    colorpicker.getWindow().webContents.send('changeTypeIcons', type)
  })

  ipcMain.on('set-colorfull-app', (event, bool) => {
    storage.add({colorfullApp: bool})
    colorpicker.getWindow().webContents.send('changeColorfullApp', bool)
  })

  ipcMain.on('set-realtime', (event, bool) => storage.add({realtime: bool}, 'picker'))

  ipcMain.on('changeTools', (event, tools) => {
    storage.add({tools: tools})
    colorpicker.getWindow().webContents.send('changeTools', tools)
  })

  ipcMain.on('resetPreferences', () => {
    storage.reset()
    app.relaunch({args: process.argv.slice(1).concat(['--reset'])})
    app.exit(0)
  })


}
