'use strict'

  const {ipcMain, BrowserWindow, app} = require('electron')

module.exports = (storage, browsers) => {
  const {colorpicker, picker, colorsbook} = browsers

  ipcMain.on('init-settings', event => {
    let config = {
      version: app.getVersion()
    }
    config.posButton = storage.get('buttonsPosition')
    config.typeButton = storage.get('buttonsType')

    event.sender.send('init', config)
  })

}
