'use strict'

const {ipcMain} = require('electron')
const robot = require('robotjs')

let size, mouse, color;

let setPickerPosition = picker => {
  let pos = robot.getMousePos()
  if(pos.x >= size.width - 120 && pos.y >= size.height - 120) picker.getWindow().setPosition(pos.x - 140, pos.y - 140)
  else if(pos.x >= size.width - 120) picker.getWindow().setPosition(pos.x - 140, pos.y + 4)
  else if(pos.y >= size.height - 120) picker.getWindow().setPosition(pos.x + 4, pos.y - 140)
  else picker.getWindow().setPosition(pos.x + 4, pos.y + 4)
}

module.exports = (storage, browsers) => {
  const {picker, colorpicker, support} = browsers


  let changePosition = () => {
    const {screen} = require('electron')
    if (!size) size = screen.getPrimaryDisplay().workAreaSize
    if (picker.getWindow()) setPickerPosition(picker)
  }

  ipcMain.on('picker-requested', event => {
    color = storage.get('lastColor')
    event.sender.send('picker-size', storage.get('size', 'picker'))
    support.init()
    changePosition()

    support.getWindow().on('blur', () => {
      support.getWindow().close()
      picker.getWindow().close()
    })
  })

  ipcMain.on('supportMove', event => {
    mouse = robot.getMousePos()
    colorpicker.getWindow().webContents.send('changeColor', '#' + robot.getPixelColor(mouse.x, mouse.y))
    changePosition()
  })

  ipcMain.on('supportClick', event => {
    mouse = robot.getMousePos()
    if (picker.getWindow()) {
      picker.getWindow().close()
      support.getWindow().close()
      colorpicker.getWindow().webContents.send('changeColor', '#' + robot.getPixelColor(mouse.x, mouse.y))
      colorpicker.getWindow().focus()
    }
  })

  ipcMain.on('supportQuit', event => {
    picker.getWindow().close()
    support.getWindow().close()
    colorpicker.getWindow().webContents.send('changeColor', color)
    colorpicker.getWindow().focus()
  })
}
