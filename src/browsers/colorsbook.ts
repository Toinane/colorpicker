'use strict'

import {BrowserWindow} from 'electron'

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
      autoHideMenuBar: true,
      width: 365,
      height: 400,
      minHeight: 285,
      minWidth: 360,
      icon: `${dirname}/assets/icon.png`
    })

    win.loadURL(`file://${dirname}/views/colorsbook.html`)

    win.on('closed', () => {
      win = undefined
    })

    win.on('focus', event => win.webContents.send('hasLooseFocus', false))
    win.on('blur', event => win.webContents.send('hasLooseFocus', true))
  }

  let getWindow = () => win

  return {
    init: init,
    getWindow: getWindow
  }
}
