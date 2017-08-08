'use strict'

const robot = require('robotjs')
const {BrowserWindow, ipcMain} = require('electron')

module.exports = (dirname, storage) => {
  let win

  ipcMain.on('picker', event => {
    let color = getColor()
    event.sender.send('picker', color)
  })

  let init = () => {
    if (win === null || win === undefined) {
      createWindow(484, 190)
    }
  }

  let getColor = () => {
    let mouse = robot.getMousePos()
    let hex = robot.getPixelColor(mouse.x, mouse.y)
    // console.log("#" + hex + " at x:" + mouse.x + " y:" + mouse.y)
    return '#' + hex
  }

  let createWindow = (width, height) => {
    win = new BrowserWindow({
      frame: false,
      'auto-hide-menu-bar': true,
      width: 100,
      height: 100,
      icon: `${dirname}/build/logo.png`
    })

    win.loadURL(`file://${dirname}/views/picker.html`)

    win.on('closed', () => {
      win = undefined
    })
  }

  return {
    init: init,
    getColor: getColor
  }
}
