'use strict'

const {BrowserWindow} = require('electron')

module.exports = (dirname, storage) => {
  let win

  /**
   * [init]
   * @param {boolean} force [force launching new window]
   * @return {void} [new Colorpicker]
   */
  let init = () => {
    if (win === null || win === undefined) createWindow()
    else win.show()
  }

  /**
   * [createWindow - create new Window]
   * @param  {int} width  [width of the window]
   * @param  {int} height [height of the window]
   * @return {void}
   */
  let createWindow = (width, height, x, y) => {
    let options = {
      width: 400,
      height: 300,
      transparent: true,
      resizable: false,
      fullscreenable: false,
      vibrancy: 'light',
      icon: `${dirname}/build/logo.png`
    }
    if (x && y) { options.x = x; options.y = y }

    win = new BrowserWindow(options)
    win.loadURL(`file://${dirname}/views/about.html`)

    win.on('closed', () => {
      win = undefined
    })
  }

  return {
    init: init
  }
}
