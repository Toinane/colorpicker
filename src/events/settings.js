'use strict'

  const {ipcMain, BrowserWindow, app} = require('electron')

module.exports = (storage, browsers) => {
  const {colorpicker, picker, colorsbook} = browsers

  ipcMain.on('init-settings', event => {
    let config = {
      version: app.getVersion()
    }
    config.tools = storage.get('tools')
    config.posButton = storage.get('buttonsPosition')
    config.typeButton = storage.get('buttonsType')
    config.zoomLevel = storage.get('size', 'picker')

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

  ipcMain.on('changeTools', (event, tools) => {
    storage.add({tools: tools})
    colorpicker.getWindow().webContents.send('changeTools', tools)
  })

  ipcMain.on('changeSizePicker', (event, size) => storage.add({size: size}, 'picker'))

}
