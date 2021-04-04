'use strict'
/*using electron to set constants of ipcMain(event Emmiter), BrowserWindow(creates window without 
chrome, and app(native application)*/
const {ipcMain, BrowserWindow, app} = require('electron')

module.exports = (storage, browsers, eventEmitter) => {
  const {colorpicker, settings, picker, colorsbook} = browsers
  let win, opacity, shading

  eventEmitter.on('changeColor', color => {
    win.webContents.send('changeColor', color)
  })

//setting inital configured values
  ipcMain.on('init-colorpicker', event => {
    win = colorpicker.getWindow()
    let config = {
      color: storage.get('lastColor') ? storage.get('lastColor') : '#00AEEF',
      posButton: storage.get('buttonsPosition'),
      typeButton:  storage.get('buttonsType'),
      tools: storage.get('tools'),
      colorfullApp: storage.get('colorfullApp'),
      history: storage.get('history')
    }

    event.sender.send('init', config)
  })

//changing the last color set
  ipcMain.on('changeLastColor', (event, color) => {
    storage.add({'lastColor': color})
  })

//save colour to colorsbook extension
  ipcMain.on('saveColor', (event, color) => {
    let colorsbook = storage.get('colors', 'colorsbook')
    colorsbook[Object.getOwnPropertyNames(colorsbook)[Object.values(colorsbook).length - 1]].push(color)
    storage.add({colors: colorsbook}, 'colorsbook')
  })

//update history when a change occurs
  ipcMain.on('changeHistory', (event, array) => {
    storage.add({'history': array})
    eventEmitter.emit('updateHistory', array)
  })

//set opacity when event is called
  ipcMain.on('opacityActive', (event, bool) => {
    opacity = bool
    let size = win.getSize()
    if (!opacity && shading) return win.setMinimumSize(440, 220)
    if (!opacity) return win.setMinimumSize(440, 150)
    if (size[1] < 180 && !shading) win.setSize(size[0], 180, true)
    if (size[1] < 255 && shading) win.setSize(size[0], 255, true)
    if (!shading) win.setMinimumSize(440, 180)
    else win.setMinimumSize(440, 255)
  })

//set shading when event is called
  ipcMain.on('shadingActive', (event, bool) => {
    shading = bool
    let size = win.getSize()
    if (!shading && !opacity) return win.setMinimumSize(440, 150)
    if (!shading && opacity) return win.setMinimumSize(440, 180)
    if (size[1] < 220 && !opacity) win.setSize(size[0], 220, true)
    if (size[1] < 255 && opacity) win.setSize(size[0], 255, true)
    if (!opacity) win.setMinimumSize(440, 220)
    else win.setMinimumSize(440, 255)
  })

//minimze application when event is called
  ipcMain.on('minimize-colorpicker', event => win.minimize())
  ipcMain.on('maximize-colorpicker', event => {
    if (win.isMaximized()) return win.unmaximize()
    else return win.maximize()
  })

  //associating events with functions
  ipcMain.on('close-colorpicker', event => win.close())
  ipcMain.on('setOnTop', (event, bool) => win.setAlwaysOnTop(bool))
  ipcMain.on('launchPicker', event => picker.init())
  eventEmitter.on('launchPicker', event => picker.init())
  ipcMain.on('launchColorsbook', event => colorsbook.init())
  eventEmitter.on('launchColorsbook', event => colorsbook.init())
  ipcMain.on('showPreferences', event => settings.init())
  eventEmitter.on('showPreferences', event => settings.init())
}
