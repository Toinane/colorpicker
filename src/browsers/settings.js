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
  let createWindow = () => {
    let options = {
      width: 700,
      height: 400,
      resizable: false,
      fullscreenable: false,
      vibrancy: 'light',
      icon: `${dirname}/build/logo.png`
    }

    win = new BrowserWindow(options)
    win.loadURL(`file://${dirname}/views/settings.html`)

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
