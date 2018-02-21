'use strict'

const {ipcMain, BrowserWindow, app, Notification, shell} = require('electron')
const request = require('request')

module.exports = (storage, browsers) => {
  const {colorpicker, picker, colorsbook} = browsers

  ipcMain.on('init-settings', event => {
    let config = {
      versions: {
        colorpicker: app.getVersion(),
        node: process.versions.node,
        electron: process.versions.electron,
        v8: process.versions.v8,
        chrome: process.versions.chrome
      },
      posButton: storage.get('buttonsPosition'),
      typeButton:  storage.get('buttonsType'),
      tools: storage.get('tools'),
      realtime: storage.get('realtime', 'picker'),
      colorfullApp: storage.get('colorfullApp')
    }

    event.sender.send('init', config)
    event.sender.send('export', storage.get('colors', 'colorsbook'))
    updateApp(event);
  })

  ipcMain.on('set-position', (event, position) => {
    storage.add({buttonsPosition: position})
    colorpicker.getWindow().webContents.send('changePosition', position)
  })

  ipcMain.on('set-type-icon', (event, type) => {
    storage.add({buttonsType: type})
    colorpicker.getWindow().webContents.send('changeTypeIcons', type)
  })

  ipcMain.on('set-colorfull-app', (event, bool) => {
    storage.add({colorfullApp: bool})
    colorpicker.getWindow().webContents.send('changeColorfullApp', bool)
  })

  ipcMain.on('set-realtime', (event, bool) => storage.add({realtime: bool}, 'picker'))

  ipcMain.on('changeTools', (event, tools) => {
    storage.add({tools: tools})
    colorpicker.getWindow().webContents.send('changeTools', tools)
  })

  ipcMain.on('resetPreferences', () => {
    storage.reset()
    app.relaunch({args: process.argv.slice(1).concat(['--reset'])})
    app.exit(0)
  })

  function updateApp(event) {
    const options = {
      url: 'https://crea-th.at/p/colorpicker/release.json',
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'user-agent': `colorpicker-${app.getVersion()}`
      }
    }
    let message = '<i class="fa fa-ban"></i> Can\'t connect to server, check manually <span data-link="https://colorpicker.crea-th.at">here</span>'
    request(options, (err, res, body) => {
      if (err) return event.sender.send('update', message)
      let update = JSON.parse(body)
      if (update === undefined || update === null) return event.sender.send('update', message)
      if (update.release <= '0') return event.sender.send('update', '<i class="fa fa-check"></i> You\'re up to date :)!')
      else {
        let notification = new Notification({
          title: 'New update available',
          subtitle: update.release + ' release is available!'
        })
        notification.show()
        notification.on('click', () => {
          shell.openExternal('https://colorpicker.crea-th.at')
        })
        return event.sender.send('update', `<i class="fa fa-exclamation-triangle"></i> New update available <span data-link="${update.link}">here</span>`)
      }
    })
  }


}
