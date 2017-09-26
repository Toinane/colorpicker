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
      }
    }
    config.tools = storage.get('tools')
    config.posButton = storage.get('buttonsPosition')
    config.typeButton = storage.get('buttonsType')
    config.realtime = storage.get('realtime', 'picker')

    event.sender.send('init', config)
  })

  ipcMain.on('set-position', (event, position) => {
    storage.add({buttonsPosition: position})
    colorpicker.getWindow().webContents.send('changePosition', position)
  })

  ipcMain.on('set-type-icon', (event, type) => {
    storage.add({buttonsType: type})
    colorpicker.getWindow().webContents.send('changeTypeIcons', type)
  })

  ipcMain.on('set-realtime', (event, bool) => storage.add({realtime: bool}, 'picker'))

  ipcMain.on('changeTools', (event, tools) => {
    storage.add({tools: tools})
    colorpicker.getWindow().webContents.send('changeTools', tools)
  })


}
