'use strict'

const {BrowserWindow} = require('electron')

module.exports = (dirname, storage) => {
  let win

  let init = () => {
    if (win === null || win === undefined) {
      createWindow()
    }
  }

  let createWindow = () => {
    const {screen} = require('electron')
    const {width, height} = screen.getPrimaryDisplay().workAreaSize
    win = new BrowserWindow({
      frame: false,
      'auto-hide-menu-bar': true,
      width: width,
      height: height,
      transparent: true,
      alwaysOnTop: true,
      focusable: false,
      icon: `${dirname}/build/logo.png`
    })

    win.loadURL(`file://${dirname}/views/support.html`)
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
