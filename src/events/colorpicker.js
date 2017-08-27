'use strict'

const {ipcMain, BrowserWindow, app} = require('electron')

module.exports = (storage, browsers) => {
  const {colorpicker, settings, picker, colorsbook} = browsers
  let win, timing, opacity, shading

  ipcMain.on('init-colorpicker', event => {
    win = colorpicker.getWindow()
    let config = {}
    config.color = storage.get('lastColor') ? storage.get('lastColor') : '#00AEEF'
    config.posButton = storage.get('buttonsPosition')
    config.typeButton = storage.get('buttonsType')
    config.tools = storage.get('tools')

    event.sender.send('init', config)
  })

  ipcMain.on('changeLastColor', (event, color) => {
    clearTimeout(timing)
    timing = setTimeout(() => storage.add({'lastColor': color}), 300)
  })

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

  ipcMain.on('minimize-colorpicker', event => win.minimize())
  ipcMain.on('maximize-colorpicker', (event, bool) => {
    if (bool) return win.maximize()
    return win.unmaximize()
  })
  ipcMain.on('close-colorpicker', event => win.close())
  ipcMain.on('setOnTop', (event, bool) => win.setAlwaysOnTop(bool))
  ipcMain.on('launchPicker', event => picker.init())
  ipcMain.on('launchColorsbook', event => colorsbook.init())
  ipcMain.on('showPreferences', event => settings.init())
}
