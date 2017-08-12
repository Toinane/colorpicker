'use strict'

const {ipcMain, BrowserWindow, app} = require('electron')

module.exports = (storage, browsers) => {
  const {colorpicker, settings, picker, colorsbook} = browsers
  let timing, opacity, shading

  ipcMain.on('init-colorpicker', event => {
    let config = {}
    config.color = storage.get('lastColor').length ? storage.get('lastColor') : '#00AEEF'
    config.posButton = storage.get('buttonsPosition')
    config.typeButton = storage.get('buttonsType')

    event.sender.send('init', config)
  })

  ipcMain.on('changeLastColor', (event, color) => {
    clearTimeout(timing)
    timing = setTimeout(() => storage.add({'lastColor': color}), 300)
  })

  ipcMain.on('opacityActive', (event, bool) => {
    opacity = bool
    let win = colorpicker.getWindow()
    let size = win.getSize()
    if (!opacity && shading) return win.setMinimumSize(440, 250)
    if (!opacity) return win.setMinimumSize(440, 180)
    if (size[1] < 205 && !shading) win.setSize(size[0], 205, true)
    if (size[1] < 300 && shading) win.setSize(size[0], 300, true)
    if (!shading) win.setMinimumSize(440, 205)
    else win.setMinimumSize(440, 300)
  })

  ipcMain.on('shadingActive', (event, bool) => {
    shading = bool
    let win = colorpicker.getWindow()
    let size = win.getSize()
    if (!shading && !opacity) return win.setMinimumSize(440, 180)
    if (!shading && opacity) return win.setMinimumSize(440, 205)
    if (size[1] < 250 && !opacity) win.setSize(size[0], 250, true)
    if (size[1] < 300 && opacity) win.setSize(size[0], 300, true)
    if (!opacity) win.setMinimumSize(440, 250)
    else win.setMinimumSize(440, 300)
  })

  ipcMain.on('minimize', event => colorpicker.getWindow().minimize())
  ipcMain.on('maximize', (event, bool) => {
    if (bool) return colorpicker.getWindow().maximize()
    return colorpicker.getWindow().unmaximize()
  })
  ipcMain.on('close', event => colorpicker.getWindow().close())
  ipcMain.on('setOnTop', (event, bool) => colorpicker.getWindow().setAlwaysOnTop(bool))
  ipcMain.on('launchPicker', event => picker.init())
  ipcMain.on('launchColorsbook', event => colorsbook.init())
  ipcMain.on('showPreferences', event => settings.init())
}
