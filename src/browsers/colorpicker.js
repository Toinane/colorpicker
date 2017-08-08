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
    const size = storage.get('size')
    const pos = storage.get('pos')
    const frame = storage.get('frame')
    if (win === null || win === undefined) createWindow(size.width, size.height, pos.x, pos.y, frame)
    else win.show()
  }

  /**
   * [createWindow - create new Window]
   * @param  {int} width  [width of the window]
   * @param  {int} height [height of the window]
   * @return {void}
   */
  let createWindow = (width, height, x, y, frame) => {
    console.log(frame)
    let options = {
      frame: frame,
      'auto-hide-menu-bar': true,
      width: width,
      height: height,
      minWidth: 440,
      minHeight: 150,
      transparent: true,
      experimentalFeatures: true,
      icon: `${dirname}/build/logo.png`
    }
    if (x && y) { options.x = x; options.y = y }

    win = new BrowserWindow(options)
    win.loadURL(`file://${dirname}/views/colorpicker.html`)

    win.on('closed', () => {
      win = undefined
    })

    windowEvents(win)
  }

  /**
   * [windowEvents - BrowserWindow events]
   * @param  {BrowserWindow} win [current window]
   * @return {void}
   */
  let windowEvents = win => {
    let timing

    win.on('resize', event => {
      const size = win.getBounds()
      clearTimeout(timing)
      timing = setTimeout(() => storage.add({size: { width: size.width, height: size.height }}), 300)
    })

    win.on('move', event => {
      const pos = win.getBounds()
      clearTimeout(timing)
      timing = setTimeout(() => storage.add({pos: { x: pos.x, y: pos.y }}), 300)
    })
  }

  return {
    init: init
  }
}
