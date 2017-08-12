'use strict'

const {ipcMain} = require('electron')
const robot = require('robotjs')
const ioHook = require('iohook')

ioHook.start()

module.exports = (storage, browsers) => {
  const {picker, colorpicker} = browsers

  let sendColors = () => {
    if (picker.getWindow()) {
      let pos = robot.getMousePos()
      let colors = picker.getColors()
      picker.getWindow().setPosition(pos.x + 10, pos.y + 10)
      picker.getWindow().webContents.send('new-colors', colors)
    }
  }

  ipcMain.on('picker-requested', event => {
    sendColors()
  })

  ioHook.on('mousedrag', event => sendColors())
  //ioHook.on('mousemove', event => sendColors())
  ioHook.on('mouseup', event => {
    if (picker.getWindow()) {
      let colors = picker.getColors()
      picker.getWindow().close()
      colorpicker.getWindow().webContents.send('changeColor', '#' + colors['#l2-2'])
      colorpicker.getWindow().focus()
    }
  })

}
