'use strict'

const {BrowserWindow} = require('electron')

module.exports = (dirname, storage) => {
  let win
  /**
   * [init]
   * @return {void} [new Colorsbook]
   */
  let init = () => {
    if (win === null || win === undefined) createWindow()
    else win.show()
  }

  /**
   * [createWindow - create new Window]
   * @return {void}
   */
  let createWindow = () => {
    win = new BrowserWindow({
      frame: false,
      'auto-hide-menu-bar': true,
      width: 484,
      height: 200,
      icon: `${dirname}/build/logo.png`
    })

    win.loadURL(`file://${dirname}/views/colorsbook.html`)

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
