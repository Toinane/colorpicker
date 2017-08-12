'use strict'

const {BrowserWindow} = require('electron')

module.exports = (dirname, storage) => {
  let win

  /**
   * [init]
   * @return {void} [new Colorsbook]
   */
  let init = folder => {
    dirname = folder
    if (win === null || win === undefined) createWindow()
    else win.show()
  }

  /**
   * [createWindow - create new Window]
   * @param  {int} width  [width of the window]
   * @param  {int} height [height of the window]
   * @return {void}
   */
  let createWindow = () => {
    win = new BrowserWindow({
      frame: false,
      'auto-hide-menu-bar': true,
      width: 484,
      height: 190,
      icon: `${dirname}/build/logo.png`
    })

    win.loadURL(`file://${dirname}/views/hexacolor.html`)

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