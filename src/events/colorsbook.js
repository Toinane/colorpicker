'use strict'
//extension file to colorpicker.js
const {ipcMain, BrowserWindow, app} = require('electron')

module.exports = (storage, browsers) => {
  const {colorpicker, settings, colorsbook} = browsers
  let win

//configure buttons to saveing a certain value to storage
  ipcMain.on('init-colorsbook', event => {
    win = colorsbook.getWindow()
    let config = {}
    config.posButton = storage.get('buttonsPosition')
    config.typeButton = storage.get('buttonsType')
    config.colors = storage.get('colors', 'colorsbook')

    event.sender.send('init', config)
  })
 //associating minimize events with function
  ipcMain.on('minimize-colorsbook', event => win.minimize())

//maximize the colorbook upon event
  ipcMain.on('maximize-colorsbook', (event, bool) => {
    if (bool) return win.maximize()
    return win.unmaximize()
  })

  //associating more events with functions
  ipcMain.on('close-colorsbook', event => win.close())
  ipcMain.on('save-colorsbook', (event, colorsbook) => storage.add({colors: colorsbook}, 'colorsbook'))
  ipcMain.on('colorsbook-change-color', (event, color) => colorpicker.getWindow().webContents.send('previewColor', color) )
}
