'use strict'

const {ipcMain} = require('electron')
const robot = require('robotjs')

let colors, size;

let getColors = () => {
  let mouse = robot.getMousePos()
  if (mouse.x <= 2 || mouse.x >= size.width - 2) return colors
  if (mouse.y <= 2 || mouse.y >= size.height) return colors

  colors = {
    '#l0-0': robot.getPixelColor(mouse.x-2, mouse.y-2),
    '#l0-1': robot.getPixelColor(mouse.x-1, mouse.y-2),
    '#l0-2': robot.getPixelColor(mouse.x, mouse.y-2),
    '#l0-3': robot.getPixelColor(mouse.x+1, mouse.y-2),
    '#l0-4': robot.getPixelColor(mouse.x+2, mouse.y-2),
    '#l1-0': robot.getPixelColor(mouse.x-2, mouse.y-1),
    '#l1-1': robot.getPixelColor(mouse.x-1, mouse.y-1),
    '#l1-2': robot.getPixelColor(mouse.x, mouse.y-1),
    '#l1-3': robot.getPixelColor(mouse.x+1, mouse.y-1),
    '#l1-4': robot.getPixelColor(mouse.x+2, mouse.y-1),
    '#l2-0': robot.getPixelColor(mouse.x-2, mouse.y),
    '#l2-1': robot.getPixelColor(mouse.x-1, mouse.y),
    '#l2-2': robot.getPixelColor(mouse.x, mouse.y),
    '#l2-3': robot.getPixelColor(mouse.x+1, mouse.y),
    '#l2-4': robot.getPixelColor(mouse.x+2, mouse.y),
    '#l3-0': robot.getPixelColor(mouse.x-2, mouse.y+1),
    '#l3-1': robot.getPixelColor(mouse.x-1, mouse.y+1),
    '#l3-2': robot.getPixelColor(mouse.x, mouse.y+1),
    '#l3-3': robot.getPixelColor(mouse.x+1, mouse.y+1),
    '#l3-4': robot.getPixelColor(mouse.x+2, mouse.y+1),
    '#l4-0': robot.getPixelColor(mouse.x-2, mouse.y+2),
    '#l4-1': robot.getPixelColor(mouse.x-1, mouse.y+2),
    '#l4-2': robot.getPixelColor(mouse.x, mouse.y+2),
    '#l4-3': robot.getPixelColor(mouse.x+1, mouse.y+2),
    '#l4-4': robot.getPixelColor(mouse.x+2, mouse.y+2)
  }
  return colors
}

let setPickerPosition = picker => {
  let pos = robot.getMousePos()
  if(pos.x >= size.width - 120 && pos.y >= size.height - 120) picker.getWindow().setPosition(pos.x - 120, pos.y - 120)
  else if(pos.x >= size.width - 120) picker.getWindow().setPosition(pos.x - 120, pos.y + 10)
  else if(pos.y >= size.height - 120) picker.getWindow().setPosition(pos.x + 10, pos.y - 120)
  else picker.getWindow().setPosition(pos.x + 10, pos.y + 10)
}

module.exports = (storage, browsers) => {
  const {picker, colorpicker, support} = browsers

  let sendColors = () => {
    const {screen} = require('electron')
    if (!size) size = screen.getPrimaryDisplay().workAreaSize
    if (picker.getWindow()) {
      let colors = getColors()
      setPickerPosition(picker)
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
      let colors = getColors()
      picker.getWindow().close()
      support.getWindow().close()
      colorpicker.getWindow().webContents.send('changeColor', '#' + colors['#l2-2'])
      colorpicker.getWindow().focus()
    }
  })

  ipcMain.on('supportQuit', event => {
    picker.getWindow().close()
    support.getWindow().close()
    colorpicker.getWindow().focus()
  })
}
