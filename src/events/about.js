'use strict'

const {ipcMain, app} = require('electron')
const request = require('request')

module.exports = (storage, browsers) => {

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
}
