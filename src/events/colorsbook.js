'use strict'

const {ipcMain, BrowserWindow, app} = require('electron')

module.exports = (storage, browsers) => {
  const {colorpicker, settings, colorsbook} = browsers
  let win

  ipcMain.on('init-colorsbook', event => {
    win = colorsbook.getWindow()
    let config = {}
    config.posButton = storage.get('buttonsPosition')
    config.typeButton = storage.get('buttonsType')

    event.sender.send('init', config)
  })
}
