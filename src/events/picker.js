'use strict'

const {ipcMain} = require('electron')
const robot = require('robotjs')
const nodeMouse = require('node-mouse')

module.exports = (storage, browsers) => {
  const {picker} = browsers
  const mouse = new nodeMouse()

  let sendColors = () => {
    if(picker.getWindow()) {
      let mouse = robot.getMousePos()
      let colors = picker.getColors()
      picker.getWindow().setPosition(mouse.x + 10, mouse.y + 10)
      picker.getWindow().webContents.send('new-colors', colors)
    }
  }

  ipcMain.on('picker-init', event => sendColors())
  mouse.on('mousemove', event => sendColors())

}
