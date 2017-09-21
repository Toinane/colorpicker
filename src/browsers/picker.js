'use strict'

const {BrowserWindow} = require('electron')

module.exports = (dirname, storage) => {
  let win, colors

  let init = () => {
    if (win === null || win === undefined) {
      createWindow()
    }
  }

  let createWindow = () => {
    win = new BrowserWindow({
      frame: false,
      autoHideMenuBar: true,
      width: 140,
      height: 140,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      focusable: false,
      icon: `${dirname}/build/icon.png`,
      webPreferences: {
        experimentalFeatures: true
      }
    })

    win.loadURL(`file://${dirname}/views/picker.html`)
    win.openDevTools()
    win.on('closed', () => {
      win = undefined
    })
  }

  let getWindow = () => win

  return {
    init: init,
    getWindow: getWindow
  }
}
