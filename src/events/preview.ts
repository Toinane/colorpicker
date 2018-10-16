'use strict'

import {ipcMain, BrowserWindow, app} from 'electron'

module.exports = (storage, browsers) => {
  const {colorpicker, picker, colorsbook} = browsers

  ipcMain.on('init-preview', event => {

  })
}
