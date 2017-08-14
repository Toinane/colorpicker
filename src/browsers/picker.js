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
      'auto-hide-menu-bar': true,
      width: 110,
      height: 110,
      transparent: true,
      alwaysOnTop: true,
      focusable: false,
      icon: `${dirname}/build/logo.png`
    })

    win.loadURL(`file://${dirname}/views/picker.html`)
    //win.openDevTools()
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
