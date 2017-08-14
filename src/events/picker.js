'use strict'

const {ipcMain} = require('electron')
const robot = require('robotjs')

module.exports = (storage, browsers) => {
  const {picker, colorpicker, support} = browsers

  let sendColors = () => {
    if (picker.getWindow()) {
      let pos = robot.getMousePos()
      let colors = picker.getColors()
      picker.getWindow().setPosition(pos.x + 10, pos.y + 10)
      picker.getWindow().webContents.send('new-colors', colors)
    }
  }

  ipcMain.on('picker-requested', event => {
    support.init()
    sendColors()
  })

  ipcMain.on('supportMove', event => sendColors())

  ipcMain.on('supportClick', event => {
    if (picker.getWindow()) {
      let colors = picker.getColors()
      picker.getWindow().close()
      support.getWindow().close()
      colorpicker.getWindow().webContents.send('changeColor', '#' + colors['#l2-2'])
      colorpicker.getWindow().focus()
    }
  })

  ipcMain.on('supportQuit', event => {
    console.log('quit picker')
    picker.getWindow().close()
    support.getWindow().close()
    colorpicker.getWindow().focus()
  })
}
