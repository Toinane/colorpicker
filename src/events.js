'use strict'

const {ipcMain, BrowserWindow, app} = require('electron')
const request = require('request')

module.exports = storage => {
  let timing, opacity, shading

  ipcMain.on('init-about', event => {
    event.sender.send('init', app.getVersion())
    const options = {
      url: 'https://crea-th.at/p/colorpicker/release.json',
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'user-agent': `colorpicker-${app.getVersion()}`
      }
    }
    let message = '<i class="fa fa-ban"></i> Can\'t connect to server, check manually <span data-link="https://colorpicker/p/colorpicker">here</span>'
    request(options, (err, res, body) => {
      if (err) return event.sender.send('update', message)
      let update = JSON.parse(body)
      if (update === undefined || update === null) return event.sender.send('update', message)
      if (update.release <= app.getVersion()) return event.sender.send('update', '<i class="fa fa-check"></i> You\'re up to date :)!')
      else return event.sender.send('update', `<i class="fa fa-exclamation-triangle"></i> New update available <span data-link="${update.link}">here</span>`)
    })
  })

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
    let win = BrowserWindow.fromWebContents(event.sender)
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
    let win = BrowserWindow.fromWebContents(event.sender)
    let size = win.getSize()
    if (!shading && !opacity) return win.setMinimumSize(440, 150)
    if (!shading && opacity) return win.setMinimumSize(440, 180)
    if (size[1] < 220 && !opacity) win.setSize(size[0], 220, true)
    if (size[1] < 255 && opacity) win.setSize(size[0], 255, true)
    if (!opacity) win.setMinimumSize(440, 220)
    else win.setMinimumSize(440, 255)
  })

  ipcMain.on('minimize', event => BrowserWindow.fromWebContents(event.sender).minimize())
  ipcMain.on('maximize', (event, bool) => {
    if (bool) return BrowserWindow.fromWebContents(event.sender).maximize()
    return BrowserWindow.fromWebContents(event.sender).unmaximize()
  })
  ipcMain.on('close', event => BrowserWindow.fromWebContents(event.sender).close())

  ipcMain.on('setOnTop', (event, bool) => BrowserWindow.fromWebContents(event.sender).setAlwaysOnTop(bool))
}
