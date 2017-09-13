'use strict'

const {BrowserWindow} = require('electron')

module.exports = (dirname, storage) => {
  let win

  /**
   * [init]
   * @param {boolean} force [force launching new window]
   * @return {void} [new Colorpicker]
   */
  let init = touchbar => {
    const size = storage.get('size')
    if (win === null || win === undefined) createWindow(size.width, size.height, touchbar)
    else win.show()
  }

  /**
   * [createWindow - create new Window]
   * @param  {int} width  [width of the window]
   * @param  {int} height [height of the window]
   * @return {void}
   */
  let createWindow = (width, height, touchbar) => {
    const pos = storage.get('pos')
    let options = {
      frame: false,
      'auto-hide-menu-bar': true,
      width: width,
      height: height,
      minWidth: 440,
      minHeight: 150,
      transparent: true,
      icon: `${dirname}/build/icon.png`
    }
    if (pos) { options.x = pos.x; options.y = pos.y }

    win = new BrowserWindow(options)
    win.loadURL(`file://${dirname}/views/colorpicker.html`)

    if (touchbar) win.setTouchBar(touchbar)

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

    win.on('focus', event => win.webContents.send('hasLooseFocus', false))
    win.on('blur', event => win.webContents.send('hasLooseFocus', true))

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

  let getWindow = () => win

  return {
    init: init,
    getWindow: getWindow
  }
}
